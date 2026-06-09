import { useNavigate, useLocation } from "react-router-dom";
import { getVisibleNav, getInitials, roleLabel } from "./navConfig";

const NavItem = ({ item, collapsed, isActive, onNavigate }) => (
  <button type="button" onClick={() => onNavigate(item.path)} title={collapsed ? item.label : undefined}
    className={["flex items-center gap-2.5 px-2.5 py-2.25 rounded-lg cursor-pointer border-none w-full text-left whitespace-nowrap overflow-hidden text-[13px] transition-all duration-150",
      isActive ? "bg-emerald-500/15 text-emerald-600 font-medium" : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",].join(" ")}>
    
      <i className={`ti ${item.icon} text-[18px] min-w-5 shrink-0`} />
    {!collapsed && <span className="truncate">{item.label}</span>}
  </button>
);

const Sidebar = ({ collapsed, onToggleCollapse, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Current Path:", location.pathname);
  const visibleNav = getVisibleNav(user.role);

  const isActive = (path) => location.pathname === path ||location.pathname.endsWith(path) ;

  let lastSection = null;

  return (
    <aside className={["hidden md:flex flex-col bg-white border-r border-gray-200 shrink-0 h-full", "transition-[width] duration-200 ease-in-out shadow-xl", collapsed ? "w-15" : "w-55",].join(" ")}>
      <div className="flex items-center gap-2.5 px-3 py-5 border-b border-gray-200 shrink-0">
          <div className="w-8 h-8 min-w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-base shrink-0">
            <i className="ti ti-wallet" />
          </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold text-gray-900 whitespace-nowrap truncate">Expense Meter</span>
        )}
        <button type="button" onClick={onToggleCollapse}
          className="ml-auto bg-transparent border-none text-gray-400 cursor-pointer text-lg flex items-center hover:text-gray-700 transition-colors shrink-0" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <i className={ collapsed ? "ti ti-layout-sidebar-left-expand" : "ti ti-layout-sidebar-left-collapse"}/>
        </button>
      </div>

     <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {visibleNav.map((item) => {
         const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section;
          return (
            <div key={item.label}>
              {showSection && !collapsed && (
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2.5 pt-4 pb-1 font-semibold select-none">
                    {item.section}
                  </div>
              )}
              <NavItem item={item} collapsed={collapsed} isActive={isActive(item.path)} onNavigate={navigate}/>
            </div>
          );
        })}
     </nav>

      <div className="px-2 py-3 border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 overflow-hidden">
          <div className="w-8 h-8 min-w-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {getInitials(user.name)}
          </div>
          {!collapsed && (
            <>
              <div className="overflow-hidden flex-1 min-w-0">
                 <p className="text-[14px] font-medium text-gray-900 truncate">{user.name}</p>
                 <p className="text-[12  px] text-gray-500">{roleLabel(user.role)}</p>
              </div>
              <button type="button" onClick={onLogout} title="Logout"
                className="shrink-0 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer transition-colors">
                <i className="ti ti-logout text-[26px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
