import { NavLink, Link } from "react-router-dom";

const tabClass = ({ isActive }) =>
  [
    "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
    isActive ? "bg-violet-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100",
  ].join(" ");

const WorkspaceTabs = ({ id, name, role }) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-3">
      <Link to="/workspaces" aria-label="Back to workspaces"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
        <i className="ti ti-arrow-left text-base" /> Workspaces
      </Link>
      <h2 className="text-lg font-semibold text-gray-900 truncate">{name}</h2>
      {role && (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${role === "admin" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
          {role === "admin" ? "Admin" : "Member"}
        </span>
      )}
    </div>
    <nav aria-label="Workspace sections" className="flex gap-1.5 overflow-x-auto pb-1">
      <NavLink end to={`/workspaces/${id}`} className={tabClass}>Overview</NavLink>
      <NavLink to={`/workspaces/${id}/expenses`} className={tabClass}>Expenses</NavLink>
      <NavLink to={`/workspaces/${id}/reports`} className={tabClass}>Reports</NavLink>
    </nav>
  </div>
);

export default WorkspaceTabs;
