import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
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

export const makeAdmin = (id) => {
  const token = localStorage.getItem("token");
  return API.put(`/user/makeadmin/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeAdmin = (id) => {
  const token = localStorage.getItem("token");
  return API.delete(`/user/removeadmin/${id}`, {
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

export const getTeamExpenses = () => {
  const token = localStorage.getItem("token");
  return API.get("/expense/team/expenses", {
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
  return API.post("/user/team/create", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addUserToTeam = (data) => {
  const token = localStorage.getItem("token");
  return API.post("/user/team/create", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTeamMembers = () => {
  const token = localStorage.getItem("token");
  return API.get("/user/team/members", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeUserFromTeam = (userId) => {
  const token = localStorage.getItem("token");
  return API.delete(`/user/team/member/${userId}`, {
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
