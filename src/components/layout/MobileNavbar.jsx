import { useNavigate, useLocation } from "react-router-dom";
import { getVisibleNav } from "./navConfig";

const MobileNavbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const visibleNav = getVisibleNav(user.role);

  const isActive = (path) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  return (
    <nav
      className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
      aria-label="Mobile navigation">
      <div className="flex items-center justify-between gap-1 px-2 py-2 overflow-x-auto scrollbar-none">
        {visibleNav.map((item) => {
          const active = isActive(item.path);
      
          return (
            <button key={item.path} type="button" onClick={() => navigate(item.path)} title={item.label} aria-label={item.label} aria-current={active ? "page" : undefined}
              className={[ "flex flex-col items-center justify-center min-w-11 h-11 px-2 rounded-xl border-none cursor-pointer transition-all duration-200 shrink-0",
                active ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25" : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800",].join(" ")}>
              <i className={`ti ${item.icon} text-[20px]`} />
            </button>
          );
        })}
        <button type="button" onClick={onLogout} title="Logout" aria-label="Logout"
          className="flex flex-col items-center justify-center min-w-11 h-11 px-2 rounded-xl border-none cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 shrink-0" >
          <i className="ti ti-logout text-[20px]" />
        </button>
      </div>
    </nav>
  );
};

export default MobileNavbar;
