// import { useState, useEffect, useMemo } from "react";
// import { getTeamExpenses } from "../api/api";
// import DashboardLayout from "../components/layout/DashboardLayout";
// import BackToDashboardButton from "../components/layout/BackToDashboardButton";
// import { CHART_TOOLTIP_STYLE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "../components/ui/chartTheme";
// import {ResponsiveContainer, LineChart, Line, XAxis, YAxis,CartesianGrid, Tooltip, BarChart, Bar, Cell,PieChart, Pie,} from "recharts";

// const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// const MEMBER_COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#f87171","#06b6d4","#ec4899","#f97316"];
// const CATEGORY_COLOR = {
//   Food: "#10b981", Transport: "#3b82f6", Shopping: "#f59e0b",
//   Health: "#8b5cf6", Entertainment: "#f87171", Bills: "#fb923c",
//   Education: "#14b8a6", Other: "#64748b",
// };

// function filterByPeriod(expenses, filter) {
//   const now = new Date();
//   return expenses.filter((e) => {
//     const d = new Date(e.date);
//     if (filter === "This month")
//       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//     if (filter === "Last month") {
//       const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
//     }
//     return d.getFullYear() === now.getFullYear();
//   });
// }

// function initials(name) {
//   return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
// }

// const TeamReports = () => {
//   const [expenses, setExpenses]= useState([]);
//   const [loading, setLoading]= useState(true);
//   const [error, setError]= useState(null);
//   const [activeFilter, setActiveFilter]= useState("This month");
//   const [selectedUser, setSelectedUser]= useState("all");

//   useEffect(() => {
//     setLoading(true);
//     getTeamExpenses()
//       .then((res) => { setExpenses(res.data); setError(null); })
//       .catch((err) => {
//         setError(
//           err?.response?.status === 403 ? "You don't have permission to view team reports." : "Failed to load team data.");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const allMembers = useMemo(() => {
//     const map = new Map();
//     expenses.forEach((e) => {
//       if (e.userId?._id) map.set(e.userId._id, e.userId);
//     });

//     return Array.from(map.values());
//   }, [expenses]);

//   const filtered = useMemo(() => {
//     let result = filterByPeriod(expenses, activeFilter);
//     if (selectedUser !== "all")
//       result = result.filter((e) => e.userId?._id === selectedUser);
//     return result;
//   }, [expenses, activeFilter, selectedUser]);

//   const totalTeam = useMemo(
//     () => filtered.reduce((s, e) => s + e.amount, 0),
//     [filtered]
//   );

//   const monthlyData = useMemo(() => {
//     const now = new Date();
//     const base = selectedUser === "all"? expenses: expenses.filter((e) => e.userId?._id === selectedUser);

//     return MONTHS.slice(0, now.getMonth() + 1).map((month, i) => ({
//       month,
//       amount: base
//         .filter((e) => {
//           const d = new Date(e.date);
//           return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
//         })
//         .reduce((s, e) => s + e.amount, 0),
//     }));
//   }, [expenses, selectedUser]);

//   const memberSpending = useMemo(() => {
//     const map = {};
//     filtered.forEach((e) => {
//       const id = e.userId?._id;
//         if (!id) return;
//         if (!map[id]) map[id] = { name: e.userId.name, amount: 0, count: 0 };
//        map[id].amount += e.amount;
//        map[id].count += 1;
//       });
//     return Object.entries(map)
//       .sort((a, b) => b[1].amount - a[1].amount)
//       .map(([id, v], i) => ({
//          id,
//          name:v.name,
//          amount:v.amount,
//          count:v.count,
//          color:MEMBER_COLORS[i % MEMBER_COLORS.length],
//          initials: initials(v.name),
//       }));
//    }, [filtered]);
  
//   const categoryData = useMemo(() => {
//     const map = {};
//     filtered.forEach((e) => {
//       map[e.category] = (map[e.category] ?? 0) + e.amount;
//     }); 
//     const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
//     return Object.entries(map)
//       .sort((a, b) => b[1] - a[1])
//       .map(([category, amount]) => ({
//          category,
//         amount,
//         pct: Math.round((amount / total) * 100),
//         color: CATEGORY_COLOR[category] ?? "#64748b",
//       }));
//   }, [filtered]);


//   const exportCSV = () => {
//     const rows = [
//       ["Title", "Member", "Category", "Amount", "Date"],
//       ...filtered.map((e) => [
//         e.title,
//         e.userId?.name ?? "Unknown",
//         e.category,
//         e.amount,
//         new Date(e.date).toLocaleDateString("en-IN"),
//       ]),
//     ];
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(
//         new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" })
//       );
//       link.download = "team-report.csv";
//       link.click();
//     };

//    const topSpender = memberSpending[0]?.name ?? "—";
//    const avgPerUser = memberSpending.length ? Math.round(totalTeam / memberSpending.length) : 0;

//   if (loading) {
//     return (
//       <DashboardLayout title="Team Reports">
//         <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading team reports…</div>
//       </DashboardLayout>
//     );
//   }

//   if (error) {
//     return (
//       <DashboardLayout title="Team Reports">
//         <div className="flex items-center justify-center h-64 text-red-600 text-sm px-4 text-center">{error}</div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout title="Team Reports">
//     <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-4">

//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <BackToDashboardButton />
//         <div className="flex gap-1.5">
//           {["This month", "Last month", "This year"].map((f) => (
//             <button key={f} onClick={() => setActiveFilter(f)} className={[ "px-3.5 py-1 rounded-full text-[11px] cursor-pointer transition-colors",
//                 activeFilter === f? "border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium" : "border border-gray-200 bg-transparent text-gray-500 hover:text-gray-800",].join(" ")}>
//               {f}
//             </button>
//           ))}
//         </div>

//         <button onClick={exportCSV} 
//         className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg border-none cursor-pointer transition-colors">
//             <i className="ti ti-download" /> Export CSV
//           </button>
//       </div>

//       <div className="grid grid-cols-4 gap-2.5">
//         {[
//           {label:"Team total",value:`₹${totalTeam.toLocaleString()}`,color:"text-gray-900",icon: "ti-credit-card"},
//           {label:"Top spender",value: topSpender,color: "text-red-400",icon:"ti-award" },
//           {label:"Avg per user",value:`₹${avgPerUser.toLocaleString()}`,color:"text-amber-400",icon: "ti-chart-line"},
//           {label:"Active members",value: String(memberSpending.length),color:"text-emerald-400",icon: "ti-users"},
//         ].map((s) => (
//           <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3.5">
//             <div className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-1.5">
//                 <i className={`ti ${s.icon}`} /> {s.label}
//               </div>
//               <div className={`text-xl font-semibold truncate ${s.color}`}>{s.value}</div>
//           </div>
//         ))}
//       </div>

//       {allMembers.length > 0 && (
//         <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
//           <span className="text-[11px] text-gray-400 shrink-0">Filter by member:</span>

//           <button onClick={() => setSelectedUser("all")} className={[ "px-3 py-1.5 rounded-full text-[11px] cursor-pointer border transition-colors",
//               selectedUser === "all" ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400": "border-gray-200 bg-transparent text-gray-500 hover:text-gray-800", ].join(" ")} > 
//               All members
//           </button>

//           {allMembers.map((m, i) => {
//             const isSelected = selectedUser === m._id;
//             const color = MEMBER_COLORS[i % MEMBER_COLORS.length];

//             return (
//               <button key={m._id} onClick={() => setSelectedUser(isSelected ? "all" : m._id)} className={[ "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] cursor-pointer border transition-colors",
//                   isSelected ? "border-transparent text-white" : "border-gray-200 bg-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300", ].join(" ")}
//                 style={isSelected ? { background: color, borderColor: color } : {}} >
//                 <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: isSelected ? "rgba(255,255,255,0.25)" : color }} >
//                   {initials(m.name)}
//                   </span>
//                 {m.name.split(" ")[0]}
//               </button>
//             );
//           })}

//           {selectedUser !== "all" && (
//             <button onClick={() => setSelectedUser("all")} className="ml-auto text-[11px] text-gray-400 hover:text-gray-700 cursor-pointer bg-transparent border-none transition-colors flex items-center gap-1">
//               <i className="ti ti-x text-xs" /> Clear
//             </button>
//           )}
//         </div>
//       )}

//       <div className="grid gap-3" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
//         <div className="bg-white border border-gray-200 rounded-xl p-5">
//           <div className="text-[13px] font-medium text-gray-900 mb-4">Monthly expense trend</div>
//           <div className="h-55">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={monthlyData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                   <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }}tickLine={false} />
//                   <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false}/>
//                   <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, "Total"]} />
//                   <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-5">
//           <div className="text-[13px] font-medium text-gray-900 mb-4">Top spenders</div>
//           <div className="h-55">
//             {memberSpending.length === 0 ? (
//             <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={memberSpending.slice(0, 5)} barSize={28}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
//                   <XAxis dataKey="name" tickFormatter={(v) => v.split(" ")[0]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} />
//                   <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false}/>
//                   <Tooltip contentStyle={CHART_TOOLTIP_STYLE}formatter={(v) => [`₹${v.toLocaleString()}`, "Spent"]} />
//                   <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
//                     {memberSpending.slice(0, 5).map((m, i) => (
//                       <Cell key={i} fill={m.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-3">
//         <div className="bg-white border border-gray-200 rounded-xl p-5">
//           <div className="text-[13px] font-medium text-gray-900 mb-4">Category split</div>
//           {categoryData.length === 0 ? (
//             <p className="text-gray-400 text-xs">No data for this period.</p>
//           ) : (
//             <div className="flex flex-col items-center gap-4">
//               <div className="w-40 h-40">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={categoryData} dataKey="amount" nameKey="category" innerRadius={45} outerRadius={72} paddingAngle={3} >
//                       {categoryData.map((c, i) => (
//                         <Cell key={i} fill={c.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, ""]}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="w-full flex flex-col gap-1.5">
//                 {categoryData.map((c) => (
//                   <div key={c.category} className="flex items-center justify-between text-[11px]">
//                     <span className="flex items-center gap-1.5 text-gray-500">
//                       <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: c.color }} /> {c.category} </span>
//                     <span className="text-gray-700">{c.pct}%</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="bg-white border border-gray-200 rounded-xl p-5">
//           <div className="text-[13px] font-medium text-gray-900 mb-4">Member breakdown</div>
//           {memberSpending.length === 0 ? (
//           <p className="text-gray-400 text-xs">No data for this period.</p>
//           ) : (
//             <div className="flex flex-col gap-3">
//               {memberSpending.map((m) => {
//                 const pct = totalTeam ? Math.round((m.amount / totalTeam) * 100) : 0;
//           return (
//                   <div key={m.id}>
//                     <div className="flex items-center gap-2.5 mb-1.5">
//                       <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: m.color }} >
//                         {m.initials}
//                       </div>
//                       <span className="text-[12px] text-gray-800 flex-1 truncate">{m.name}</span>
//                       <span className="text-[12px] font-medium text-gray-900"> ₹{(m.amount / 1000).toFixed(1)}k </span>
//                     </div>
//                     <div className="h-1 bg-gray-100 rounded overflow-hidden">
//                       <div className="h-full rounded transition-[width] duration-300" style={{ width: `${pct}%`, background: m.color }}/>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//           <div className="bg-white border border-gray-200 rounded-xl p-5">
//             <div className="text-[13px] font-medium text-gray-900 mb-4">Category breakdown</div>
//             {categoryData.length === 0 ? (
//               <p className="text-gray-400 text-xs">No data for this period.</p>
//             ) : (
//               <div className="flex flex-col gap-3">
//               {categoryData.map((cat) => (
//                 <div key={cat.category}>
//                   <div className="flex justify-between mb-1">
//                     <span className="text-xs text-gray-800 flex items-center gap-1.5">
//                       <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: cat.color }}/>
//                       {cat.category}
//                     </span>
//                     <span className="text-xs text-gray-400"> ₹{(cat.amount / 1000).toFixed(1)}k · {cat.pct}%
//                   </span>
//                   </div>
//                   <div className="h-1 bg-gray-100 rounded overflow-hidden">
//                     <div className="h-full rounded transition-[width] duration-300" style={{ width: `${cat.pct}%`, background: cat.color }}/>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//     </DashboardLayout>
//   );
// };

// export default TeamReports;

import { useState, useEffect, useMemo } from "react";
import { getTeams, getTeamExpenses } from "../api/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";
import { CHART_TOOLTIP_STYLE } from "../components/ui/chartTheme";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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

function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const TeamReports = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("This month");
  const [selectedUser, setSelectedUser] = useState("all");

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
    setSelectedUser("all");
    getTeamExpenses(selectedTeam._id)
      .then((res) => { setExpenses(res.data); setError(null); })
      .catch((err) => {
        setError(
          err?.response?.status === 403
            ? "You don't have permission to view team reports."
            : "Failed to load team data."
        );
      })
      .finally(() => setLoadingExpenses(false));
  }, [selectedTeam]);

  const allMembers = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => { if (e.userId?._id) map.set(e.userId._id, e.userId); });
    return Array.from(map.values());
  }, [expenses]);

  const filtered = useMemo(() => {
    let result = filterByPeriod(expenses, activeFilter);
    if (selectedUser !== "all") result = result.filter((e) => e.userId?._id === selectedUser);
    return result;
  }, [expenses, activeFilter, selectedUser]);

  const totalTeam = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const base = selectedUser === "all" ? expenses : expenses.filter((e) => e.userId?._id === selectedUser);
    return MONTHS.slice(0, now.getMonth() + 1).map((month, i) => ({
      month,
      amount: base
        .filter((e) => { const d = new Date(e.date); return d.getFullYear() === now.getFullYear() && d.getMonth() === i; })
        .reduce((s, e) => s + e.amount, 0),
    }));
  }, [expenses, selectedUser]);

  const memberSpending = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const id = e.userId?._id;
      if (!id) return;
      if (!map[id]) map[id] = { name: e.userId.name, amount: 0, count: 0 };
      map[id].amount += e.amount;
      map[id].count += 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([id, v], i) => ({
        id, name: v.name, amount: v.amount, count: v.count,
        color: MEMBER_COLORS[i % MEMBER_COLORS.length],
        initials: initials(v.name),
      }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category, amount,
        pct: Math.round((amount / total) * 100),
        color: CATEGORY_COLOR[category] ?? "#64748b",
      }));
  }, [filtered]);

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
    link.download = `${selectedTeam?.name ?? "team"}-report.csv`;
    link.click();
  };

  const topSpender = memberSpending[0]?.name ?? "—";
  const avgPerUser = memberSpending.length ? Math.round(totalTeam / memberSpending.length) : 0;

  if (loadingTeams) {
    return (
      <DashboardLayout title="Team Reports">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading teams…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Team Reports">
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackToDashboardButton />
          <div className="flex gap-1.5">
            {["This month", "Last month", "This year"].map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={["px-3.5 py-1 rounded-full text-[11px] cursor-pointer transition-colors",
                  activeFilter === f
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium"
                    : "border border-gray-200 bg-transparent text-gray-500 hover:text-gray-800"].join(" ")}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg border-none cursor-pointer">
            <i className="ti ti-download" /> Export CSV
          </button>
        </div>

        {/* Team selector tabs */}
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

        {error && <div className="text-red-500 text-sm text-center py-4">{error}</div>}

        {loadingExpenses ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading reports…</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: "Team total", value: `₹${totalTeam.toLocaleString()}`, color: "text-gray-900", icon: "ti-credit-card" },
                { label: "Top spender", value: topSpender, color: "text-red-400", icon: "ti-award" },
                { label: "Avg per user", value: `₹${avgPerUser.toLocaleString()}`, color: "text-amber-400", icon: "ti-chart-line" },
                { label: "Active members", value: String(memberSpending.length), color: "text-emerald-400", icon: "ti-users" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3.5">
                  <div className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <i className={`ti ${s.icon}`} /> {s.label}
                  </div>
                  <div className={`text-xl font-semibold truncate ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Member filter */}
            {allMembers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                <span className="text-[11px] text-gray-400 shrink-0">Filter by member:</span>
                <button onClick={() => setSelectedUser("all")}
                  className={["px-3 py-1.5 rounded-full text-[11px] cursor-pointer border transition-colors",
                    selectedUser === "all"
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-600"
                      : "border-gray-200 bg-transparent text-gray-500 hover:text-gray-800"].join(" ")}>
                  All members
                </button>
                {allMembers.map((m, i) => {
                  const isSelected = selectedUser === m._id;
                  const color = MEMBER_COLORS[i % MEMBER_COLORS.length];
                  return (
                    <button key={m._id} onClick={() => setSelectedUser(isSelected ? "all" : m._id)}
                      className={["flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] cursor-pointer border transition-colors",
                        isSelected ? "text-white border-transparent" : "border-gray-200 text-gray-500 hover:text-gray-800"].join(" ")}
                      style={isSelected ? { background: color, borderColor: color } : {}}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: isSelected ? "rgba(255,255,255,0.25)" : color }}>
                        {initials(m.name)}
                      </span>
                      {m.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Charts */}
            <div className="grid gap-3" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-[13px] font-medium text-gray-900 mb-4">Monthly expense trend</div>
                <div className="h-55">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, "Total"]} />
                      <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-[13px] font-medium text-gray-900 mb-4">Top spenders</div>
                <div className="h-55">
                  {memberSpending.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={memberSpending.slice(0, 5)} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="name" tickFormatter={(v) => v.split(" ")[0]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, "Spent"]} />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                          {memberSpending.slice(0, 5).map((m, i) => <Cell key={i} fill={m.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom panels */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-[13px] font-medium text-gray-900 mb-4">Category split</div>
                {categoryData.length === 0 ? (
                  <p className="text-gray-400 text-xs">No data for this period.</p>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-40 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="amount" nameKey="category" innerRadius={45} outerRadius={72} paddingAngle={3}>
                            {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                          </Pie>
                          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()}`, ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full flex flex-col gap-1.5">
                      {categoryData.map((c) => (
                        <div key={c.category} className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: c.color }} />
                            {c.category}
                          </span>
                          <span className="text-gray-700">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-[13px] font-medium text-gray-900 mb-4">Member breakdown</div>
                {memberSpending.length === 0 ? (
                  <p className="text-gray-400 text-xs">No data for this period.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {memberSpending.map((m) => {
                      const pct = totalTeam ? Math.round((m.amount / totalTeam) * 100) : 0;
                      return (
                        <div key={m.id}>
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                              style={{ background: m.color }}>
                              {m.initials}
                            </div>
                            <span className="text-[12px] text-gray-800 flex-1 truncate">{m.name}</span>
                            <span className="text-[12px] font-medium text-gray-900">₹{(m.amount / 1000).toFixed(1)}k</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded overflow-hidden">
                            <div className="h-full rounded transition-[width] duration-300"
                              style={{ width: `${pct}%`, background: m.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-[13px] font-medium text-gray-900 mb-4">Category breakdown</div>
                {categoryData.length === 0 ? (
                  <p className="text-gray-400 text-xs">No data for this period.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {categoryData.map((cat) => (
                      <div key={cat.category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: cat.color }} />
                            {cat.category}
                          </span>
                          <span className="text-xs text-gray-400">₹{(cat.amount / 1000).toFixed(1)}k · {cat.pct}%</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded overflow-hidden">
                          <div className="h-full rounded transition-[width] duration-300"
                            style={{ width: `${cat.pct}%`, background: cat.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamReports;
