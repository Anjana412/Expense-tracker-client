import { useNavigate } from "react-router-dom";
import { getDashboardPath, getStoredUser } from "./navConfig";

const BackToDashboardButton = ({ className = "" }) => {
  const navigate = useNavigate();
  const stored = getStoredUser();
  const path = getDashboardPath(stored.role);

  return (
    <button type="button" onClick={() => navigate(path)} 
      className={[ "inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900","bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg","cursor-pointer transition-colors shadow-sm",
        className, ].join(" ")}>
        <i className="ti ti-arrow-left text-base" />
      </button>
  );
};

export default BackToDashboardButton;
