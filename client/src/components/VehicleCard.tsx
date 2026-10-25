import { CarFront, Gauge, PackageCheck, ShoppingCart } from "lucide-react";
import type { Vehicle } from "../types";

export function VehicleCard({ vehicle, onPurchase, onEdit, isAdmin, busy = false }: {
  vehicle: Vehicle; onPurchase(id: string): void; onEdit?(vehicle: Vehicle): void; isAdmin: boolean; busy?: boolean;
}) {
  return <article className="vehicle-card">
    <div className="vehicle-art">
      {vehicle.imageUrl ? <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} /> : <CarFront size={54} strokeWidth={1.2} />}
      <span className="category-pill">{vehicle.category}</span>
    </div>
    <div className="p-5">
      <p className="text-xs uppercase tracking-[.18em] text-slate-400">{vehicle.make}</p>
      <h2 className="mt-1 text-xl font-semibold text-white">{vehicle.model}</h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-white">${vehicle.price.toLocaleString("en-US")}</span>
        <span className={`stock-pill ${vehicle.quantity > 0 ? "stock-in" : "stock-out"}`}><PackageCheck size={14}/>{vehicle.quantity} in stock</span>
      </div>
      <div className="mt-5 flex gap-2">
        <button className="btn-primary flex-1" disabled={vehicle.quantity === 0 || busy} onClick={() => onPurchase(vehicle._id)}><ShoppingCart size={16}/>{vehicle.quantity === 0 ? "Out of stock" : busy ? "Processing…" : "Purchase"}</button>
        {isAdmin && <button className="btn-secondary" onClick={() => onEdit?.(vehicle)} aria-label={`Edit ${vehicle.make} ${vehicle.model}`}><Gauge size={16}/></button>}
      </div>
    </div>
  </article>;
}
