import { Navigate } from "react-router-dom";
import { getDashboardPath } from "./layout/navConfig";
import { getSession } from "../utils/auth";

// Public pages (landing, login, register): signed-in users go straight to their dashboard.
const RedirectIfLoggedIn = ({ children }) => {
  const session = getSession();
  return session ? <Navigate to={getDashboardPath(session.user.role)} replace /> : children;
};

export default RedirectIfLoggedIn;
