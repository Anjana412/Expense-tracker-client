// A hand-built illustration of the real dashboard layout. All numbers are SAMPLE data.
const trend = [38, 52, 44, 61, 49, 71];
const X = (i) => 20 + i * 76;
const points = trend.map((v, i) => `${X(i)},${88 - v}`).join(" ");
const cats = [
  ["Food", 38, "#10b981"], ["Bills", 24, "#fb923c"], ["Transport", 18, "#3b82f6"], ["Shopping", 12, "#f59e0b"], ["Other", 8, "#64748b"],
];
const rows = [
  ["Groceries", "Food", "Today", "₹1,250"], ["Metro card", "Transport", "Yesterday", "₹500"], ["Electricity bill", "Bills", "3 Oct", "₹2,100"],
];

const DashboardPreview = () => (
  <figure className="m-0" aria-label="Illustration of the Expense Meter dashboard using sample data">
    <div className="rounded-lg bg-white shadow-[0_2px_0_rgba(27,26,46,0.08),0_16px_40px_rgba(27,26,46,0.08)] border border-[#1B1A2E]/15 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /><span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <span className="ml-3 text-xs text-gray-500">My Dashboard</span>
      </div>
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ["Total expenses", "₹14,200", "This month", "from-emerald-500 to-teal-400"],
            ["Budget remaining", "₹5,800", "of ₹20,000", "from-violet-500 to-indigo-400"],
            ["This week", "₹3,350", "Sunday to today", "from-blue-500 to-cyan-400"],
          ].map(([label, value, sub, grad]) => (
            <div key={label} className={`rounded-md p-4 text-white bg-linear-to-br ${grad}`}>
              <p className="text-xs text-white/85 m-0">{label}</p>
              <p className="text-xl font-bold m-0 mt-1 tabular-nums">{value}</p>
              <p className="text-xs text-white/80 m-0 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-3">
          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 m-0 mb-2">Monthly spending trend</p>
            <svg viewBox="0 0 400 100" className="w-full h-auto" aria-hidden="true">
              {[28, 52, 76].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#F3F4F6" />)}
              <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {trend.map((v, i) => <circle key={i} cx={X(i)} cy={88 - v} r="3.5" fill="#10b981" />)}
            </svg>
          </div>
          <div className="rounded-md border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 m-0 mb-3">Category breakdown</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {cats.map(([name, pct, color]) => (
                <li key={name}>
                  <div className="flex justify-between text-xs text-gray-700 mb-1"><span>{name}</span><span className="tabular-nums">{pct}%</span></div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct * 2}%`, background: color }} /></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-md border border-gray-200 overflow-hidden">
          <p className="text-sm font-semibold text-gray-900 m-0 px-4 py-3 border-b border-gray-100">Recent transactions</p>
          <ul className="list-none p-0 m-0 divide-y divide-gray-100">
            {rows.map(([title, cat, when, amt]) => (
              <li key={title} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0"><p className="text-sm font-medium text-gray-900 m-0 truncate">{title}</p><p className="text-xs text-gray-500 m-0">{cat} · {when}</p></div>
                <span className="text-sm font-semibold text-red-500 tabular-nums shrink-0">-{amt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    <figcaption className="font-mono text-xs text-gray-600 mt-3">Sample data for illustration. Your dashboard shows your own expenses.</figcaption>
  </figure>
);

export default DashboardPreview;
