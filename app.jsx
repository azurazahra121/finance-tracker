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
    <div style={{
      background: bg,
      borderRadius: 14,
      padding: "18px 20px",
      flex: 1,
      minWidth: 0,
    }}>
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
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "14px 0",
      borderBottom: `1px solid ${C.border}`,
      gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isIncome ? C.violetLight : C.coralLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
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
        style={{
          background: "none", border: "none", color: C.border,
          cursor: "pointer", fontSize: 16, padding: "4px", flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={e => e.target.style.color = C.coral}
        onMouseLeave={e => e.target.style.color = C.border}
      >
        ×
      </button>
    </div>
  );
}

function FinanceTracker() {
  const [entries, setEntries] = React.useState([
    { id: 1, type: "income", category: "Freelance", amount: 150, note: "First client project", date: "2026-07-01" },
    { id: 2, type: "expense", category: "Bills", amount: 45, note: "Internet subscription", date: "2026-07-02" },
    { id: 3, type: "income", category: "Side Income", amount: 80, note: "Fiverr gig", date: "2026-07-03" },
  ]);

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
    if (activeFilter === "all") return [...entries].reverse();
    return [...entries].filter(e => e.type === activeFilter).reverse();
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
    setEntries(prev => [...prev, {
      id: Date.now(),
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      note: form.note,
      date: form.date,
    }]);
    setForm(f => ({ ...f, category: "", amount: "", note: "" }));
    setShowForm(false);
  };

  const handleDelete = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const balancePositive = stats.balance >= 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "20px 20px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: C.slate, textTransform: "uppercase", marginBottom: 4 }}>
          Personal Finance
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 20 }}>
          My Tracker
        </div>

        {/* BALANCE HERO */}
        <div style={{
          background: balancePositive ? C.violet : C.coral,
          borderRadius: 16,
          padding: "24px 22px",
          marginBottom: 20,
        }}>
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

      {/* ADD FORM */}
      {showForm && (
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 14 }}>New Entry</div>

          {/* Type toggle */}
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

          {/* Amount */}
          <input
            type="number"
            placeholder="Amount (e.g. 50)"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 14, color: C.navy, background: C.bg, marginBottom: 10, outline: "none", boxSizing: "border-box",
            }}
          />

          {/* Category */}
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 14, color: form.category ? C.navy : C.slate, background: C.bg, marginBottom: 10, outline: "none", boxSizing: "border-box",
            }}
          >
            <option value="">Select category</option>
            {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Note */}
          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 14, color: C.navy, background: C.bg, marginBottom: 10, outline: "none", boxSizing: "border-box",
            }}
          />

          {/* Date */}
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 14, color: C.navy, background: C.bg, marginBottom: 14, outline: "none", boxSizing: "border-box",
            }}
          />

          {error && <div style={{ fontSize: 12, color: C.coral, marginBottom: 10 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setShowForm(false); setError(""); }} style={{
              flex: 1, padding: "12px", borderRadius: 8, background: C.bg,
              border: `1px solid ${C.border}`, color: C.slate, fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>
              Cancel
            </button>
            <button onClick={handleAdd} style={{
              flex: 2, padding: "12px", borderRadius: 8,
              background: form.type === "income" ? C.violet : C.coral,
              border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
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

        {filtered.length === 0 ? (
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

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FinanceTracker />);
