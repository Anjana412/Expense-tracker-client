import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import { getStoredUser, getVisibleNav, roleLabel } from "./navConfig";

export { NAV_CONFIG, getVisibleNav, roleLabel, getStoredUser, getDashboardPath } from "./navConfig";
export { default as BackToDashboardButton } from "./BackToDashboardButton";

const DashboardLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const stored = getStoredUser();
  const user = { name: stored.name || "User", role: stored.role || "user" };

  const visibleNav = getVisibleNav(user.role);
  const activeLabel = visibleNav.find((item) =>
        location.pathname === item.path ||(item.path !== "/dashboard" && location.pathname.startsWith(item.path))
      )?.label ?? "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex h-dvh bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((p) => !p)} user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileNavbar user={user} onLogout={handleLogout} />

        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center gap-3 shrink-0">
           <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate"> {title || activeLabel} </h1>
              <p className="text-[11px] text-gray-500 mt-0.5 hidden sm:block"> {roleLabel(user.role)} · Expense Meter</p>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
