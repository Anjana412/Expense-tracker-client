import { Navigate } from "react-router-dom";
import { getDashboardPath } from "./layout/navConfig";
import { getSession, clearSession } from "../utils/auth";

/**
 * UX guard only: the backend enforces every permission.
 * No/expired session -> sign-in. Wrong role -> that role's own dashboard.
 */
const ProtectedRoute = ({ roles, children }) => {
  const session = getSession();
  if (!session) {
    clearSession();
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(session.user.role)) {
    return <Navigate to={getDashboardPath(session.user.role)} replace />;
  }
  return children;
};

export default ProtectedRoute;
