import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, LogOut, CarFront, Plus, RefreshCw, ArrowUpDown, CheckCircle2, Printer } from "lucide-react";
import { vehicleApi } from "../api/vehicles";
import { useAuth } from "../context/AuthContext";
import { VehicleCard } from "../components/VehicleCard";
import type { Vehicle, VehicleInput } from "../types";

interface OrderReceipt {
  orderId: string;
  vehicle: Vehicle;
  timestamp: string;
}

const emptyForm: VehicleInput = { make: "", model: "", category: "SUV", price: 0, quantity: 0, imageUrl: "" };

export function Dashboard() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [budget, setBudget] = useState<"all" | "under-10" | "10-to-20" | "above-20">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "stock">("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VehicleInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setVehicles(await vehicleApi.list());
    } catch {
      setError("Could not load inventory. Check that the API and database are running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => ["All categories", ...new Set(vehicles.map(v => v.category))], [vehicles]);

  const visible = useMemo(() => {
    return vehicles
      .filter(v => {
        const matchesQuery = `${v.make} ${v.model}`.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "All categories" || v.category === category;
        const matchesBudget =
          budget === "all" ? true :
          budget === "under-10" ? v.price < 1000000 :
          budget === "10-to-20" ? (v.price >= 1000000 && v.price <= 2000000) :
          v.price > 2000000;
        return matchesQuery && matchesCategory && matchesBudget;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "stock") return b.quantity - a.quantity;
        return 0;
      });
  }, [vehicles, query, category, budget, sortBy]);

  async function purchase(id: string) {
    setBusyId(id);
    setNotice("");
    try {
      const updated = await vehicleApi.purchase(id);
      setVehicles(prev => prev.map(v => v._id === id ? updated : v));
      const orderNum = `DD-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceipt({
        orderId: orderNum,
        vehicle: updated,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      });
    } catch (e) {
      setNotice((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Purchase failed.");
      await load();
    } finally {
      setBusyId("");
    }
  }

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(vehicle: Vehicle) {
    setEditing(vehicle);
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price,
      quantity: vehicle.quantity,
      imageUrl: vehicle.imageUrl ?? ""
    });
    setShowForm(true);
  }

  async function saveVehicle(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await vehicleApi.update(editing._id, form);
        setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v));
      } else {
        const created = await vehicleApi.create(form);
        setVehicles(prev => [created, ...prev]);
      }
      setShowForm(false);
      setNotice("Inventory saved successfully.");
    } catch (e) {
      setNotice((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Could not save vehicle.");
    } finally {
      setSaving(false);
    }
  }

  async function restock(vehicle: Vehicle) {
    const raw = window.prompt("How many units should be added?", "1");
    if (raw === null) return;
    const quantity = Number(raw);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setNotice("Enter a positive whole number.");
      return;
    }
    try {
      const updated = await vehicleApi.restock(vehicle._id, quantity);
      setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v));
      setNotice("Vehicle restocked.");
    } catch {
      setNotice("Restock failed.");
    }
  }

  async function remove(vehicle: Vehicle) {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}? This cannot be undone.`)) return;
    try {
      await vehicleApi.remove(vehicle._id);
      setVehicles(prev => prev.filter(v => v._id !== vehicle._id));
      setNotice("Vehicle deleted.");
    } catch {
      setNotice("Delete failed. Admin access is required.");
    }
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><CarFront /></span> DriveDeck <span className="brand-divider">/</span><span className="topbar-section">Inventory</span>
        </div>
        <div className="topbar-user">
          <span className="avatar">{user?.email.slice(0, 1).toUpperCase() ?? "U"}</span>
          <span className="user-email">{user?.email}</span>
          {isAdmin && <span className="admin-badge">ADMIN</span>}
          <button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17} /></button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">SHOWROOM OVERVIEW</span>
            <h1>Vehicle inventory<span className="heading-period">.</span></h1>
            <p className="muted">Everything on your lot, organized in one place.</p>
          </div>
          <div className="heading-actions">
            <button className="btn-secondary" onClick={() => void load()}><RefreshCw size={16} /> Refresh</button>
            {isAdmin && <button className="btn-primary" onClick={startCreate}><Plus size={17} /> Add vehicle</button>}
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span>Total listings</span>
            <strong>{vehicles.length}</strong>
            <small>Vehicles in catalogue</small>
          </div>
          <div className="stat-card">
            <span>Units in stock</span>
            <strong>{vehicles.reduce((sum, v) => sum + v.quantity, 0)}</strong>
            <small>Available to purchase</small>
          </div>
          <div className="stat-card">
            <span>Categories</span>
            <strong>{new Set(vehicles.map(v => v.category)).size}</strong>
            <small>Across your showroom</small>
          </div>
        </div>

        {/* Toolbar: Search, Category, Sort */}
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input aria-label="Search vehicles" placeholder="Search make or model…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="filter-box">
            <SlidersHorizontal size={16} />
            <select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-box">
            <ArrowUpDown size={16} />
            <select aria-label="Sort inventory" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock">Most Stock First</option>
            </select>
          </div>
          <span className="result-count">{visible.length} results</span>
        </div>

        {/* Quick Budget Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7daeff', letterSpacing: '0.08em', marginRight: '6px' }}>BUDGET:</span>
          {[
            { id: "all", label: "All Budgets" },
            { id: "under-10", label: "Under ₹10 Lakh" },
            { id: "10-to-20", label: "₹10L – ₹20 Lakh" },
            { id: "above-20", label: "Above ₹20 Lakh" }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setBudget(p.id as typeof budget)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '20px',
                border: budget === p.id ? '1px solid #3b82f6' : '1px solid #23334d',
                background: budget === p.id ? '#1e3a8a55' : '#101a2b',
                color: budget === p.id ? '#93c5fd' : '#8e9bb0',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {notice && <p className="notice" role="status">{notice}</p>}
        {error && <p className="error-banner" role="alert">{error}</p>}

        {loading ? (
          <div className="empty-state">Loading inventory…</div>
        ) : visible.length ? (
          <div className="vehicle-grid">
            {visible.map(vehicle => (
              <div key={vehicle._id}>
                <VehicleCard vehicle={vehicle} onPurchase={purchase} onEdit={startEdit} isAdmin={!!isAdmin} busy={busyId === vehicle._id} />
                {isAdmin && (
                  <div className="admin-actions">
                    <button onClick={() => void restock(vehicle)}>Restock</button>
                    <button onClick={() => void remove(vehicle)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <CarFront size={35} />
            <h2>No vehicles found</h2>
            <p>Try adjusting your search query, category, or budget filter.</p>
            {isAdmin && <button className="btn-primary" onClick={startCreate}><Plus size={16} /> Add your first vehicle</button>}
          </div>
        )}
      </section>

      {/* Order Confirmation Receipt Modal */}
      {receipt && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setReceipt(null); }}>
          <div className="vehicle-modal" style={{ maxWidth: '440px', padding: '28px' }}>
            <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
              <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', background: '#064e3b', color: '#34d399', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={32} />
              </div>
              <span className="eyebrow" style={{ color: '#34d399' }}>PURCHASE CONFIRMED</span>
              <h2 style={{ margin: '8px 0 4px', fontSize: '24px' }}>Order Placed!</h2>
              <p className="muted" style={{ fontSize: '13px' }}>Your vehicle reservation has been registered.</p>
            </div>

            <div style={{ background: '#111b2e', border: '1px solid #23334d', borderRadius: '12px', padding: '16px', margin: '8px 0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #1c2b42', fontSize: '12px' }}>
                <span style={{ color: '#8e9bb0' }}>Order Reference</span>
                <strong style={{ color: '#93c5fd', fontFamily: 'monospace' }}>#{receipt.orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1c2b42', fontSize: '12px' }}>
                <span style={{ color: '#8e9bb0' }}>Vehicle</span>
                <strong style={{ color: '#fff' }}>{receipt.vehicle.make} {receipt.vehicle.model}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1c2b42', fontSize: '12px' }}>
                <span style={{ color: '#8e9bb0' }}>Price Paid</span>
                <strong style={{ color: '#34d399', fontSize: '15px' }}>₹{receipt.vehicle.price.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1c2b42', fontSize: '12px' }}>
                <span style={{ color: '#8e9bb0' }}>Category</span>
                <span style={{ color: '#cbd5e1' }}>{receipt.vehicle.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1c2b42', fontSize: '12px' }}>
                <span style={{ color: '#8e9bb0' }}>Showroom Stock Remaining</span>
                <span style={{ color: '#cbd5e1' }}>{receipt.vehicle.quantity} units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '11px', color: '#64748b' }}>
                <span>Date & Time</span>
                <span>{receipt.timestamp}</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-secondary" onClick={() => window.print()} style={{ flex: 1 }}>
                <Printer size={15} /> Print Slip
              </button>
              <button type="button" className="btn-primary" onClick={() => setReceipt(null)} style={{ flex: 1 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <form className="vehicle-modal" onSubmit={saveVehicle}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{editing ? "EDIT LISTING" : "NEW LISTING"}</span>
                <h2>{editing ? "Update vehicle" : "Add a vehicle"}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close">×</button>
            </div>
            {(["make", "model", "category", "price", "quantity", "imageUrl"] as const).map(field => (
              <label key={field}>
                {field === "imageUrl" ? "Image URL" : field === "price" ? "Price (₹)" : field.charAt(0).toUpperCase() + field.slice(1)}
                {field === "category" ? (
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>SUV</option>
                    <option>Sedan</option>
                    <option>Sports</option>
                    <option>Hatchback</option>
                    <option>Truck</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <input
                    required={field !== "imageUrl"}
                    type={field === "price" || field === "quantity" ? "number" : field === "imageUrl" ? "url" : "text"}
                    min={field === "price" || field === "quantity" ? "0" : undefined}
                    step={field === "price" ? "1" : field === "quantity" ? "1" : undefined}
                    value={form[field] ?? ""}
                    onChange={e => setForm({
                      ...form,
                      [field]: field === "price" || field === "quantity" ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value
                    })}
                  />
                )}
              </label>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save vehicle"}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
