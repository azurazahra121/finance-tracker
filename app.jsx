// ---- Supabase config ----
// Publishable key is safe to expose client-side; every table is locked
// down with row-level security scoped to auth.uid().
const SUPABASE_URL = "https://pfhkdfqokgkfjwbpouwe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5Yu3qoPUJgmiaUf1XX2_MA_HAINNj-C";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Color palette
const C = {
  bg: "#F8FAFF",
  white: "#FFFFFF",
  navy: "#0F172A",
  navyLight: "#1E293B",
  violet: "#7C3AED",
  violetLight: "#EDE9FE",
  coral: "#F43F5E",
  coralLight: "#FFF1F2",
  slate: "#64748B",
  border: "#E2E8F0",
  green: "#10B981",
  greenLight: "#ECFDF5",
};

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Side Income", "Other Income"],
  expense: ["Housing", "Food", "Transport", "Health", "Entertainment", "Shopping", "Bills", "Education", "Other"],
};

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Math.abs(n));

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function StatCard({ label, value, type, sub }) {
  const isPositive = type === "income" || type === "balance-positive";
  const isNegative = type === "expense" || type === "balance-negative";
  const color = isPositive ? C.violet : isNegative ? C.coral : C.slate;
  const bg = isPositive ? C.violetLight : isNegative ? C.coralLight : "#F1F5F9";

  return (
    <div style={{ background: bg, borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: C.slate, textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1, marginBottom: sub ? 4 : 0 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function EntryRow({ entry, onDelete }) {
  const isIncome = entry.type === "income";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isIncome ? C.violetLight : C.coralLight,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>
        {isIncome ? "↑" : "↓"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.navy, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.note || entry.category}
        </div>
        <div style={{ fontSize: 11, color: C.slate }}>
          {entry.category} · {formatDate(entry.date)}
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: isIncome ? C.violet : C.coral, flexShrink: 0 }}>
        {isIncome ? "+" : "-"}{formatCurrency(entry.amount)}
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        style={{ background: "none", border: "none", color: C.border, cursor: "pointer", fontSize: 16, padding: "4px", flexShrink: 0, transition: "color 0.15s" }}
        onMouseEnter={e => e.target.style.color = C.coral}
        onMouseLeave={e => e.target.style.color = C.border}
      >
        ×
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ color: C.slate, fontSize: 13, fontWeight: 600 }}>Loading…</div>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = React.useState("login"); // 'login' | 'signup'
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
    fontSize: 14, color: C.navy, background: C.bg, marginBottom: 10, outline: "none", boxSizing: "border-box",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await db.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Account created. Check your email to confirm it, then log in.");
          setMode("login");
        }
      } else {
        const { error: signInError } = await db.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, background: C.white, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: C.slate, textTransform: "uppercase", marginBottom: 4 }}>
          Personal Finance
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 20 }}>
          {mode === "login" ? "Log in" : "Create account"}
        </div>

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} required
            onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} required minLength={6}
            onChange={e => setPassword(e.target.value)} style={inputStyle} />

          {error && <div style={{ fontSize: 12, color: C.coral, marginBottom: 10 }}>{error}</div>}
          {notice && <div style={{ fontSize: 12, color: C.green, marginBottom: 10 }}>{notice}</div>}

          <button type="submit" disabled={busy} style={{
            width: "100%", padding: "12px", borderRadius: 8, background: C.violet,
            border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.7 : 1, marginBottom: 12,
          }}>
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: 12.5, color: C.slate }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <span
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setNotice(""); }}
            style={{ color: C.violet, fontWeight: 700, cursor: "pointer" }}
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </span>
        </div>
      </div>
    </div>
  );
}

function parseDevice(ua) {
  if (!ua) return "Unknown device";
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac OS/i.test(ua) ? "Mac" : /Linux/i.test(ua) ? "Linux" : "Unknown OS";
  const browser = /Chrome/i.test(ua) && !/Edg/i.test(ua) ? "Chrome" : /Safari/i.test(ua) && !/Chrome/i.test(ua) ? "Safari" : /Firefox/i.test(ua) ? "Firefox" : /Edg/i.test(ua) ? "Edge" : "Browser";
  return `${browser} on ${os}`;
}

function ScreenHeader({ title, sub, onBack }) {
  return (
    <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "20px" }}>
      <div onClick={onBack} style={{ fontSize: 12.5, color: C.violet, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>← Back</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: C.slate, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function LoginHistory({ userId, onBack }) {
  const [rows, setRows] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    db.from("login_history").select("*").eq("user_id", userId).order("logged_in_at", { ascending: false }).limit(30)
      .then(({ data }) => { if (active) setRows(data || []); });
    return () => { active = false; };
  }, [userId]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
      <ScreenHeader title="Login History" sub="Most recent sign-ins to this account, newest first." onBack={onBack} />
      <div style={{ padding: 20 }}>
        {rows === null ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.slate, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.slate, fontSize: 13 }}>No sign-ins logged yet.</div>
        ) : (
          rows.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: i === 0 ? C.violetLight : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔐</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.navy }}>
                  {new Date(r.logged_in_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {i === 0 && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: C.violet, background: C.violetLight, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.04em" }}>MOST RECENT</span>}
                </div>
                <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2 }}>{parseDevice(r.user_agent)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecurringScreen({ userId, onBack, onLogged }) {
  const [rows, setRows] = React.useState(null);
  const [form, setForm] = React.useState({ type: "expense", category: "", amount: "", frequency: "monthly", next_due_date: new Date().toISOString().split("T")[0] });
  const [showForm, setShowForm] = React.useState(false);

  const load = () => db.from("recurring_transactions").select("*").eq("user_id", userId).eq("active", true).order("next_due_date").then(({ data }) => setRows(data || []));
  React.useEffect(() => { load(); }, [userId]);

  const handleAdd = () => {
    if (!form.amount || !form.category) return;
    db.from("recurring_transactions").insert({
      user_id: userId, type: form.type, category: form.category,
      amount: Number(form.amount), frequency: form.frequency, next_due_date: form.next_due_date,
    }).then(load);
    setShowForm(false);
    setForm(f => ({ ...f, category: "", amount: "" }));
  };

  const handleLogNow = (r) => {
    const entry_date = new Date().toISOString().split("T")[0];
    db.from("entries").insert({ user_id: userId, type: r.type, category: r.category, amount: r.amount, note: r.note, entry_date }).then(onLogged);
    const next = new Date(r.next_due_date);
    if (r.frequency === "weekly") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    db.from("recurring_transactions").update({ next_due_date: next.toISOString().split("T")[0] }).eq("id", r.id).then(load);
  };

  const handleRemove = (id) => db.from("recurring_transactions").delete().eq("id", id).then(load);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
      <ScreenHeader title="Recurring" sub="Bills and income that repeat. Tap the check to log an occurrence today." onBack={onBack} />
      <div style={{ padding: 20 }}>
        <div style={{ textAlign: "right", marginBottom: 14 }}>
          <span onClick={() => setShowForm(s => !s)} style={{ fontSize: 12.5, fontWeight: 700, color: C.violet, cursor: "pointer" }}>{showForm ? "Cancel" : "+ Add recurring"}</span>
        </div>

        {showForm && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {["expense", "income"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: "" }))} style={{
                  flex: 1, padding: 9, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  background: form.type === t ? (t === "income" ? C.violet : C.coral) : C.bg,
                  color: form.type === t ? "#fff" : C.slate, border: `1px solid ${form.type === t ? "transparent" : C.border}`,
                }}>{t === "income" ? "Income" : "Expense"}</button>
              ))}
            </div>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ width: "100%", padding: 11, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, marginBottom: 10, background: C.bg, boxSizing: "border-box" }}>
              <option value="">Select category</option>
              {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              style={{ width: "100%", padding: 11, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, marginBottom: 10, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                style={{ flex: 1, padding: 11, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, background: C.bg }}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
              <input type="date" value={form.next_due_date} onChange={e => setForm(f => ({ ...f, next_due_date: e.target.value }))}
                style={{ flex: 1, padding: 11, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, boxSizing: "border-box" }} />
            </div>
            <button onClick={handleAdd} style={{ width: "100%", padding: 11, borderRadius: 8, background: C.violet, border: "none", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Save</button>
          </div>
        )}

        {rows === null ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.slate, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.slate, fontSize: 13 }}>No recurring items yet.</div>
        ) : (
          rows.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13, marginBottom: 9, gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy }}>{r.category}</div>
                <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2 }}>
                  {r.frequency === "weekly" ? "Weekly" : "Monthly"} · next {new Date(r.next_due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: r.type === "income" ? C.violet : C.coral }}>
                {r.type === "income" ? "+" : "-"}{formatCurrency(r.amount)}
              </div>
              <button onClick={() => handleLogNow(r)} title="Log now" style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.bg, color: C.violet, cursor: "pointer", fontSize: 13.5 }}>✓</button>
              <button onClick={() => handleRemove(r.id)} title="Remove" style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.bg, color: C.slate, cursor: "pointer", fontSize: 13.5 }}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BudgetsScreen({ userId, entries, onBack }) {
  const [rows, setRows] = React.useState(null);
  const [form, setForm] = React.useState({ category: "", monthly_limit: "" });
  const [showForm, setShowForm] = React.useState(false);

  const load = () => db.from("budget_goals").select("*").eq("user_id", userId).then(({ data }) => setRows(data || []));
  React.useEffect(() => { load(); }, [userId]);

  const handleSave = () => {
    if (!form.category || !form.monthly_limit) return;
    db.from("budget_goals").upsert(
      { user_id: userId, category: form.category, monthly_limit: Number(form.monthly_limit) },
      { onConflict: "user_id,category" }
    ).then(load);
    setShowForm(false);
    setForm({ category: "", monthly_limit: "" });
  };

  const handleRemove = (id) => db.from("budget_goals").delete().eq("id", id).then(load);

  const progress = React.useMemo(() => {
    if (!rows) return [];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const spent = {};
    entries.filter(e => e.type === "expense" && e.date.slice(0, 7) === thisMonth).forEach(e => {
      spent[e.category] = (spent[e.category] || 0) + e.amount;
    });
    return rows.map(b => ({ ...b, spent: spent[b.category] || 0, pct: Math.min(100, Math.round(((spent[b.category] || 0) / b.monthly_limit) * 100)) }));
  }, [rows, entries]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
      <ScreenHeader title="Budget Goals" sub="Set a monthly limit per category. Bars track this calendar month's spending against it." onBack={onBack} />
      <div style={{ padding: 20 }}>
        <div style={{ textAlign: "right", marginBottom: 14 }}>
          <span onClick={() => setShowForm(s => !s)} style={{ fontSize: 12.5, fontWeight: 700, color: C.violet, cursor: "pointer" }}>{showForm ? "Cancel" : "+ Add budget"}</span>
        </div>

        {showForm && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ width: "100%", padding: 11, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, marginBottom: 10, background: C.bg, boxSizing: "border-box" }}>
              <option value="">Select category</option>
              {CATEGORIES.expense.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Monthly limit" value={form.monthly_limit} onChange={e => setForm(f => ({ ...f, monthly_limit: e.target.value }))}
              style={{ width: "100%", padding: 11, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, marginBottom: 14, boxSizing: "border-box" }} />
            <button onClick={handleSave} style={{ width: "100%", padding: 11, borderRadius: 8, background: C.violet, border: "none", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Save</button>
          </div>
        )}

        {progress.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.slate, fontSize: 13 }}>{rows === null ? "Loading…" : "No budgets set yet."}</div>
        ) : (
          progress.map(b => (
            <div key={b.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy }}>{b.category}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 11.5, color: C.slate }}>{formatCurrency(b.spent)} / {formatCurrency(b.monthly_limit)}</div>
                  <span onClick={() => handleRemove(b.id)} style={{ fontSize: 12.5, color: C.slate, cursor: "pointer" }}>✕</span>
                </div>
              </div>
              <div style={{ height: 7, borderRadius: 99, background: C.bg, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${b.pct}%`, background: b.pct >= 100 ? C.coral : b.pct >= 80 ? "#F59E0B" : C.violet, borderRadius: 99 }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.slate, fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: color, display: "inline-block" }}></span>
      {label}
    </div>
  );
}

function IncomeExpenseDonut({ income, expense }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: { labels: ["Income", "Expense"], datasets: [{ data: [income, expense], backgroundColor: [C.violet, C.coral], borderWidth: 0 }] },
      options: {
        cutout: "68%", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}` } } },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [income, expense]);

  return <canvas ref={canvasRef} />;
}

function CategoryBarChart({ entries }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  const data = React.useMemo(() => {
    const totals = {};
    entries.filter(e => e.type === "expense").forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [entries]);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: { labels: data.map(d => d[0]), datasets: [{ data: data.map(d => d[1]), backgroundColor: C.coral, borderRadius: 6, maxBarThickness: 20 }] },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatCurrency(ctx.raw) } } },
        scales: {
          x: { grid: { color: C.border }, ticks: { color: C.slate, font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { color: C.navy, font: { size: 11, weight: "600" } } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} />;
}

function FinanceTracker({ session, onNavigate, onLogout }) {
  const userId = session.user.id;
  const [entries, setEntries] = React.useState([]);
  const [entriesLoading, setEntriesLoading] = React.useState(true);

  const loadEntries = () => {
    db.from("entries").select("*").eq("user_id", userId).order("entry_date", { ascending: false }).order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) console.error(fetchError);
        setEntries((data || []).map(r => ({ id: r.id, type: r.type, category: r.category, amount: Number(r.amount), note: r.note, date: r.entry_date })));
        setEntriesLoading(false);
      });
  };
  React.useEffect(loadEntries, [userId]);

  const [form, setForm] = React.useState({ type: "expense", category: "", amount: "", note: "", date: new Date().toISOString().split("T")[0] });
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [showForm, setShowForm] = React.useState(false);
  const [error, setError] = React.useState("");

  const stats = React.useMemo(() => {
    const income = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    return { income, expense, balance: income - expense };
  }, [entries]);

  const filtered = React.useMemo(() => {
    if (activeFilter === "all") return entries; // already newest-first from the query
    return entries.filter(e => e.type === activeFilter);
  }, [entries, activeFilter]);

  const handleAdd = () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!form.category) {
      setError("Select a category.");
      return;
    }
    setError("");
    db.from("entries").insert({
      user_id: userId, type: form.type, category: form.category,
      amount: Number(form.amount), note: form.note || null, entry_date: form.date,
    }).then(loadEntries);
    setForm(f => ({ ...f, category: "", amount: "", note: "" }));
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id)); // optimistic
    db.from("entries").delete().eq("id", id).then(({ error: deleteError }) => {
      if (deleteError) console.error(deleteError);
    });
  };

  const balancePositive = stats.balance >= 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: C.slate, textTransform: "uppercase" }}>
            Personal Finance
          </div>
          <div style={{ display: "flex", gap: 13 }}>
            <span onClick={() => onNavigate("recurring")} style={{ fontSize: 11.5, fontWeight: 700, color: C.violet, cursor: "pointer" }}>Recurring</span>
            <span onClick={() => onNavigate("budgets")} style={{ fontSize: 11.5, fontWeight: 700, color: C.violet, cursor: "pointer" }}>Budgets</span>
            <span onClick={() => onNavigate("history")} style={{ fontSize: 11.5, fontWeight: 700, color: C.violet, cursor: "pointer" }}>History</span>
            <span onClick={onLogout} style={{ fontSize: 11.5, fontWeight: 700, color: C.slate, cursor: "pointer" }}>Log out</span>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 20 }}>
          My Tracker
        </div>

        {/* BALANCE HERO */}
        <div style={{ background: balancePositive ? C.violet : C.coral, borderRadius: 16, padding: "24px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 8 }}>
            Current Balance
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {balancePositive ? "" : "-"}{formatCurrency(stats.balance)}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 8 }}>
            {entries.length} transaction{entries.length !== 1 ? "s" : ""} recorded
          </div>
        </div>

        {/* STAT ROW */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <StatCard label="Income" value={formatCurrency(stats.income)} type="income" />
          <StatCard label="Expenses" value={formatCurrency(stats.expense)} type="expense" />
        </div>
      </div>

      {/* INSIGHTS */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: C.slate, textTransform: "uppercase", marginBottom: 12 }}>
          Insights
        </div>
        {entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: C.slate, fontSize: 12.5, background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 20 }}>
            Add a transaction to see your breakdown.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: "1 1 160px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Income vs Expense</div>
              <div style={{ height: 140, position: "relative" }}>
                <IncomeExpenseDonut income={stats.income} expense={stats.expense} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
                <LegendDot color={C.violet} label="Income" />
                <LegendDot color={C.coral} label="Expense" />
              </div>
            </div>
            <div style={{ flex: "1 1 220px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Top spending categories</div>
              <div style={{ height: 168, position: "relative" }}>
                {stats.expense > 0
                  ? <CategoryBarChart entries={entries} />
                  : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.slate, fontSize: 12 }}>No expenses logged yet.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>New Entry</div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["expense", "income"].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: "" }))} style={{
                flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: form.type === t ? (t === "income" ? C.violet : C.coral) : C.bg,
                color: form.type === t ? "#fff" : C.slate,
                border: `1px solid ${form.type === t ? (t === "income" ? C.violet : C.coral) : C.border}`,
                transition: "all 0.15s",
              }}>
                {t === "income" ? "Income" : "Expense"}
              </button>
            ))}
          </div>

          <input type="number" placeholder="Amount (e.g. 50)" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.navy, background: C.bg, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />

          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: form.category ? C.navy : C.slate, background: C.bg, marginBottom: 10, outline: "none", boxSizing: "border-box" }}>
            <option value="">Select category</option>
            {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input type="text" placeholder="Note (optional)" value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.navy, background: C.bg, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />

          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.navy, background: C.bg, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />

          {error && <div style={{ fontSize: 12, color: C.coral, marginBottom: 10 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setShowForm(false); setError(""); }} style={{ flex: 1, padding: "12px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.slate, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleAdd} style={{ flex: 2, padding: "12px", borderRadius: 8, background: form.type === "income" ? C.violet : C.coral, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Add {form.type === "income" ? "Income" : "Expense"}
            </button>
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Transactions</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "income", "expense"].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.05em", textTransform: "capitalize",
                background: activeFilter === f ? C.navy : C.white,
                color: activeFilter === f ? "#fff" : C.slate,
                border: `1px solid ${activeFilter === f ? C.navy : C.border}`,
                transition: "all 0.15s",
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {entriesLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.slate, fontSize: 13 }}>Loading your transactions…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.slate, fontSize: 13 }}>
            No transactions yet. Add one to get started.
          </div>
        ) : (
          filtered.map(e => <EntryRow key={e.id} entry={e} onDelete={handleDelete} />)
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(s => !s)}
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 54, height: 54, borderRadius: "50%",
          background: C.violet, border: "none", color: "#fff",
          fontSize: 26, cursor: "pointer",
          boxShadow: `0 4px 20px ${C.violet}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50, transition: "transform 0.2s",
        }}
      >
        {showForm ? "×" : "+"}
      </button>
    </div>
  );
}

function App() {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState("tracker"); // 'tracker' | 'history' | 'recurring' | 'budgets'
  const [entriesRefresh, setEntriesRefresh] = React.useState(0);
  const [trackerEntries, setTrackerEntries] = React.useState([]);

  React.useEffect(() => {
    db.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = db.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setView("tracker");
      // Only actual sign-ins fire SIGNED_IN — a restored session on page
      // load fires INITIAL_SESSION instead, so refreshes aren't logged.
      if (event === "SIGNED_IN" && newSession?.user) {
        db.from("login_history").insert({ user_id: newSession.user.id, user_agent: navigator.userAgent })
          .then(({ error }) => { if (error) console.error(error); });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Keep a copy of entries at this level too, just so BudgetsScreen can
  // compute this month's spend without re-fetching on every navigation.
  React.useEffect(() => {
    if (!session) return;
    db.from("entries").select("*").eq("user_id", session.user.id)
      .then(({ data }) => setTrackerEntries((data || []).map(r => ({ ...r, amount: Number(r.amount), date: r.entry_date }))));
  }, [session, view, entriesRefresh]);

  if (loading) return <LoadingScreen />;
  if (!session) return <AuthScreen />;

  const back = () => setView("tracker");

  if (view === "history") return <LoginHistory userId={session.user.id} onBack={back} />;
  if (view === "recurring") return <RecurringScreen userId={session.user.id} onBack={back} onLogged={() => setEntriesRefresh(n => n + 1)} />;
  if (view === "budgets") return <BudgetsScreen userId={session.user.id} entries={trackerEntries} onBack={back} />;

  return (
    <FinanceTracker
      key={entriesRefresh}
      session={session}
      onNavigate={setView}
      onLogout={() => db.auth.signOut()}
    />
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
