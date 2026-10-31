export const NAV_CONFIG = [
  { label: "Dashboard", icon: "ti-home", path: "/dashboard", roles: ["user", "admin", "superadmin"], dashboardItem:true },
  { label: "Add Expense", icon: "ti-plus", path: "/addexpense", roles: ["user", "admin", "superadmin"] },
  { label: "Reports", icon: "ti-chart-bar", path: "/reports", roles: ["user", "admin", "superadmin"] },
  { label: "Workspaces", icon: "ti-building", path: "/workspaces", roles: ["user", "admin"], section: "Company" },
  { label: "Manage Admins", icon: "ti-shield",     path: "/superadmin/admins",    roles: ["superadmin"] },
  { label: "All Workspaces", icon: "ti-building-community", path: "/superadmin/workspaces", roles: ["superadmin"] },
  { label: "Analytics", icon: "ti-chart-line", path: "/analytics", roles: ["superadmin"] },
];

export function getInitials(name) {
  return (name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);}

export function roleLabel(role) {
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "User";
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } 
  catch {
    return {};
  }
}

export function getVisibleNav(role) {
  const r = role || "user";
  const dashPath = getDashboardPath(r);
  return NAV_CONFIG
    .filter((item) => item.roles.includes(r))
    .map((item) => item.dashboardItem ? { ...item, path: dashPath } : item);
}

export function getDashboardPath(role) {
  if (role === "superadmin") return "/superadmin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}
