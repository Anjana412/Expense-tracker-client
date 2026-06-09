import { useEffect, useMemo, useState } from "react";
import { getExpenses, getExpenseSummary, getMonthlyTrend } from "../api/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";
import {CHART_TOOLTIP_STYLE, CHART_AXIS_TICK, CHART_GRID_STROKE, CHART_COLORS } from "../components/ui/chartTheme";
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,PieChart, Pie, Cell, Legend, CartesianGrid,} from "recharts";


function normalizeExpenses(data) {
  if (Array.isArray(data)) return data;
  if (data?.expenses && Array.isArray(data.expenses)) return data.expenses;
  return [];
}

function expenseAmount(e) {
  return Number(e?.amount) || 0;
}

const Reports = () => {
  const [expenses, setExpenses]= useState([]);
  const [loading, setLoading]= useState(true);
  const [loadError, setLoadError]= useState(null);
  const [summary, setSummary]= useState([]);
  const [overall, setOverall]= useState(null);
  const [monthlyTrend, setMonthlyTrend]= useState([]);

  const currentYear= new Date().getFullYear();
  const years= ["all", ...Array.from({ length: 6 }, (_, i)=> currentYear - i)];
  const [selectedYear, setSelectedYear]= useState("all");
  const [selectedMonth, setSelectedMonth]= useState("all");
  const [categoryFilter, setCategoryFilter]= useState("All");

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    let done = 0;
    const finish = () => {
      done += 1;
      if (done === 3) setLoading(false);
    };

    getExpenses()
      .then((r) => setExpenses(normalizeExpenses(r.data)))
      .catch((err) => {
        setExpenses([]);
        setLoadError(err.response?.data?.message || "Could not load expenses");
      })
      .finally(finish);

    getExpenseSummary()
      .then((r) => {
        setSummary(r.data?.byCategory || []);
        setOverall(r.data?.overall ?? null);
      })
      .catch(() => {})
      .finally(finish);

    const trendYear = selectedYear === "all" ? currentYear:Number(selectedYear);
    getMonthlyTrend(trendYear)
      .then((r) => setMonthlyTrend(r.data?.trend || []))
      .catch(() => setMonthlyTrend([]))
      .finally(finish);
  }, [selectedYear, currentYear]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      if (Number.isNaN(d.getTime())) return false;
      const yearOk=
        selectedYear==="all" || d.getFullYear() === Number(selectedYear);
      const monthOk=selectedMonth === "all" || d.getMonth()===Number(selectedMonth);
      const catOk = categoryFilter === "All" || e.category === categoryFilter;
      return yearOk && monthOk && catOk;
    });
  }, [expenses, selectedYear, selectedMonth, categoryFilter]);

  const totalSpent = filteredExpenses.reduce((s, e) => s + expenseAmount(e), 0);
  const totalTransactions = filteredExpenses.length;
  const highestExpense = filteredExpenses.length? filteredExpenses.reduce((p, c) =>expenseAmount(c) > expenseAmount(p) ? c : p): null;

  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + expenseAmount(e);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const categories = ["All", ...new Set(expenses.map((e) => e.category).filter(Boolean))];

  const monthlyData = useMemo(() => {
    if (monthlyTrend.length > 0 && selectedYear !== "all") {
      return monthlyTrend.map((t) => ({
        month: t.month,
        amount: Number(t.totalAmount) || 0,
      }));
    }
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const totals = Array(12).fill(0);
    filteredExpenses.forEach((e) => {
      totals[new Date(e.date).getMonth()] += expenseAmount(e);
    });
    return months.map((month, i) => ({ month, amount: totals[i] }));
  }, [monthlyTrend, filteredExpenses, selectedYear]);

  const pieData = useMemo(
    () => Object.entries(categoryTotals).map(([name, value]) => ({ name, value })),
    [categoryTotals]
  );

  const recentTransactions = [...filteredExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const exportCSV = () => {
    const rows = [
      ["Title", "Amount","Category", "Date", "Description"],
      ...filteredExpenses.map((e) => [
        e.title,
        expenseAmount(e),
        e.category,
        new Date(e.date).toLocaleDateString(),
        e.description || "",
      ]),
    ];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" })
    );
    link.download = "expense-report.csv";
    link.click();
  };

  if (loading) {
    return (
      <DashboardLayout title="Reports">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> <span className="text-gray-500 text-sm">Loading reports…</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
     <DashboardLayout title="Reports & Analytics">
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackToDashboardButton />
          <button type="button" onClick={exportCSV}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl border-none cursor-pointer transition-colors shadow-sm"><i className="ti ti-download" /> Export CSV
          </button>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{loadError}</div>
        )}

        {expenses.length > 0 && filteredExpenses.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">No expenses match the current filters. Try &quot;All Years&quot; or a different month.</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filters</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={selectedYear} onChange={(e) =>setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-emerald-400">
              <option value="all">All Years</option>
              {years.filter((y) => y !== "all").map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-emerald-400" >
              <option value="all">All Months</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                (m, i) => ( <option key={m} value={i}>{m}</option>)
              )}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white outline-none focus:border-emerald-400">
              {categories.map((c) => ( <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            {label: "Total Spent", value:`₹${totalSpent.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50", icon: "ti-wallet" },
            {label: "Transactions", value: String(totalTransactions), color: "text-blue-600", bg: "bg-blue-50", icon: "ti-file-invoice" },
            {label:"Highest Expense", value: highestExpense ?`₹${expenseAmount(highestExpense).toLocaleString()}` : "₹0", color: "text-red-600", bg: "bg-red-50", icon: "ti-trending-up" },
            {label: "Top Category", value: topCategory, color: "text-amber-600", bg: "bg-amber-50", icon: "ti-award" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow hover:bg-gray-100 min-w-0">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <i className={`ti ${s.icon} ${s.color} text-lg`} />
              </div>
              <p className="text-[15px] text-gray-600 font-medium">{s.label}</p>
              <p className={`text-lg md:text-xl font-bold mt-1 ${s.color} truncate`}>{s.value}</p>
              {s.label === "Highest Expense" && highestExpense && (
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{highestExpense.title}</p>
              )}
            </div>
          ))}
        </div>

        {overall && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Aggregated Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                {label: "All-time total", value:`₹${Number(overall.totalAmount).toLocaleString()}`,color: "text-emerald-600" },
                {label: "All expenses",value: String(overall.totalCount), color: "text-gray-900" },
                {label: "Avg/expense", value:`₹${Number(overall.avgAmount).toLocaleString()}`,color: "text-amber-600" },
                {label: "Highest single",value:`₹${Number(overall.maxAmount).toLocaleString()}`, color:"text-red-600" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 min-w-0">
                  <p className="text-[13px] text-gray-700 mb-1">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color} truncate`}>{s.value}</p>
                </div>
              ))}
            </div>
           {summary.length > 0 && (
             <div className="overflow-x-auto -mx-1">
                <table className="w-full text-[14px]">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-200">
                      {["Category", "Total", "Count", "Avg", "Max"].map((h) => (
                      <th key={h} className="text-left text-[11px] text-gray-600 font-semibold px-3 py-2.5 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                  </tr>
                  </thead>
                <tbody className="divide-y divide-gray-100">
                    {summary.map((row) => (
                      <tr key={row.category} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium text-gray-900">{row.category}</td>
                        <td className="px-3 py-2.5 text-emerald-600 font-semibold">₹{Number(row.totalAmount).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-gray-800">{row.count}</td>
                        <td className="px-3 py-2.5 text-amber-600">₹{Number(row.avgAmount).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-red-600">₹{Number(row.maxAmount).toLocaleString()}</td>
                    </tr>
                    ))}
               </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Spending</h3>
            <div className="h-60 sm:h-70 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                  <XAxis dataKey="month" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={CHART_AXIS_TICK} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={48} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Spent"]} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Category Distribution</h3>
            {pieData.length === 0 ? (
              <div className="h-60 sm:h-70 flex items-center justify-center text-gray-500 text-sm">
               No data for this period
              </div>
            ) : (
              <div className="h-60 sm:h-70 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="70%" innerRadius="40%" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` } labelLine={false}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Amount"]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#374151" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
            <span className="text-xs text-gray-500">{recentTransactions.length} shown</span>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No transactions for the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[15px]">
                <thead className="sticky top-0 bg-gray-50">
                 <tr className="border-b border-gray-200">
                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Category</th>
                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Date</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTransactions.map((e) => (
                    <tr key={e._id} className="hover:bg-gray-50 h-12">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-35 truncate">{e.title}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{e.category}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">₹{expenseAmount(e).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell whitespace-nowrap">
                        {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
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

export default Reports;
