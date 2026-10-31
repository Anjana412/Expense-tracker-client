import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getPlatformStats } from "../api/api";
import { CHART_TOOLTIP_STYLE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "../components/ui/chartTheme";
import { downloadCSV, errMsg } from "../utils/format";

const ChartCard = ({ title, subtitle, data, color }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-w-0">
    <h3 className="text-sm font-semibold text-gray-900 m-0">{title}</h3>
    <p className="text-xs text-gray-500 mt-1 mb-4">{subtitle}</p>
    <div className="h-52 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [v, "Count"]} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const GlobalAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    getPlatformStats()
      .then((r) => { setStats(r.data); setFailed(false); })
      .catch((e) => { setFailed(true); toast.error(errMsg(e, "Could not load platform statistics")); })
      .finally(() => setLoading(false));
  }, [tick]);

  if (loading) {
    return (
      <DashboardLayout title="Platform Analytics">
        <div className="flex justify-center py-16" role="status" aria-label="Loading">
          <span className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (failed || !stats) {
    return (
      <DashboardLayout title="Platform Analytics">
        <div className="px-4 py-16 text-center">
          <p className="text-gray-900 font-medium mb-1">Statistics are unavailable right now.</p>
          <p className="text-sm text-gray-500 mb-4">Check that the server is running, then try again.</p>
          <button type="button" onClick={() => { setLoading(true); setTick((t) => t + 1); }}
            className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-700 text-white text-sm font-semibold border-none cursor-pointer">Try again</button>
        </div>
      </DashboardLayout>
    );
  }

  const { users, workspaces, sizeBuckets, signupsByMonth, workspacesByMonth } = stats;
  const tiles = [
    ["Registered users", users.total, `${users.regular} personal, ${users.admins} admin, ${users.superadmins} super admin`, "ti-users"],
    ["Users in a workspace", users.inWorkspaces, "Belong to at least one workspace", "ti-user-check"],
    ["Workspaces", workspaces.total, "Company workspaces created", "ti-building"],
    ["Workspace members", workspaces.activeMemberships, `${workspaces.averageMembers} per workspace on average`, "ti-users-group"],
    ["Pending invitations", workspaces.pendingInvites, "Waiting for the user to accept", "ti-mail"],
  ];

  const exportCSV = () =>
    downloadCSV("platform-statistics.csv", [
      ["Metric", "Value"],
      ["Registered users", users.total], ["Personal users", users.regular], ["Admin accounts", users.admins],
      ["Super admin accounts", users.superadmins], ["Users in a workspace", users.inWorkspaces],
      ["Workspaces", workspaces.total], ["Active workspace members", workspaces.activeMemberships],
      ["Pending invitations", workspaces.pendingInvites], ["Average members per workspace", workspaces.averageMembers],
      [],
      ["Month", "New users", "New workspaces"],
      ...signupsByMonth.map((m, i) => [`${m.label} ${m.year}`, m.count, workspacesByMonth[i]?.count ?? 0]),
      [],
      ["Workspace size", "Workspaces"],
      ...sizeBuckets.map((b) => [b.label, b.count]),
    ]);

  return (
    <DashboardLayout title="Platform Analytics">
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-gray-600 max-w-2xl m-0">
            How the platform is being used. These are counts only: personal and company expenses are private and are not shown to the platform owner.
          </p>
          <button type="button" onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
            <i className="ti ti-download" aria-hidden="true" /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {tiles.map(([label, value, sub, icon]) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide m-0 flex items-center gap-1.5">
                <i className={`ti ${icon}`} aria-hidden="true" /> {label}
              </p>
              <p className="text-2xl font-bold text-gray-900 m-0 mt-1.5 tabular-nums">{value}</p>
              <p className="text-xs text-gray-500 m-0 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ChartCard title="New users per month" subtitle="Accounts registered, last 6 months" data={signupsByMonth} color="#8b5cf6" />
          <ChartCard title="New workspaces per month" subtitle="Company workspaces created, last 6 months" data={workspacesByMonth} color="#10b981" />
        </div>

        <ChartCard title="Workspace sizes" subtitle="Number of workspaces by active member count" data={sizeBuckets} color="#3b82f6" />
      </div>
    </DashboardLayout>
  );
};

export default GlobalAnalytics;
