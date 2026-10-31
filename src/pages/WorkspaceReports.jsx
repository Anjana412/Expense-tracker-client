import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import WorkspaceTabs from "../components/workspace/WorkspaceTabs";
import { getWorkspace, getCompanySummary } from "../api/api";
import { CHART_TOOLTIP_STYLE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "../components/ui/chartTheme";
import { errMsg, formatINR, downloadCSV } from "../utils/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const WorkspaceReports = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [info, setInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWorkspace(id), getCompanySummary(id, year)])
      .then(([w, s]) => {
        setInfo(w.data);
        setSummary(s.data);
      })
      .catch((err) => {
        toast.error(errMsg(err, "Could not load the report"));
        navigate("/workspaces", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, year, navigate]);

  if (loading || !info || !summary) {
    return (
      <DashboardLayout title="Company Reports">
        <div className="flex justify-center py-16" role="status" aria-label="Loading">
          <span className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = info.myRole === "admin";
  const { overall, budget, byCategory, byMonth, byMember } = summary;
  const monthly = byMonth.map((m) => ({ month: MONTHS[m.monthNumber - 1], amount: m.totalAmount }));
  const exportSummary = () => {
    const rows = [
      [`${info.workspace.name} - company report`, `Year ${summary.year}`],
      ["Rejected expenses are not counted"],
      [],
      ["Total company spend (all time)", overall.totalAmount, `${overall.count} expenses`],
      ["Spent this month", budget.spentThisMonth],
      ["Monthly budget", budget.monthlyBudget],
      ["Budget remaining", budget.remaining === null ? "No budget set" : budget.remaining],
      [],
      ["By category (all time)", "Total", "Expenses"],
      ...byCategory.map((c) => [c.category, c.totalAmount, c.count]),
      [],
      [`By month, ${summary.year}`, "Total", "Expenses"],
      ...byMonth.map((m) => [MONTHS[m.monthNumber - 1], m.totalAmount, m.count]),
    ];
    if (isAdmin) rows.push([], ["By member (all time)", "Total", "Expenses"], ...byMember.map((m) => [m.name, m.totalAmount, m.count]));
    downloadCSV(`${info.workspace.name}-report-${summary.year}.csv`, rows);
  };

  const maxCat = Math.max(1, ...byCategory.map((c) => c.totalAmount));
  const usedPct = budget.monthlyBudget > 0 ? Math.round((budget.spentThisMonth / budget.monthlyBudget) * 100) : 0;
  const over = budget.monthlyBudget > 0 && budget.spentThisMonth > budget.monthlyBudget;

  return (
    <DashboardLayout title="Company Reports">
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-5">
        <WorkspaceTabs id={id} name={info.workspace.name} role={info.myRole} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {isAdmin ? "Company-wide spending." : "Your own company spending."} Rejected expenses are not counted.
          </p>
          <div className="flex items-center gap-2">
            {overall.count > 0 && (
              <button type="button" onClick={exportSummary}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                <i className="ti ti-download" aria-hidden="true" /> Export CSV
              </button>
            )}
            <label htmlFor="rep-year" className="sr-only">Year</label>
            <select id="rep-year" value={year} onChange={(e) => { setLoading(true); setYear(Number(e.target.value)); }}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500">
              {Array.from({ length: 6 }, (_, i) => thisYear - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {overall.count === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <h3 className="text-gray-900 font-semibold mb-1">No company spending to report yet</h3>
            <p className="text-sm text-gray-500">Reports appear once company expenses are added in the Expenses tab.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "Total company spend", value: formatINR(overall.totalAmount), sub: `${overall.count} expenses, all time` },
                { label: "This month", value: formatINR(budget.spentThisMonth), sub: budget.monthlyBudget > 0 ? `of ${formatINR(budget.monthlyBudget)} budget` : "No budget set" },
                { label: "Budget remaining", value: budget.remaining === null ? "—" : formatINR(Math.max(budget.remaining, 0)), sub: budget.remaining === null ? "Set a budget in Overview" : over ? "Over budget" : `${usedPct}% used` },
              ].map((c) => (
                <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                  <p className={`text-xl font-bold mt-1 truncate ${c.label === "Budget remaining" && over ? "text-red-600" : "text-gray-900"}`}>{c.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>

            {budget.monthlyBudget > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-900">Monthly budget</span>
                  <span className={over ? "text-red-600 font-semibold" : "text-gray-600"}>{usedPct}% used{over ? " (over budget)" : ""}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(usedPct, 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Monthly budget used">
                  <div className={`h-full rounded-full ${over ? "bg-red-500" : usedPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(usedPct, 100)}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Spending by month, {summary.year}</h3>
                <div className="h-60 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                      <XAxis dataKey="month" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis tick={CHART_AXIS_TICK} tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)} axisLine={false} tickLine={false} width={48} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [formatINR(v), "Spent"]} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">By category (all time)</h3>
                <ul className="flex flex-col gap-3">
                  {byCategory.map((c) => (
                    <li key={c.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{c.category} <span className="text-gray-400">· {c.count}</span></span>
                        <span className="font-medium text-gray-900">{formatINR(c.totalAmount)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(c.totalAmount / maxCat) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {isAdmin && byMember.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-900 px-5 py-4 border-b border-gray-100">Spending by member (all time)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Member", "Expenses", "Total"].map((h) => (
                          <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {byMember.map((m) => (
                        <tr key={String(m.userId)}>
                          <td className="px-5 py-3 font-medium text-gray-900">{m.name}</td>
                          <td className="px-5 py-3 text-gray-600">{m.count}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900">{formatINR(m.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkspaceReports;
