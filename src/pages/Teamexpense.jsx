import { useState, useEffect, useMemo } from "react";
import { getTeams, getTeamExpenses,getTeamMembers } from "../api/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";

const CATEGORY_COLOR = {
  Food: "#10b981", Transport: "#3b82f6", Shopping: "#f59e0b",
  Health: "#8b5cf6", Entertainment: "#f87171", Bills: "#fb923c",
  Education: "#14b8a6", Other: "#64748b",
};

const AVATAR_COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#f87171","#06b6d4"];

function avatarColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const TeamExpenses = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat,setFilterCat] = useState("All");
  const [filterUser, setFilterUser] = useState("all");
  const [filterDate,setFilterDate] = useState("This month");
  const [teamMembers,setTeamMembers] =useState([]);


  useEffect(() => {
    getTeams()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setTeams(list);
        if (list.length > 0) setSelectedTeam(list[0]);
      })
      .catch(() => setError("Failed to load teams"))
      .finally(() => setLoadingTeams(false));
  }, []);


 useEffect(() => {
  if (!selectedTeam) return;
  setLoadingExpenses(true);
  setError(null);

  Promise.all([
    getTeamExpenses(selectedTeam._id),
    getTeamMembers(selectedTeam._id),   
  ])
    .then(([expRes, memRes]) => {
      setExpenses(expRes.data);
      setTeamMembers(Array.isArray(memRes.data) ? memRes.data : []);
    })
    .catch((err) => {
      setError(
        err?.response?.status === 403
          ? "You don't have permission to view team expenses."
          : "Failed to load team expenses."
      );
    })
    .finally(() => setLoadingExpenses(false));
}, [selectedTeam]);


 

  const filtered = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      const matchDate =
        filterDate === "This month"
          ? d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          : filterDate === "Last month"
          ? (() => { const last = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear(); })()
          : d.getFullYear() === now.getFullYear();
      const matchCat = filterCat === "All" || e.category === filterCat;
      const matchUser = filterUser === "all" || e.userId?._id === filterUser;
      const matchSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.userId?.name ?? "").toLowerCase().includes(search.toLowerCase());
      return matchDate && matchCat && matchUser && matchSearch;
    });
  }, [expenses, filterDate, filterCat, filterUser, search]);

  const totalSpend = filtered.reduce((s, e) => s + e.amount, 0);

  const exportCSV = () => {
    const rows = [
      ["Title", "Member", "Category", "Amount", "Date"],
      ...filtered.map((e) => [
        e.title, e.userId?.name ?? "Unknown", e.category, e.amount,
        new Date(e.date).toLocaleDateString("en-IN"),
      ]),
    ];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" })
    );
    link.download = `${selectedTeam?.name ?? "team"}-expenses.csv`;
    link.click();
  };

  if (loadingTeams) {
    return (
      <DashboardLayout title="Team Expenses">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading teams…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Team Expenses">
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackToDashboardButton />
          <div className="flex gap-1.5">
            {["This month", "Last month", "This year"].map((f) => (
              <button key={f} onClick={() => setFilterDate(f)}
                className={["px-3.5 py-1 rounded-full text-[11px] cursor-pointer transition-colors",
                  filterDate === f
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium"
                    : "border border-gray-200 bg-white text-gray-600 hover:text-gray-900"].join(" ")}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg border-none cursor-pointer">
            <i className="ti ti-download" /> Export CSV
          </button>
        </div>

        {teams.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {teams.map((team) => (
              <button key={team._id} onClick={() => setSelectedTeam(team)}
                className={["px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-colors",
                  selectedTeam?._id === team._id
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"].join(" ")}>
                {team.name}
                <span className="ml-2 text-[11px] opacity-70">{team.members.length}</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center py-6">{error}</div>
        )}

        {loadingExpenses ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading expenses…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { label: "Team total", value: `₹${totalSpend.toLocaleString()}`, icon: "ti-credit-card", color: "text-gray-900" },
                { label: "teamMembers", value: String(teamMembers.length), icon: "ti-users", color: "text-blue-600" },
                { label: "Expenses shown", value: String(filtered.length), icon: "ti-file-invoice", color: "text-gray-900" },
                { label: "Total on record", value: String(expenses.length), icon: "ti-database", color: "text-gray-500" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3.5">
                  <div className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <i className={`ti ${s.icon}`} /> {s.label}
                  </div>
                  <div className={`text-xl font-semibold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {teamMembers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-[11px] text-gray-400 mb-3">Team members</div>
                <div className="flex gap-2.5 flex-wrap">
                  {teamMembers.map((m) => {
                    const memberTotal = expenses
                      .filter((e) => e.userId?._id === m._id)
                      .reduce((s, e) => s + e.amount, 0);
                    return (
                      <div key={m._id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                          style={{ background: avatarColor(m._id) }}>
                          {initials(m.name)}
                        </div>
                        <div>
                          <div className="text-[12px] text-gray-800">{m.name}</div>
                          <div className="text-[11px] text-gray-400">₹{memberTotal.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1 flex-1 min-w-45">
                <label className="text-[11px] text-gray-400">Search</label>
                <div className="relative">
                  <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Expense title or member…"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none placeholder:text-gray-400" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Category</label>
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none">
                  {["All","Food","Transport","Shopping","Health","Entertainment","Bills","Education","Other"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Member</label>
                <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}
                  className="px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none">
                  <option value="all">All members</option>
                  {teamMembers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <button onClick={() => { setSearch(""); setFilterCat("All"); setFilterUser("all"); }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs cursor-pointer bg-transparent hover:text-gray-800 transition-colors">
                Clear
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-gray-200">
                {["Expense", "Member", "Category", "Amount", "Date"].map((h) => (
                  <span key={h} className="text-[11px] text-gray-400 font-medium">{h}</span>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <i className="ti ti-inbox text-3xl text-gray-300" />
                  <p className="text-gray-400 text-sm mt-2">No expenses found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map((exp) => (
                    <div key={exp._id}
                      className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                      <span className="text-[13px] text-gray-800 font-medium truncate">{exp.title}</span>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                          style={{ background: avatarColor(exp.userId?._id ?? "x") }}>
                          {initials(exp.userId?.name ?? "?")}
                        </div>
                        <span className="text-[12px] text-gray-500 truncate">{exp.userId?.name ?? "Unknown"}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full w-fit"
                        style={{ color: CATEGORY_COLOR[exp.category] ?? "#64748b", background: `${CATEGORY_COLOR[exp.category] ?? "#64748b"}18` }}>
                        {exp.category}
                      </span>
                      <span className="text-[13px] font-medium text-gray-900">₹{exp.amount.toLocaleString()}</span>
                      <span className="text-[12px] text-gray-400">{formatDate(exp.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-[11px] text-gray-400">
              Showing {filtered.length} of {expenses.length} expenses
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamExpenses;