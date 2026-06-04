export const NAV_CONFIG = [
  { label: "Dashboard", icon: "ti-home", path: "/dashboard", roles: ["user", "admin", "superadmin"] },
  { label: "Add Expense", icon: "ti-plus", path: "/addexpense", roles: ["user", "admin", "superadmin"] },
  { label: "Reports", icon: "ti-chart-bar", path: "/reports", roles: ["user", "admin", "superadmin"] },
  { label: "Team Expenses", icon: "ti-users", path: "/team", roles: ["admin", "superadmin"], section: "Team" },
  { label: "Team Reports", icon: "ti-chart-dots", path: "/teamreports", roles: ["admin", "superadmin"] },
  { label: "Manage Team", icon: "ti-user-plus", path: "/manageteam", roles: ["admin", "superadmin"] },
  { label: "Manage Users", icon: "ti-user-star", path: "/manageusers", roles: ["superadmin"], section: "Admin" },
  { label: "Analytics", icon: "ti-chart-line", path: "/analytics", roles: ["superadmin"] },
];

export function getInitials(name) {
  return (name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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
  return NAV_CONFIG.filter((item) => item.roles.includes(r));
}

export function getDashboardPath(role) {
  if (role === "superadmin") return "/superadmin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}
