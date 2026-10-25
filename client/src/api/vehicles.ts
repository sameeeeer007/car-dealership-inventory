import { api } from "./client";
import type { Vehicle, VehicleInput } from "../types";
export interface VehicleFilters { make?: string; model?: string; category?: string; minPrice?: string; maxPrice?: string }
export const vehicleApi = {
  async list(): Promise<Vehicle[]> { return (await api.get<{vehicles: Vehicle[]}>("/vehicles")).data.vehicles; },
  async search(filters: VehicleFilters): Promise<Vehicle[]> {
    const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== "" && v !== undefined));
    return (await api.get<{vehicles: Vehicle[]}>("/vehicles/search", { params })).data.vehicles;
  },
  async create(input: VehicleInput): Promise<Vehicle> { return (await api.post<{vehicle: Vehicle}>("/vehicles", input)).data.vehicle; },
  async update(id: string, input: Partial<VehicleInput>): Promise<Vehicle> { return (await api.put<{vehicle: Vehicle}>(`/vehicles/${id}`, input)).data.vehicle; },
  async remove(id: string): Promise<void> { await api.delete(`/vehicles/${id}`); },
  async purchase(id: string): Promise<Vehicle> { return (await api.post<{vehicle: Vehicle}>(`/vehicles/${id}/purchase`)).data.vehicle; },
  async restock(id: string, quantity: number): Promise<Vehicle> { return (await api.post<{vehicle: Vehicle}>(`/vehicles/${id}/restock`, { quantity })).data.vehicle; }
};
