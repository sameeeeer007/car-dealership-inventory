import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, LogOut, CarFront, Plus, RefreshCw } from "lucide-react";
import { vehicleApi } from "../api/vehicles";
import { useAuth } from "../context/AuthContext";
import { VehicleCard } from "../components/VehicleCard";
import type { Vehicle, VehicleInput } from "../types";

const emptyForm: VehicleInput = { make: "", model: "", category: "SUV", price: 0, quantity: 0, imageUrl: "" };
export function Dashboard() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("All categories");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(""); const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState<VehicleInput>(emptyForm);
  const [saving, setSaving] = useState(false); const [notice, setNotice] = useState("");
  const isAdmin = user?.role === "admin";
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setVehicles(await vehicleApi.list()); } catch { setError("Could not load inventory. Check that the API and database are running."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const categories = useMemo(() => ["All categories", ...new Set(vehicles.map(v => v.category))], [vehicles]);
  const visible = vehicles.filter(v => `${v.make} ${v.model}`.toLowerCase().includes(query.toLowerCase()) && (category === "All categories" || v.category === category));
  async function purchase(id: string) {
    setBusyId(id); setNotice("");
    try { const updated = await vehicleApi.purchase(id); setVehicles(prev => prev.map(v => v._id === id ? updated : v)); setNotice("Purchase recorded. Inventory updated."); }
    catch (e) { setNotice((e as {response?: {data?: {message?: string}}}).response?.data?.message ?? "Purchase failed."); await load(); }
    finally { setBusyId(""); }
  }
  function startCreate() { setEditing(null); setForm(emptyForm); setShowForm(true); }
  function startEdit(vehicle: Vehicle) { setEditing(vehicle); setForm({ make: vehicle.make, model: vehicle.model, category: vehicle.category, price: vehicle.price, quantity: vehicle.quantity, imageUrl: vehicle.imageUrl ?? "" }); setShowForm(true); }
  async function saveVehicle(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      if (editing) { const updated = await vehicleApi.update(editing._id, form); setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v)); }
      else { const created = await vehicleApi.create(form); setVehicles(prev => [created, ...prev]); }
      setShowForm(false); setNotice("Inventory saved successfully.");
    } catch (e) { setNotice((e as {response?: {data?: {message?: string}}}).response?.data?.message ?? "Could not save vehicle."); }
    finally { setSaving(false); }
  }
  async function restock(vehicle: Vehicle) {
    const raw = window.prompt("How many units should be added?", "1");
    if (raw === null) return; const quantity = Number(raw);
    if (!Number.isInteger(quantity) || quantity < 1) { setNotice("Enter a positive whole number."); return; }
    try { const updated = await vehicleApi.restock(vehicle._id, quantity); setVehicles(prev => prev.map(v => v._id === updated._id ? updated : v)); setNotice("Vehicle restocked."); }
    catch { setNotice("Restock failed."); }
  }
  async function remove(vehicle: Vehicle) {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}? This cannot be undone.`)) return;
    try { await vehicleApi.remove(vehicle._id); setVehicles(prev => prev.filter(v => v._id !== vehicle._id)); setNotice("Vehicle deleted."); }
    catch { setNotice("Delete failed. Admin access is required."); }
  }
  return <main className="dashboard-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark"><CarFront/></span> DriveDeck <span className="brand-divider">/</span><span className="topbar-section">Inventory</span></div><div className="topbar-user"><span className="avatar">{user?.email.slice(0,1).toUpperCase() ?? "U"}</span><span className="user-email">{user?.email}</span>{isAdmin && <span className="admin-badge">ADMIN</span>}<button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17}/></button></div></header>
    <section className="dashboard-content"><div className="page-heading"><div><span className="eyebrow">SHOWROOM OVERVIEW</span><h1>Vehicle inventory<span className="heading-period">.</span></h1><p className="muted">Everything on your lot, organized in one place.</p></div><div className="heading-actions"><button className="btn-secondary" onClick={() => void load()}><RefreshCw size={16}/> Refresh</button>{isAdmin && <button className="btn-primary" onClick={startCreate}><Plus size={17}/> Add vehicle</button>}</div></div>
      <div className="stats-row"><div className="stat-card"><span>Total listings</span><strong>{vehicles.length}</strong><small>Vehicles in catalogue</small></div><div className="stat-card"><span>Units in stock</span><strong>{vehicles.reduce((sum,v)=>sum+v.quantity,0)}</strong><small>Available to purchase</small></div><div className="stat-card"><span>Categories</span><strong>{new Set(vehicles.map(v=>v.category)).size}</strong><small>Across your showroom</small></div></div>
      <div className="inventory-toolbar"><div className="search-box"><Search size={18}/><input aria-label="Search vehicles" placeholder="Search make or model…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filter-box"><SlidersHorizontal size={16}/><select aria-label="Filter by category" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><span className="result-count">{visible.length} results</span></div>
      {notice && <p className="notice" role="status">{notice}</p>}{error && <p className="error-banner" role="alert">{error}</p>}
      {loading ? <div className="empty-state">Loading inventory…</div> : visible.length ? <div className="vehicle-grid">{visible.map(vehicle=><div key={vehicle._id}><VehicleCard vehicle={vehicle} onPurchase={purchase} onEdit={startEdit} isAdmin={!!isAdmin} busy={busyId===vehicle._id}/>{isAdmin && <div className="admin-actions"><button onClick={()=>void restock(vehicle)}>Restock</button><button onClick={()=>void remove(vehicle)}>Delete</button></div>}</div>)}</div> : <div className="empty-state"><CarFront size={35}/><h2>No vehicles found</h2><p>Try adjusting your search or category filter.</p>{isAdmin && <button className="btn-primary" onClick={startCreate}><Plus size={16}/> Add your first vehicle</button>}</div>}
    </section>
    {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false);}}><form className="vehicle-modal" onSubmit={saveVehicle}><div className="modal-heading"><div><span className="eyebrow">{editing ? "EDIT LISTING" : "NEW LISTING"}</span><h2>{editing ? "Update vehicle" : "Add a vehicle"}</h2></div><button type="button" className="icon-button" onClick={()=>setShowForm(false)} aria-label="Close">×</button></div>
      {(["make","model","category","price","quantity","imageUrl"] as const).map(field=><label key={field}>{field==="imageUrl"?"Image URL":field==="price"?"Price (₹)":field.charAt(0).toUpperCase()+field.slice(1)}{field==="category"?<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>SUV</option><option>Sedan</option><option>Sports</option><option>Hatchback</option><option>Truck</option><option>Other</option></select>:<input required={field!=="imageUrl"} type={field==="price"||field==="quantity"?"number":field==="imageUrl"?"url":"text"} min={field==="price"||field==="quantity"?"0":undefined} step={field==="price"?"1":field==="quantity"?"1":undefined} value={form[field] ?? ""} onChange={e=>setForm({...form,[field]:field==="price"||field==="quantity"?(e.target.value===""?0:Number(e.target.value)):e.target.value})}/>}</label>)}
      <div className="modal-actions"><button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button><button className="btn-primary" disabled={saving}>{saving?"Saving…":"Save vehicle"}</button></div></form></div>}
  </main>;
}
