import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VehicleCard } from "./VehicleCard";
import type { Vehicle } from "../types";

const base: Vehicle = { _id: "abc", make: "Toyota", model: "Corolla", category: "Sedan", price: 25000, quantity: 1, createdAt: "", updatedAt: "" };
describe("VehicleCard", () => {
  it("renders vehicle details and purchase action", () => {
    render(<VehicleCard vehicle={base} onPurchase={vi.fn()} isAdmin={false}/>);
    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Corolla")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /purchase/i })).toBeEnabled();
  });
  it("disables purchase when inventory is zero", () => {
    render(<VehicleCard vehicle={{...base, quantity: 0}} onPurchase={vi.fn()} isAdmin={false}/>);
    expect(screen.getByRole("button", { name: /out of stock/i })).toBeDisabled();
  });
  it("calls purchase with vehicle id", async () => {
    const user = userEvent.setup(); const purchase = vi.fn();
    render(<VehicleCard vehicle={base} onPurchase={purchase} isAdmin={false}/>);
    await user.click(screen.getByRole("button", { name: /purchase/i }));
    expect(purchase).toHaveBeenCalledWith("abc");
  });
});
