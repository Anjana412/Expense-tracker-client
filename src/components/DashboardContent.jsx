import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses, deleteExpense, getBudget, updateBudget } from "../api/api";
import { toast } from "react-toastify";
import {ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid,} from "recharts";
import DashboardLayout from "./layout/DashboardLayout";
import ExpenseRowActions from "./ui/ExpenseRowActions";
import { CHART_TOOLTIP_STYLE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "./ui/chartTheme";

const categoryIcon = {
  Food:"ti-tools-kitchen-2",Transport:"ti-bus",Shopping:"ti-shopping-bag",
  Health:"ti-heartbeat",Entertainment:"ti-music",Education:"ti-book",
  Bills:"ti-receipt",Other:"ti-dots",
};
const categoryBg = {
  Food:"rgba(16,185,129,0.1)",Transport:"rgba(59,130,246,0.1)",Shopping:"rgba(245,158,11,0.1)",
  Health:"rgba(139,92,246,0.1)",Entertainment:"rgba(248,113,113,0.1)",Education:"rgba(20,184,166,0.1)",
  Bills:"rgba(251,146,60,0.1)",Other:"rgba(100,116,139,0.1)",
};
const categoryColor = {
  Food:"#10b981",Transport:"#3b82f6",Shopping:"#f59e0b",Health:"#8b5cf6",
  Entertainment:"#f87171",Education:"#14b8a6",Bills:"#fb923c",Other:"#64748b",
};
const budgetLimits = {
  Food:4000,Transport:2000,Shopping:3000,Health:1500,
  Entertainment:1000,Education:2000,Bills:3000,Other:1000,
};

function formatDate(dateStr) {
  const date = new Date(dateStr), today = new Date(), yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function budgetBarColor(spent, limit) {
  const pct = (spent / limit) * 100;
  return pct >= 100 ? "#f87171" : pct >= 80 ? "#f59e0b" : "#10b981";
}

const DashboardContent = () => {
  const navigate = useNavigate();

  let storedUser = {};
  try { storedUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}
  const user = { name:storedUser.name || "User", role: storedUser.role || "user" };

  const [activeFilter,setActiveFilter]= useState("This month");
  const [searchTerm,setSearchTerm]= useState("");
  const [expenses,setExpenses]= useState([]);
  const [loading,setLoading]= useState(true);
  const [deletingId,setDeletingId]= useState(null);
  const [selectedCategory,setSelectedCategory]= useState("All");
  const [sortBy,setSortBy]= useState("Newest");
  const [monthlyBudget,setMonthlyBudget]= useState(0);
  const [showBudgetModal,setShowBudgetModal]= useState(false);
  const [budgetInput,setBudgetInput]= useState("");
  const [showAllCards,setShowAllCards]= useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); return; }
      try {
        const r = await getExpenses();
        setExpenses(r.data);
      } 
      catch (e) {
        if (e.response?.status === 401) { localStorage.clear(); navigate("/"); return; }
        toast.error("Failed to load expenses");
      }

      try {
        const r = await getBudget();
        setMonthlyBudget(r.data?.monthlyBudget ?? 0);
      }
       catch (e) {
        if (e.response?.status === 401) { localStorage.clear(); navigate("/"); return; }
        setMonthlyBudget(0);
      } 
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSaveBudget = async () => {
    const budget = Number(budgetInput);
    if (isNaN(budget) || budget < 0) { toast.error("Enter a valid amount"); return; }
    try {
      await updateBudget(budget);
      setMonthlyBudget(budget);
      toast.success("Budget updated");
      setShowBudgetModal(false);
    }
     catch (e) {
      if (e.response?.status === 401) { localStorage.clear(); navigate("/"); return; }
      toast.error("Failed to update budget");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    setDeletingId(id);
    try {
      const r = await deleteExpense(id);
      toast.success(r.data.message);
      setExpenses((p) => p.filter((e) => e._id !== id));
    }
     catch (e) {
      if (e.response?.status === 401) { localStorage.clear(); navigate("/"); return; }
      toast.error(e.response?.data?.message || "Delete failed");
    } 
    finally { setDeletingId(null); }
  };

  const now  = new Date();
  const curM = now.getMonth(), curY = now.getFullYear();
  const lstM = curM === 0 ? 11 : curM - 1;
  const lstY = curM === 0 ? curY - 1 : curY;

  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const dateOk =
      activeFilter === "This month" ? d.getMonth() === curM && d.getFullYear() === curY :
      activeFilter === "Last month" ? d.getMonth() === lstM && d.getFullYear() === lstY :
      activeFilter === "This year"  ? d.getFullYear() === curY : true;
    return (e.title || "").toLowerCase().includes(searchTerm.toLowerCase())&& dateOk&& (selectedCategory === "All" || e.category === selectedCategory);
   });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy==="Newest") return new Date(b.date) - new Date(a.date);
    if (sortBy==="Oldest") return new Date(a.date) - new Date(b.date);
    if (sortBy==="Highest")return b.amount- a.amount;
    if (sortBy==="Lowest") return a.amount- b.amount;
    return 0;
  });

  const totalFiltered= filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const budgetLeft= monthlyBudget - totalFiltered;
  const budgetUsedPct= monthlyBudget > 0 ? Math.round((totalFiltered / monthlyBudget) * 100) : 0;

  const thisMonthTotal= expenses.filter((e) => {const d = new Date(e.date); return d.getMonth()===curM&&d.getFullYear()===curY; }).reduce((s,e)=>s+e.amount,0);
  const lastMonthTotal= expenses.filter((e) => {const d = new Date(e.date); return d.getMonth()===lstM&&d.getFullYear()===lstY; }).reduce((s,e)=>s+e.amount,0);
  const monthTrend= lastMonthTotal===0 ? 100 : Math.round(((thisMonthTotal-lastMonthTotal)/lastMonthTotal)*100);
  const todayTotal= expenses.filter((e)=>new Date(e.date).toDateString()===now.toDateString()).reduce((s,e)=>s+e.amount,0);

  const sow = new Date(); sow.setDate(sow.getDate()-sow.getDay());
  const weekTotal= expenses.filter((e)=>new Date(e.date)>=sow).reduce((s,e)=>s+e.amount,0);

  const catTotals = {};
  filteredExpenses.forEach((e) => { catTotals[e.category] = (catTotals[e.category]||0)+e.amount; });
  const spentByCat = {};

  filteredExpenses.forEach((e) => { spentByCat[e.category] = (spentByCat[e.category]||0)+e.amount; });

  const budgetItems = Object.keys(budgetLimits)
    .map((cat)=>({category:cat,spent:spentByCat[cat]||0,limit:budgetLimits[cat]}))
    .filter((i)=>i.spent>0);

  const monthlyData = Array.from({length:6},(_,i)=>{
    const d=new Date(curY,curM-(5-i),1),m=d.getMonth(),y=d.getFullYear();

    return {month:d.toLocaleDateString("en-IN",{month:"short"}),amount:expenses.filter((e)=>{const ed=new Date(e.date);return ed.getMonth()===m&&ed.getFullYear()===y;}).reduce((s,e)=>s+e.amount,0)};
  });

  const totalAll= filteredExpenses.reduce((s,e)=>s+e.amount,0)||1;
  const categoryData= Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([category,amount])=>({category,percentage:Math.round((amount/totalAll)*100),color:categoryColor[category]||"#64748b"}));
  const topCat= Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];
  const avgPerExp= filteredExpenses.length ? Math.round(totalFiltered/filteredExpenses.length) : 0;
  const highestExp= filteredExpenses.reduce((mx,e)=>(e.amount>mx.amount?e:mx),{amount:0,title:"—"});



  const primaryCards = [
    { label: "Total Expenses", value:`₹${totalFiltered.toLocaleString()}`, sub: activeFilter, trend:"neutral", icon:"ti-credit-card", gradient:"from-emerald-500 to-teal-400" },
    { label: "Budget Remaining", value:`₹${Math.max(budgetLeft, 0).toLocaleString()}`, sub: monthlyBudget > 0 ? `of ₹${monthlyBudget.toLocaleString()}` : "Set a budget", trend: budgetLeft < 0 ? "down" : "neutral", icon:"ti-target", gradient: budgetLeft < 0 ? "from-red-400 to-rose-500" : "from-violet-500 to-indigo-400" },
    { label: "Monthly Spending", value:`₹${thisMonthTotal.toLocaleString()}`, sub:`${Math.abs(monthTrend)}% vs last month`, trend: monthTrend > 0 ? "up" : monthTrend < 0 ? "down" : "neutral", icon:"ti-calendar-month", gradient:"from-blue-500 to-cyan-400" },
  ];
  const extraCards = [
    { label: "Transactions", value:String(filteredExpenses.length), sub:`${expenses.length} total`, trend:"neutral", icon:"ti-file-invoice", gradient:"from-amber-400 to-orange-400" },
    { label: "Today",value:`₹${todayTotal.toLocaleString()}`, sub:"Today's spending", trend:"neutral", icon:"ti-clock", gradient:"from-pink-500 to-rose-400" },
    { label: "This Week",value:`₹${weekTotal.toLocaleString()}`,sub:"Weekly total",trend:"neutral", icon:"ti-calendar-week", gradient:"from-indigo-500 to-purple-400" },
  ];

  const dashTitle = user.role==="superadmin" ? "Global Dashboard" : user.role==="admin"? "Admin Dashboard" :"My Dashboard";

  if (loading) return (
    <DashboardLayout title={dashTitle}>
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={dashTitle}>
      <div className="px-4 md:px-6 py-5 flex flex-col gap-5 max-w-7xl mx-auto w-full">

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {["This month","Last month","This year"].map((f)=>(
              <button key={f} onClick={()=>setActiveFilter(f)}
                className={["px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all",
                  activeFilter===f?"bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200":"bg-white text-gray-600 border-gray-200 hover:border-gray-300"].join(" ")}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm outline-none focus:border-emerald-400 w-36 md:w-48" />
            <select value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)}
              className="px-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm outline-none focus:border-emerald-400">
              {["All","Food","Transport","Shopping","Health","Entertainment","Education","Bills","Other"].map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm outline-none focus:border-emerald-400">
              {["Newest","Oldest","Highest","Lowest"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-inbox text-3xl text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-1">No expenses yet</h3>
            <p className="text-gray-400 text-sm mb-5">Start tracking by adding your first expense</p>
            <button onClick={()=>navigate("/addexpense")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-colors shadow-sm">
              Add Expense
            </button>
          </div>
        ) : (<>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {primaryCards.map((c)=>(
                <div key={c.label} className={`bg-linear-to-br ${c.gradient} rounded-2xl p-5 text-white shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-xs font-medium uppercase tracking-wide">{c.label}</span>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className={`ti ${c.icon} text-sm`} />
                  </div>
                  </div>
                  <p className="text-2xl font-bold mb-1 truncate">{c.value}</p>
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    {c.trend==="up" && <i className="ti ti-arrow-up text-red-200" />}
                    {c.trend==="down" && <i className="ti ti-arrow-down text-emerald-200" />}
                  {c.sub}
                </p>
              </div>
            ))}
          </div>

     <div className="hidden sm:grid sm:grid-cols-3 gap-4">
       {extraCards.map((c)=>(
              <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 bg-linear-to-br ${c.gradient} rounded-xl flex items-center justify-center text-white shrink-0`}>
                 <i className={`ti ${c.icon} text-base`} />
                  </div>
               <span className="text-xs text-gray-500 font-medium">{c.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
              </div>
       ))}
          </div>

          <div className="sm:hidden">
            {showAllCards && (
              <div className="grid grid-cols-1 gap-3">
                {extraCards.map((c)=>(
                  <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className={`w-10 h-10 bg-linear-to-br ${c.gradient} rounded-xl flex items-center justify-center text-white shrink-0`}>
                     <i className={`ti ${c.icon} text-lg`} />
                    </div>
                  <div>
                     <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                     <p className="text-lg font-bold text-gray-900">{c.value}</p>
                     <p className="text-xs text-gray-400">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={()=>setShowAllCards(p=>!p)}
              className="w-full mt-2 flex items-center justify-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-xl border border-emerald-200 cursor-pointer transition-colors">
              <i className={`ti ${showAllCards?"ti-chevron-up":"ti-chevron-down"} text-sm`} />
              {showAllCards ? "Hide insights" : "View more insights"}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Budget Overview</p>
              <p className="text-xl font-bold text-gray-900 mt-1 truncate">
                {monthlyBudget > 0? `₹${(budgetLeft < 0 ? 0 : budgetLeft).toLocaleString()} Remaining`: "No budget set"}
                </p>
              {monthlyBudget > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {budgetUsedPct}% used · ₹{totalFiltered.toLocaleString()} spent
                </p>
              )}
            </div>
            <button type="button" onClick={() => { setBudgetInput(String(monthlyBudget)); setShowBudgetModal(true); }}
              className="shrink-0 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl cursor-pointer transition-colors">
              Manage Budget
            </button>
          </div>

          <div className="hidden sm:grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
              <div className="h-55">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                    <XAxis dataKey="month" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={CHART_AXIS_TICK} tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v)=>[`₹${Number(v).toLocaleString()}`,"Spent"]} />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{r:3,fill:"#10b981",strokeWidth:0}} activeDot={{r:5}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
         <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              {categoryData.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {categoryData.map((d)=>(
                    <div key={d.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{background:d.color}} />{d.category}</span>
                        <span className="text-xs font-medium text-gray-900">{d.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{width:`${d.percentage}%`,background:d.color}} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No data for this period.</p>}
           </div>
         </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
              <div className="flex gap-3">
                <button onClick={()=>navigate("/reports")}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors font-medium">
                  <i className="ti ti-chart-bar text-xs" /> Reports
                </button>
                <button onClick={()=>navigate("/expenses")}
                  className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 cursor-pointer transition-colors font-medium">
                  <i className="ti ti-list text-xs" /> View all
                </button>
                <button onClick={()=>navigate("/addexpense")} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg border-none cursor-pointer transition-colors font-medium">Add</button>
              </div>
            </div>
            {sortedExpenses.length === 0 ? (
              <p className="text-gray-400 text-sm px-5 py-8 text-center">No transactions for this period.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {sortedExpenses.slice(0, 5).map((exp)=>(
                  <div key={exp._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:categoryBg[exp.category]}}>
                      <i className={`ti ${categoryIcon[exp.category]??"ti-dots"} text-base`} style={{color:categoryColor[exp.category]}} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{exp.title}</p>
                      <p className="text-xs text-gray-400">{exp.category} · {formatDate(exp.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-500 shrink-0">-₹{exp.amount.toLocaleString()}</span>
                    <ExpenseRowActions onEdit={() => navigate(`/editexpense/${exp._id}`)} onDelete={() => handleDelete(exp._id)} deleting={deletingId === exp._id} />
                  </div>
                ))}
              </div>
            )}
          </div>

        {budgetItems.length > 0 && (
            <div className="hidden sm:block bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Category Budget Tracker</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {budgetItems.map((item)=>{
                  const pct=Math.min((item.spent/item.limit)*100,100);
                  const over=item.spent>item.limit;
               return (
                    <div key={item.category} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-xs font-medium ${over?"text-red-500":"text-gray-700"}`}>{item.category}{over?" ⚠":""}</span>
                        <span className="text-xs text-gray-400">₹{item.spent.toLocaleString()} / ₹{item.limit.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`,background:budgetBarColor(item.spent,item.limit)}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>)}
      </div>

      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e)=>{if(e.target===e.currentTarget)setShowBudgetModal(false);}}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-gray-900 font-semibold text-lg mb-1">Set Monthly Budget</h3>
            <p className="text-gray-400 text-sm mb-5">Set a spending cap for the current month.</p>
            <input type="number" min="0" value={budgetInput} autoFocus
              onChange={(e)=>setBudgetInput(e.target.value)}
              onKeyDown={(e)=>{if(e.key==="Enter")handleSaveBudget();if(e.key==="Escape")setShowBudgetModal(false);}}
              placeholder="e.g. 20000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-emerald-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={()=>setShowBudgetModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveBudget}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold border-none cursor-pointer transition-colors">
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardContent;
