import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './pages/Authpage';
import Addexpense from './pages/Addexpense';
import Dashboard from './pages/Dashboard';
import Editexpense from './pages/Editexpense';
import GlobalAnalytics from './pages/Globalanlytics';
import Reports from './pages/Reports';
import Viewexpense from './pages/Viewexpense';
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import ManageAdmin from './pages/ManageAdmin';
import CreateAdmin from './pages/CreateAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfLoggedIn from './components/RedirectIfLoggedIn';
import Landing from './pages/Landing';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import WorkspaceExpenses from './pages/WorkspaceExpenses';
import WorkspaceReports from './pages/WorkspaceReports';
import AllWorkspaces from './pages/AllWorkspaces';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<RedirectIfLoggedIn><Landing /></RedirectIfLoggedIn>} />
        <Route path="/login" element={<RedirectIfLoggedIn><AuthPage initialMode="login" /></RedirectIfLoggedIn>} />
        <Route path="/register" element={<RedirectIfLoggedIn><AuthPage initialMode="register" /></RedirectIfLoggedIn>} />
        <Route path="/dashboard"element={<ProtectedRoute roles={["user", "admin", "superadmin"]}><Dashboard /></ProtectedRoute>}/>
        <Route path="/admin/dashboard"element={<ProtectedRoute roles={["user", "admin", "superadmin"]}><Dashboard /></ProtectedRoute>}/>
        <Route path="/superadmin/dashboard"element={<ProtectedRoute roles={["user", "admin", "superadmin"]}><Dashboard /></ProtectedRoute>}/>
        <Route path="/addexpense"element={<ProtectedRoute roles={["user", "admin", "superadmin"]}><Addexpense /></ProtectedRoute>}/>
        <Route path="/editexpense/:id"element={<ProtectedRoute roles={["user", "admin", "superadmin"]}><Editexpense /></ProtectedRoute>}/>
        <Route path="/expenses"element={<ProtectedRoute roles={["user", "admin", "superadmin"]}><Viewexpense /></ProtectedRoute>}/>
        <Route path="/reports"element={<ProtectedRoute roles={["user", "admin", "superadmin"]}><Reports /></ProtectedRoute>}/>
        <Route path="/workspaces" element={<ProtectedRoute roles={["user", "admin"]}><Workspaces /></ProtectedRoute>} />
        <Route path="/workspaces/:id" element={<ProtectedRoute roles={["user", "admin"]}><WorkspaceDetail /></ProtectedRoute>} />
        <Route path="/workspaces/:id/expenses" element={<ProtectedRoute roles={["user", "admin"]}><WorkspaceExpenses /></ProtectedRoute>} />
        <Route path="/workspaces/:id/reports" element={<ProtectedRoute roles={["user", "admin"]}><WorkspaceReports /></ProtectedRoute>} />
        {/* old team URLs now lead to the workspace area */}
        {["/team", "/teamreports", "/createteam", "/viewteam", "/manageteam"].map((p) => (
          <Route key={p} path={p} element={<Navigate to="/workspaces" replace />} />
        ))}
        <Route path="/analytics"element={<ProtectedRoute roles={["superadmin"]}><GlobalAnalytics /></ProtectedRoute>}/>
        <Route path="/superadmin/workspaces" element={<ProtectedRoute roles={["superadmin"]}><AllWorkspaces /></ProtectedRoute>} />
        <Route path="/superadmin/admins"        element={<ProtectedRoute roles={["superadmin"]}><ManageAdmin /></ProtectedRoute>} />  
        <Route path="/superadmin/admins/create" element={<ProtectedRoute roles={["superadmin"]}><CreateAdmin /></ProtectedRoute>} />
        {/* unknown URL -> home; signed-in users are then sent on to their dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;