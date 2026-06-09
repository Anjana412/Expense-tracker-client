import { useState, useEffect, useMemo } from "react";
import {ResponsiveContainer, LineChart, Line, XAxis, YAxis,CartesianGrid, Tooltip, BarChart, Bar, Cell,} from "recharts";
import { getAllExpensesGlobal, getAllTeams, getAllUsers } from "../api/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";
import { CHART_TOOLTIP_STYLE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "../components/ui/chartTheme";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MEMBER_COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#f87171","#06b6d4","#ec4899","#f97316"];
const CATEGORY_COLOR = {
  Food: "#10b981", Transport: "#3b82f6", Shopping: "#f59e0b",
  Health: "#8b5cf6", Entertainment: "#f87171", Bills: "#fb923c",
  Education: "#14b8a6", Other: "#64748b",
};

function filterByPeriod(expenses, filter) {
  const now = new Date();
  return expenses.filter((e) => {
    const d = new Date(e.date);
    if (filter === "This month")
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (filter === "Last month") {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    }
    return d.getFullYear() === now.getFullYear();
  });
}

const GlobalAnalytics = () => {
  const [expenses,setExpenses]= useState([]);
  const [users,setUsers]= useState([]);
  const [loading,setLoading]= useState(true);
  const [error,setError]= useState(null);
  const [activeFilter,setActiveFilter] = useState("This month");
  const [activeTab,setActiveTab]=useState("overview");

  const [search,setSearch]= useState("");
  const [filterCat,setFilterCat]= useState("All");
  const [filterRole,setFilterRole]= useState("All");
  const [minAmount,setMinAmount]= useState("");
  const [maxAmount,setMaxAmount]= useState("");
  const [sortBy,setSortBy]= useState("Highest spend");
  const [teams, setTeams] =useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllExpensesGlobal(), getAllUsers(),getAllTeams()])
      .then(([expRes, userRes,teamRes]) => {
     
        setExpenses(expRes.data);
        setUsers(userRes.data);
        setTeams(Array.isArray(teamRes.data)?teamRes.data: []);
        setError(null);
      })
      .catch((err) => {
        setError(
          err?.response?.status === 403
            ? "Super admin access required."
            : "Failed to load analytics."
        );
      })
       .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = filterByPeriod(expenses, activeFilter);
    result = result.filter((e)=>e.userId?.role !=="superadmin");

    if (filterCat !== "All") result = result.filter((e)=> e.category === filterCat);
    if (filterRole !== "All") result =result.filter((e)=> e.userId?.role === filterRole);
    if (minAmount !== "") result =result.filter((e)=> e.amount >= Number(minAmount));
    if (maxAmount !== "") result= result.filter((e) => e.amount <= Number(maxAmount));
    if (search.trim()) {
     const q = search.toLowerCase();
      result = result.filter((e) =>
          e.title.toLowerCase().includes(q) ||
          e.userId?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [expenses, activeFilter,filterCat, filterRole,minAmount,maxAmount,search]);

  const totalTransactions = filtered.length;
  const totalExpense = useMemo(() => {
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  }, [filtered]);

 const userStats = useMemo(() => {
    const userMap = {};
     filtered.forEach((e) => {
      const userId = e.userId?._id;
      if (!userId) return;
      if (!userMap[userId]) {
        userMap[userId] = {
          user: {
            name: e.userId?.name || "Unknown User",
            email:e.userId?.email || "—",
            role: e.userId?.role || "Member",
          },
          amount: 0,
          count: 0,
        };
      }
      userMap[userId].amount += e.amount;
      userMap[userId].count += 1;
    });
    return Object.values(userMap).sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const totalUsers = userStats.length;
  const avgPerUser = totalUsers ? Math.round(totalExpense / totalUsers) : 0;
  const avgTransaction = totalTransactions ? Math.round(totalExpense / totalTransactions) : 0;
  const topSpender = userStats[0]?.user.name ?? "—";

  const topSpenders = useMemo(() =>
    userStats.slice(0, 5).map((s, i) => ({
      name:s.user.name,
      spent:s.amount,
      count:s.count,
      color:MEMBER_COLORS[i % MEMBER_COLORS.length],
      initials: s.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    })),
  [userStats]);

  const globalMonthly = useMemo(() => {
    const now = new Date();
    return MONTHS.slice(0, now.getMonth() + 1).map((month, i) => ({
      month,
      amount: filtered
        .filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
        })
    .reduce((s, e) => s + e.amount, 0),
    }));
  }, [filtered]);

  const globalCategories = useMemo(() => {
    const catMap = {};
    filtered.forEach((e) => { catMap[e.category] = (catMap[e.category] ?? 0) + e.amount; });
    const total = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category, amount, pct:Math.round((amount / total) * 100),color: CATEGORY_COLOR[category] ?? "#64748b",
      }));
  }, [filtered]);

  const recentActivity = useMemo(() =>
    [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
      .map((e) => ({
        user:e.userId?.name ?? "Unknown",
        title:e.title,
        amount:e.amount,
        category: e.category,
        time:new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      })),
  [filtered]);

  const userBreakdown = useMemo(() => {
    const rows = userStats.map((s, i) => ({
      rank:i + 1,
      name:s.user.name,
      email:s.user.email,
      role:s.user.role,
      spent:s.amount,
      count:s.count,
      avg:s.count ? Math.round(s.amount / s.count) : 0,
      color:MEMBER_COLORS[i % MEMBER_COLORS.length],
      initials: s.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      pct:totalExpense ? Math.round((s.amount / totalExpense) * 100) : 0,
    }));

    return [...rows].sort((a, b) => {
      if (sortBy === "Highest spend")return b.spent - a.spent;
      if (sortBy === "Lowest spend")return a.spent - b.spent;
      if (sortBy === "Most transactions")return b.count - a.count;
      if (sortBy === "Alphabetical")return a.name.localeCompare(b.name);
      return 0;
    });
  }, [userStats, totalExpense, sortBy]);


  const exportCSV = () => {
  const rows = [
    ["Title", "User", "Email","Role","Category","Amount", "Date"],
    ...filtered.map((e) => [
      e.title,
      e.userId?.name ?? "Unknown",
      e.userId?.email ?? "—",
      e.userId?.role ?? "—",
      e.category,
      e.amount,
      new Date(e.date).toLocaleDateString("en-IN"),
    ]),
  ];
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" })
  );
  link.download = "global-analytics.csv";
  link.click();
};

const teamStats = useMemo(() => {
  const userTeamMap = {};
  teams.forEach((team) => {
    team.members?.forEach((member) => {
      const id = typeof member === "object" ? member._id : member;
      userTeamMap[id] = { teamId: team._id, teamName: team.name };
    });
  });

  const teamMap = {};
  filtered.forEach((e) => {
    const uid = e.userId?._id;
    const teamInfo = userTeamMap[uid];
    const key = teamInfo?.teamId ?? "noteam";
    const name = teamInfo?.teamName ?? "No Team";

    if (!teamMap[key]) teamMap[key] = { name, amount: 0, count: 0, members: new Set() };
    teamMap[key].amount += e.amount;
    teamMap[key].count += 1;
    teamMap[key].members.add(uid);
  });

  return Object.values(teamMap)
    .filter((t) => t.name !== "No Team")
    .sort((a, b) => b.amount - a.amount)
    .map((t, i) => ({
      ...t,
      members: t.members.size,
      color: MEMBER_COLORS[i % MEMBER_COLORS.length],
    }));
}, [filtered, teams]);


  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading analytics…</div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center h-64 text-red-600 text-sm px-4 text-center">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
    <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-4">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackToDashboardButton />
        <div className="flex gap-1.5">
          {["This month", "Last month", "This year"].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={["px-3.5 py-1 rounded-full text-[11px] cursor-pointer transition-colors",
                activeFilter === f ? "border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium": "border border-gray-200 bg-transparent text-gray-500 hover:text-gray-800",
              ].join(" ")}>{f}
            </button>
          ))}
          
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg border-none cursor-pointer transition-colors">
          <i className="ti ti-download" /> Export CSV
        </button>
        </div>

      </div>

      <div className="grid grid-cols-6 gap-2.5">
        {[
          { label:"Regsitered users",value: String(totalUsers),icon: "ti-users",color: "text-blue-400"    },
          {label:"Teams",value:String(teams.length),icon:"ti-users-group",color:"text-violet-400"},
          { label:"Total expense",value: `₹${(totalExpense/1000).toFixed(1)}k`,icon: "ti-currency-rupee", color: "text-red-400" },
          { label:"Avg per user",value:`₹${avgPerUser.toLocaleString()}`,icon: "ti-chart-line",color: "text-emerald-400"},
          { label:"Transactions",value:String(totalTransactions),icon: "ti-file-invoice",color: "text-gray-900"},
          { label:"Avg per txn",value:`₹${avgTransaction.toLocaleString()}`,icon: "ti-calculator",color: "text-amber-400"},
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3.5 hover:bg-gray-100">
            <div className="text-[12px] text-gray-600 mb-1.5 flex items-center gap-1.5">
              <i className={`ti ${s.icon}`} /> {s.label}
            </div>
            <div className={`text-xl font-semibold truncate ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

<div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-end gap-3 flex-nowrap overflow-x-auto">

  <div className="flex flex-col gap-1 min-w-45">
    <label className="text-[12px] text-gray-600">Search</label>
    <div className="relative">
      <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="User or expense..."
        className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none placeholder:text-gray-400" />
    </div>
  </div>

  <div className="w-px h-8 bg-gray-200 self-center shrink-0" />

  <div className="flex flex-col gap-1 min-w-27.5">
    <label className="text-[12px] text-gray-500">Category</label>
    <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
      className="px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none">
      {["All","Food","Transport","Shopping","Health","Entertainment","Bills","Education","Other"].map((c) => (
        <option key={c}>{c}</option>
      ))}
    </select>
  </div>

  <div className="flex flex-col gap-1 min-w-22.5">
    <label className="text-[12px] text-gray-500">Role</label>
    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
      className="px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none">
      {["All","user","admin","superadmin"].map((r) => (
        <option key={r}>{r}</option>
      ))}
    </select>
  </div>

  <div className="w-px h-8 bg-gray-200 self-center shrink-0" />

  <div className="flex flex-col gap-1 min-w-20">
    <label className="text-[12px] text-gray-500">Min ₹</label>
    <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0"
      className="w-full px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none placeholder:text-gray-400" />
  </div>

  <div className="flex flex-col gap-1 min-w-20">
    <label className="text-[12px] text-gray-500">Max ₹</label>
    <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="99999"
      className="w-full px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none placeholder:text-gray-400" />
  </div>

  <div className="w-px h-8 bg-gray-200 self-center shrink-0" />

  <div className="flex flex-col gap-1 min-w-35">
    <label className="text-[12px] text-gray-500">Sort by</label>
    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
      className="px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs outline-none">
      {["Highest spend","Lowest spend","Most transactions","Alphabetical"].map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  </div>

  <button onClick={() => { setSearch(""); setFilterCat("All"); setFilterRole("All"); setMinAmount(""); setMaxAmount(""); setSortBy("Highest spend"); }}
    className="ml-auto self-end px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs cursor-pointer bg-transparent hover:text-gray-800 hover:border-gray-300 transition-colors shrink-0">
    Clear
  </button>

</div>

<div className="grid grid-cols-2 gap-3">

  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <div className="text-[15px] font-medium text-gray-900 mb-4">Monthly expense trend</div>
    <div className="h-55">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={globalMonthly}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Total"]} />
          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <div className="text-[15px] font-medium text-gray-900 mb-4">Top spenders</div>
    <div className="h-55">
      {topSpenders.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topSpenders} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tickFormatter={(v) => v.split(" ")[0]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Spent"]} />
            <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
              {topSpenders.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>

</div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-[14px] font-medium text-gray-900 mb-3.5">Category breakdown</div>
          {globalCategories.length === 0 ? (
            <p className="text-gray-400 text-xs">No data for this period.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {globalCategories.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-800 flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: cat.color }} /> {cat.category}</span>
                    <span className="text-[13px] text-gray-400">₹{(cat.amount/1000).toFixed(1)}k · {cat.pct}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded overflow-hidden">
                    <div className="h-full rounded transition-[width] duration-300"style={{ width: `${cat.pct}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
       </div>


      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="text-[14px] font-medium text-gray-900 mb-4">Team spending</div>
        {teamStats.length === 0 ? (
          <p className="text-gray-400 text-xs">No team data for this period.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {teamStats.map((team, i) => (
              <div key={team.name}>
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-xs text-gray-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: team.color }} />
                  {team.name}
                </span>
                <span className="text-[11px] text-gray-400">
                  {team.members} members · {team.count} txns
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-[width] duration-300"
                    style={{
                      width: `${teamStats[0].amount ? Math.round((team.amount / teamStats[0].amount) * 100) : 0}%`,
                      background: team.color,
                    }}
                  />
                </div>
                <span className="text-[13px] font-medium text-gray-900 shrink-0">
                  ₹{(team.amount / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-[14px] font-medium text-gray-900 mb-3.5">Recent activity</div>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-xs">No recent activity.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: CATEGORY_COLOR[act.category] ?? "#64748b" }} />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] text-gray-800 truncate">{act.title}</div>
                    <div className="text-[11px] text-gray-400">{act.user} · {act.time}</div>
                  </div>
                 <div className="text-[13px] font-medium text-red-400 shrink-0"> -₹{act.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[15px] font-medium text-gray-900">User-wise breakdown</div>
          <div className="text-[11px] text-gray-400">{userBreakdown.length} active users in {activeFilter.toLowerCase()}</div>
        </div>
        {userBreakdown.length === 0 ? (
          <p className="text-gray-500 text-xs">No user activity for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {["#", "User", "Email", "Role", "Transactions", "Avg/txn", "% of total", "Total spent"].map((h) => (
                    <th key={h} className="text-left text-[12px] text-gray-500 font-medium pb-2.5 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userBreakdown.map((u) => (
                  <tr key={u.email} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4 font-medium" style={{ color: u.color }}>#{u.rank}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white shrink-0"
                          style={{ background: u.color }}>
                          {u.initials}
                        </div>
                        <span className="text-gray-800 whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400">{u.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className={[
                        "px-2 py-0.5 rounded-full text-[10px] font-medium",
                        u.role ==="superadmin" ? "bg-violet-500/15 text-violet-400" :
                        u.role ==="admin"? "bg-blue-500/15 text-blue-400":"bg-gray-100 text-gray-500",].join(" ")}>{u.role}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">{u.count}</td>
                    <td className="py-2.5 pr-4 text-gray-700">₹{u.avg.toLocaleString()}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-100 rounded overflow-hidden w-16">
                          <div className="h-full rounded" style={{ width: `${u.pct}%`,background: u.color }} />
                        </div>
                        <span className="text-gray-400 text-[11px]">{u.pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-medium text-gray-900">₹{u.spent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
           </table>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default GlobalAnalytics;