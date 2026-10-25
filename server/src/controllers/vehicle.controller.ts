import type { Request, Response } from "express";
import { z } from "zod";
import { Vehicle } from "../models/vehicle.model.js";

const vehicleSchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(40),
  price: z.number().finite().nonnegative(),
  quantity: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional().or(z.literal(""))
});
const updateSchema = vehicleSchema.partial();
const idValid = (id: unknown): id is string => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
const badId = (res: Response) => res.status(400).json({ message: "Invalid vehicle ID" });

export async function listVehicles(_req: Request, res: Response) {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 }).lean();
  return res.json({ vehicles });
}
export async function searchVehicles(req: Request, res: Response) {
  const { make, model, category, minPrice, maxPrice } = req.query;
  const filter: Record<string, unknown> = {};
  if (typeof make === "string" && make.trim()) filter.make = { $regex: escapeRegex(make.trim()), $options: "i" };
  if (typeof model === "string" && model.trim()) filter.model = { $regex: escapeRegex(model.trim()), $options: "i" };
  if (typeof category === "string" && category.trim()) filter.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: "i" };
  const min = minPrice === undefined ? undefined : Number(minPrice);
  const max = maxPrice === undefined ? undefined : Number(maxPrice);
  if ((min !== undefined && (!Number.isFinite(min) || min < 0)) || (max !== undefined && (!Number.isFinite(max) || max < 0)) || (min !== undefined && max !== undefined && min > max)) {
    return res.status(400).json({ message: "Invalid price range" });
  }
  if (min !== undefined || max !== undefined) filter.price = { ...(min !== undefined ? { $gte: min } : {}), ...(max !== undefined ? { $lte: max } : {}) };
  return res.json({ vehicles: await Vehicle.find(filter).sort({ createdAt: -1 }).lean() });
}
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function createVehicle(req: Request, res: Response) {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid vehicle data", errors: parsed.error.flatten() });
  return res.status(201).json({ vehicle: await Vehicle.create(parsed.data) });
}
export async function updateVehicle(req: Request, res: Response) {
  if (!idValid(req.params.id)) return badId(res);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) return res.status(400).json({ message: "Invalid vehicle update" });
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  return vehicle ? res.json({ vehicle }) : res.status(404).json({ message: "Vehicle not found" });
}
export async function deleteVehicle(req: Request, res: Response) {
  if (!idValid(req.params.id)) return badId(res);
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  return vehicle ? res.status(204).send() : res.status(404).json({ message: "Vehicle not found" });
}
export async function purchaseVehicle(req: Request, res: Response) {
  if (!idValid(req.params.id)) return badId(res);
  // Atomic conditional update prevents two concurrent requests from selling the final unit.
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, quantity: { $gt: 0 } }, { $inc: { quantity: -1 } }, { new: true }
  );
  if (vehicle) return res.json({ vehicle });
  const exists = await Vehicle.exists({ _id: req.params.id });
  return exists ? res.status(409).json({ message: "Vehicle is out of stock" }) : res.status(404).json({ message: "Vehicle not found" });
}
export async function restockVehicle(req: Request, res: Response) {
  if (!idValid(req.params.id)) return badId(res);
  const parsed = z.object({ quantity: z.number().int().positive().max(100000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "quantity must be a positive integer" });
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { $inc: { quantity: parsed.data.quantity } }, { new: true, runValidators: true });
  return vehicle ? res.json({ vehicle }) : res.status(404).json({ message: "Vehicle not found" });
}
