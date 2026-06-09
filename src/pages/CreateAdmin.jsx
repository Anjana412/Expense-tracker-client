import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdmin } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";

const CreateAdmin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await createAdmin(formData);
      toast.success(`Admin account created for ${formData.name}!`);
      navigate("/superadmin/admins");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create admin";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Admin">
      <div className="px-4 md:px-6 py-5 max-w-lg mx-auto w-full">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/superadmin/admins")}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition-colors">
            <i className="ti ti-arrow-left text-gray-600 text-sm" />
          </button>
          <div>
            <h1 className="text-gray-900 font-semibold text-lg leading-tight">Create Admin Account</h1>
            <p className="text-gray-400 text-xs mt-0.5">Admin can log in immediately with these credentials</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <i className="ti ti-alert-circle text-base" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Priya Nair" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors placeholder:text-gray-400"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input type="email"name="email" value={formData.email} onChange={handleChange} placeholder="admin@example.com" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors placeholder:text-gray-400"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
            <input type={showPassword ? "text" : "password"}name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" required
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors placeholder:text-gray-400"/>
            <button type="button" onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"} text-base`} />
              </button>
            </div>
              <p className="text-xs text-gray-400 mt-1.5">Share these credentials with the admin so they can log in.</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <i className="ti ti-shield-check text-violet-600 text-base" />
              <span className="text-xs text-violet-700 font-medium">Account will be created with <strong>Admin</strong> role</span>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => navigate("/superadmin/admins")}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold border-none cursor-pointer transition-colors flex items-center justify-center gap-2">
                {loading? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />: <><i className="ti ti-user-plus text-sm" /> Create Admin</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateAdmin;