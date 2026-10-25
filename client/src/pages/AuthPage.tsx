import { useState, type FormEvent } from "react";
import { ArrowRight, CarFront, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login"|"register">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await (mode === "login" ? login(email, password) : register(email, password)); }
    catch (e: any) {
      const respData = e?.response?.data;
      if (respData?.message) {
        if (respData?.errors?.fieldErrors) {
          const fieldMsgs = Object.values(respData.errors.fieldErrors).flat().join(". ");
          setError(fieldMsgs ? `${respData.message}: ${fieldMsgs}` : respData.message);
        } else {
          setError(respData.message);
        }
      } else if (e?.message) {
        setError(e.message);
      } else {
        setError("Unable to authenticate. Check the API connection.");
      }
    }
    finally { setBusy(false); }
  }
  return <main className="auth-shell">
    <section className="auth-visual"><div className="brand"><span className="brand-mark"><CarFront/></span> DriveDeck</div><div className="auth-copy"><span className="eyebrow">DEALERSHIP INTELLIGENCE</span><h1>Every vehicle.<br/><em>One clear view.</em></h1><p>A smarter way to manage inventory, track availability, and keep your showroom moving.</p><div className="trust-note"><ShieldCheck size={17}/> Secure access · Role-based controls</div></div><div className="auth-foot">INVENTORY MANAGEMENT, REIMAGINED</div></section>
    <section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}>
      <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span><h2>{mode === "login" ? "Sign in to DriveDeck" : "Create your account"}</h2><p className="muted">Manage your dealership with confidence.</p>
      <label>Email address<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@dealership.com"/></label>
      <label>Password<input type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"/></label>
      {error && <p role="alert" className="error-message">{error}</p>}
      <button className="btn-primary w-full justify-center py-3" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={16}/></button>
      <div style={{ marginTop: '16px', padding: '12px', background: '#111b2e', borderRadius: '8px', border: '1px dashed #26354b', fontSize: '11px', color: '#94a3b8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 700, color: '#7daeff', fontSize: '10px', letterSpacing: '0.05em' }}>QUICK DEMO ACCESS:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }} onClick={() => { setEmail("admin@dealership.com"); setPassword("Password123!"); setMode("login"); }}>
            🔑 Admin Demo
          </button>
          <button type="button" className="btn-secondary" style={{ flex: 1, padding: '6px 8px', fontSize: '11px' }} onClick={() => { setEmail("user@dealership.com"); setPassword("Password123!"); setMode("login"); }}>
            👤 User Demo
          </button>
        </div>
      </div>
      <p className="switch-mode">{mode === "login" ? "New to DriveDeck?" : "Already have an account?"} <button type="button" onClick={() => {setMode(mode === "login" ? "register" : "login"); setError("");}}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
    </form></section>
  </main>;
}
