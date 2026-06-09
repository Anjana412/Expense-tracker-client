import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdmins, deleteAdmin } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";

function getInitials(name) {
  return (name || "A").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const ManageAdmin = () => {
  const navigate = useNavigate();

  const [admins,     setAdmins]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const res = await getAdmins();
        console.log(res.data);
        
        setAdmins(res.data);
      } 
      catch (err) {
        if (err?.response?.status === 401) { localStorage.clear(); navigate("/"); return; }
        toast.error(err?.response?.data?.message || "Failed to load admins");
      }
       finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete admin account for ${name}? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await deleteAdmin(id);
      toast.success(`${name}'s admin account deleted`);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } 
    catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete admin");
    } 
    finally {
      setDeletingId(null);
    }
  };

  const filtered = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Manage Admins">
      <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto w-full flex flex-col gap-5">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-gray-900 font-semibold text-lg">Manage Admins</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Create and manage admin accounts for your platform
            </p>
          </div>
          <button
            onClick={() => navigate("/superadmin/admins/create")}
            className="flex items-center gap-2 bg-violet-500 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border-none cursor-pointer transition-colors shadow-sm"
          >
            <i className="ti ti-user-plus text-sm" />
            Create Admin
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <i className="ti ti-shield text-emerald-600 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            <p className="text-xs text-gray-400">Total admin accounts</p>
          </div>
        </div>

        <div className="relative">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>

        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-users text-2xl text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">
              {search ? "No admins match your search" : "No admin accounts yet"}
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              {search
                ? "Try a different name or email"
                : "Create the first admin account to get started"}
            </p>
            {!search && (
              <button onClick={() => navigate("/superadmin/admins/create")}
                className="bg-violet-500 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-colors">
                Create Admin
              </button>
            )}
          </div>

        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr] px-5 py-3 border-b border-gray-100 bg-gray-50">
              {["Admin", "Email", "Created", "Actions"].map((h) => (
                <span key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</span>
              ))}
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map((admin) => (
                <div
                  key={admin._id}
                  className="flex flex-col sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr] items-start sm:items-center gap-3 sm:gap-0 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {getInitials(admin.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
                      <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 truncate sm:pr-4">{admin.email}</p>
                    {admin.createdAt ? formatDate(admin.createdAt) : "-"}
                  <button
                    onClick={() => handleDelete(admin._id, admin.name)}
                    disabled={deletingId === admin._id}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === admin._id
                      ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <i className="ti ti-trash text-sm" />
                    }
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Showing {filtered.length} of {admins.length} admin accounts
        </p>
      </div>
    </DashboardLayout>
  );
};

export default ManageAdmin;