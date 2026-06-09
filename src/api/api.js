import axios from "axios";

const API = axios.create({
  baseURL: "https://expense-tracker-server-wc9u.onrender.com",
});


export const userRegister = (data) => {
  return API.post("/user/register", data);
};

export const userLogin = (data) => {
  return API.post("/user/login", data);
};

export const getRoleRedirect = (role) => {
  if (role === "superadmin") return "/superadmin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
};

export const getAllUsers = () => {
  const token = localStorage.getItem("token");
  return API.get("/user/allusers", {
    headers: { Authorization: `Bearer ${token}` },
  });
};


export const addExpense = (data) => {
  const token = localStorage.getItem("token");
  return API.post("/expense/addexpense", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getExpenses = () => {
  const token = localStorage.getItem("token");
  return API.get("/expense/getexpense", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateExpense = (id, data) => {
  const token = localStorage.getItem("token");
  return API.put(`/expense/updateexpense/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteExpense = (id) => {
  const token = localStorage.getItem("token");
  return API.delete(`/expense/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSingleExpense = (id) => {
  const token = localStorage.getItem("token");
  return API.get(`/expense/expense/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllExpensesGlobal = () => {
  const token = localStorage.getItem("token");
  return API.get("/expense/global/expenses", {
    headers: { Authorization: `Bearer ${token}` },
  });
};


export const updateBudget = (monthlyBudget) => {
  const token = localStorage.getItem("token");
  return API.put("/user/setbudget", { monthlyBudget }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getBudget = () => {
  const token = localStorage.getItem("token");
  return API.get("/user/getbudget", {
    headers: { Authorization: `Bearer ${token}` },
  });
};


export const createTeam = (data) => {
  const token = localStorage.getItem("token");
  return API.post("/user/createteam", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTeams = () => {
  const token = localStorage.getItem("token");
  return API.get("/user/viewteams", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTeamMembers = (teamId) => {
  const token = localStorage.getItem("token");
  return API.get(`/user/viewteammembers/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addUserToTeam = (teamId, data) => {
  const token = localStorage.getItem("token");
  return API.post(`/user/addteammember/${teamId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeUserFromTeam = (teamId, userId) => {
  const token = localStorage.getItem("token");
  return API.delete(`/user/removeteammember/${teamId}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteTeam = (teamId) => {
  const token = localStorage.getItem("token");
  return API.delete(`/user/deleteteam/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllTeams = () => {
  const token = localStorage.getItem("token");
  return API.get("/user/allteams", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createAdmin = (data) => {
  const token = localStorage.getItem("token");
  return API.post("/user/admin/create", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAdmins = () => {
  const token = localStorage.getItem("token");
  return API.get("/user/viewadmins", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteAdmin = (id) => {
  const token = localStorage.getItem("token");
  return API.delete(`/user/admin/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTeamExpenses = (teamId) => {
  const token = localStorage.getItem("token");
  return API.get(`/expense/team/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};



export const exportExpensesCSV = () => {
  const token = localStorage.getItem("token");
  return API.get("/expense/getexpense", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMonthlyTrend = (year) => {
  const token = localStorage.getItem("token");
  return API.get(`/expense/monthly-trend?year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getExpenseSummary = () => {
  const token = localStorage.getItem("token");
  return API.get("/expense/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
};



export default API;
