import { useEffect, useState } from "react";
import { getAllUsers, makeAdmin, removeAdmin } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";

const ROLE_STYLE = {
  superadmin: "bg-violet-100 text-violet-800",
  admin: "bg-blue-100 text-blue-800",
  user: "bg-gray-100 text-gray-700",
};

const Manageusers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleMakeAdmin = async (id) => {
    try {
      const res = await makeAdmin(id);
      toast.success(res.data.message);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: "admin" } : u)));
    }
     catch (error) {
      toast.error(error.response?.data?.message || "Failed to make admin");
    }
  };

  const handleRemoveAdmin = async (id) => {
    try {
      const res = await removeAdmin(id);
      toast.success(res.data.message);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: "user" } : u)));
    } 
    catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove admin");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Users">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading users…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Users">
      <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto w-full flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackToDashboardButton />
          <p className="text-sm text-gray-600">{users.length} registered users</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  {["Name" , "Email", "Role", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 h-14">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[11px] font-semibold text-emerald-700 shrink-0">
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 truncate">{user.name}</span>
                  </div>
                    </td>
              <td className="px-4 py-3 text-gray-600 max-w-50 truncate">{user.email}</td>
                    <td className="px-4 py-3">
                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLE[user.role] ?? ROLE_STYLE.user}`}>{user.role === "superadmin" ? "Super Admin" : user.role === "admin" ? "Admin" : "User"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role === "user"? (
                        <button type="button" onClick={() => handleMakeAdmin(user._id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium border-none cursor-pointer">Make Admin
                        </button>
                  ) : user.role === "admin" ? (
                        <button type="button" onClick={() => handleRemoveAdmin(user._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-medium cursor-pointer">Remove Admin
                    </button>
                      ) : (
                        <span className="text-xs text-violet-700 font-medium">Platform owner</span>
                   )}
                    </td>
            </tr>
                ))}
          </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Manageusers;
