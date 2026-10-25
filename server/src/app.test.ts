import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "./app.js";
import { User } from "./models/user.model.js";
import { Vehicle } from "./models/vehicle.model.js";

import { signToken } from "./services/auth.service.js";

let mongo: MongoMemoryServer;
let userToken = "";
let adminToken = "";
let vehicleId = "";

async function register(email: string, role: "user" | "admin") {
  const response = await request(app).post("/api/auth/register").send({
    email, password: "StrongPass9!", role
  });
  return response;
}
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await User.deleteMany({});
  await Vehicle.deleteMany({});
  const user = await register("user@example.com", "user");
  await register("admin@example.com", "admin");
  await User.updateOne({ email: "admin@example.com" }, { role: "admin" });
  const adminDoc = await User.findOne({ email: "admin@example.com" });
  userToken = user.body.token;
  adminToken = signToken({ userId: adminDoc!.id, role: "admin" });
  const vehicle = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${adminToken}`)
    .send({ make: "Toyota", model: "Corolla", category: "Sedan", price: 25000, quantity: 2 });
  vehicleId = vehicle.body.vehicle._id;
});

describe("auth API", () => {
  it("registers and returns a token", async () => {
    const res = await register("new@example.com", "user");
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
  });
  it("rejects duplicate email", async () => {
    expect((await register("user@example.com", "user")).status).toBe(409);
  });
  it("logs in with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "user@example.com", password: "StrongPass9!" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
  it("rejects invalid credentials", async () => {
    expect((await request(app).post("/api/auth/login").send({ email: "user@example.com", password: "nope" })).status).toBe(401);
  });
});
describe("vehicle and inventory API", () => {
  it("requires a bearer token", async () => {
    expect((await request(app).get("/api/vehicles")).status).toBe(401);
  });
  it("lists and searches vehicles", async () => {
    const list = await request(app).get("/api/vehicles").set("Authorization", `Bearer ${userToken}`);
    expect(list.status).toBe(200);
    expect(list.body.vehicles).toHaveLength(1);
    const search = await request(app).get("/api/vehicles/search?make=toyota&minPrice=20000&maxPrice=30000")
      .set("Authorization", `Bearer ${userToken}`);
    expect(search.body.vehicles).toHaveLength(1);
  });
  it("creates and updates a vehicle", async () => {
    const created = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${userToken}`)
      .send({ make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 1 });
    expect(created.status).toBe(201);
    const updated = await request(app).put(`/api/vehicles/${created.body.vehicle._id}`)
      .set("Authorization", `Bearer ${userToken}`).send({ price: 23000 });
    expect(updated.status).toBe(200);
    expect(updated.body.vehicle.price).toBe(23000);
  });
  it("purchases only when stock is available", async () => {
    const first = await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set("Authorization", `Bearer ${userToken}`);
    expect(first.status).toBe(200);
    expect(first.body.vehicle.quantity).toBe(1);
  });
  it("prevents overselling when stock is zero", async () => {
    await Vehicle.findByIdAndUpdate(vehicleId, { quantity: 0 });
    const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(409);
  });
  it("blocks non-admin restock and delete", async () => {
    expect((await request(app).post(`/api/vehicles/${vehicleId}/restock`).set("Authorization", `Bearer ${userToken}`).send({ quantity: 3 })).status).toBe(403);
    expect((await request(app).delete(`/api/vehicles/${vehicleId}`).set("Authorization", `Bearer ${userToken}`)).status).toBe(403);
  });
  it("allows admins to restock and delete", async () => {
    const restock = await request(app).post(`/api/vehicles/${vehicleId}/restock`).set("Authorization", `Bearer ${adminToken}`).send({ quantity: 4 });
    expect(restock.status).toBe(200);
    expect(restock.body.vehicle.quantity).toBe(6);
    expect((await request(app).delete(`/api/vehicles/${vehicleId}`).set("Authorization", `Bearer ${adminToken}`)).status).toBe(204);
  });
});
