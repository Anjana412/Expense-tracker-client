import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://expense-tracker-server-wc9u.onrender.com",
});

// Attach the token to every request.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid session anywhere in the app -> clear it and go to sign-in.
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || "";
    const isAuthCall = url.includes("/user/login") || url.includes("/user/register");
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!["/", "/login", "/register"].includes(window.location.pathname)) window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

/* ---------- auth ---------- */
export const userRegister = (data) => API.post("/user/register", data);
export const userLogin = (data) => API.post("/user/login", data);

export const getRoleRedirect = (role) => {
  if (role === "superadmin") return "/superadmin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
};

/* ---------- personal expenses & budget ---------- */
export const addExpense = (data) => API.post("/expense/addexpense", data);
export const getExpenses = () => API.get("/expense/getexpense");
export const updateExpense = (id, data) => API.put(`/expense/updateexpense/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expense/delete/${id}`);
export const getSingleExpense = (id) => API.get(`/expense/expense/${id}`);
export const exportExpensesCSV = () => API.get("/expense/getexpense");
export const getMonthlyTrend = (year) => API.get(`/expense/monthly-trend?year=${year}`);
export const getExpenseSummary = () => API.get("/expense/summary");
export const updateBudget = (monthlyBudget) => API.put("/user/setbudget", { monthlyBudget });
export const getBudget = () => API.get("/user/getbudget");

/* ---------- company workspaces ---------- */
export const createWorkspace = (data) => API.post("/workspace", data);
export const getMyWorkspaces = () => API.get("/workspace/mine");
export const getWorkspace = (id) => API.get(`/workspace/${id}`);
export const updateWorkspace = (id, data) => API.patch(`/workspace/${id}`, data);
export const deleteWorkspace = (id) => API.delete(`/workspace/${id}`);
export const inviteToWorkspace = (id, email) => API.post(`/workspace/${id}/invite`, { email });
export const removeWorkspaceMember = (id, userId) => API.delete(`/workspace/${id}/members/${userId}`);
export const setWorkspaceMemberRole = (id, userId, role) => API.patch(`/workspace/${id}/members/${userId}`, { role });
export const leaveWorkspace = (id) => API.post(`/workspace/${id}/leave`);
export const getMyInvitations = () => API.get("/workspace/invitations");
export const acceptInvitation = (membershipId) => API.post(`/workspace/invitations/${membershipId}/accept`);
export const declineInvitation = (membershipId) => API.post(`/workspace/invitations/${membershipId}/decline`);

export const getCompanyExpenses = (id) => API.get(`/workspace/${id}/expenses`);
export const addCompanyExpense = (id, data) => API.post(`/workspace/${id}/expenses`, data);
export const updateCompanyExpense = (id, expenseId, data) => API.put(`/workspace/${id}/expenses/${expenseId}`, data);
export const deleteCompanyExpense = (id, expenseId) => API.delete(`/workspace/${id}/expenses/${expenseId}`);
export const setCompanyExpenseStatus = (id, expenseId, status) => API.patch(`/workspace/${id}/expenses/${expenseId}/status`, { status });
export const getCompanySummary = (id, year) => API.get(`/workspace/${id}/summary`, { params: { year } });

/* ---------- platform owner (superadmin) ---------- */
export const getAllWorkspaces = () => API.get("/workspace/admin/all");
export const getPlatformStats = () => API.get("/workspace/admin/stats");
export const createAdmin = (data) => API.post("/user/admin/create", data);
export const getAdmins = () => API.get("/user/viewadmins");
export const deleteAdmin = (id) => API.delete(`/user/admin/delete/${id}`);

export default API;
