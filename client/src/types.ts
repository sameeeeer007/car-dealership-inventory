export type UserRole = "user" | "admin";
export interface User { id: string; email: string; role: UserRole }
export interface Vehicle {
  _id: string; make: string; model: string; category: string; price: number;
  quantity: number; imageUrl?: string; createdAt: string; updatedAt: string;
}
export interface VehicleInput { make: string; model: string; category: string; price: number; quantity: number; imageUrl?: string }
