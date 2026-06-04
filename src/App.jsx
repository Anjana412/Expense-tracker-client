import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './pages/Authpage';
import Addexpense from './pages/Addexpense';
import Dashboard from './pages/Dashboard';
import Editexpense from './pages/Editexpense';
import TeamExpenses from './pages/Teamexpense';
import TeamReports from './pages/Teamreport';
import GlobalAnalytics from './pages/Globalanlytics';
import Reports from './pages/Reports';
import Manageusers from './pages/Manageusers';
import Viewexpense from './pages/Viewexpense';
import CreateTeam from './pages/CreateTeam';
import ViewTeam from './pages/ViewTeam';
import "@tabler/icons-webfont/dist/tabler-icons.min.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/"element={<AuthPage />}/>
        <Route path="/dashboard"element={<Dashboard />}/>
        <Route path="/admin/dashboard"element={<Dashboard />}/>
        <Route path="/superadmin/dashboard"element={<Dashboard />}/>
        <Route path="/addexpense"element={<Addexpense />}/>
        <Route path="/editexpense/:id"element={<Editexpense />}/>
        <Route path="/expenses"element={<Viewexpense />}/>
        <Route path="/reports"element={<Reports />}/>
        <Route path="/team"element={<TeamExpenses />}/>
        <Route path="/teamreports"element={<TeamReports />}/>
        <Route path="/createteam"element={<CreateTeam />}/>
        <Route path="/viewteam"element={<ViewTeam />}/>
        <Route path="/manageteam"element={<ViewTeam />}/>
        <Route path="/analytics"element={<GlobalAnalytics />}/>
        <Route path="/manageusers"element={<Manageusers />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
