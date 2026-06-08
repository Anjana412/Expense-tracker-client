import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, createTeam } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllUsers()
      .then((res) => {
        const regular = res.data.filter((u) => u.role === "user");
        setUsers(regular);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(submitting) return;
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    setSubmitting(true);
    try {
      await createTeam({ name: teamName.trim(), userIds: selectedIds });
      toast.success("Team created successfully");
      navigate("/viewteam");
    } 
    catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create team");
    } 
    finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Create Team">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          Loading users…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Team">
      <div className="px-4 md:px-6 py-5 max-w-2xl mx-auto w-full flex flex-col gap-5">
        <BackToDashboardButton />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-1.5">
            <label className="text-[11px] text-gray-400 font-medium">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Marketing, Engineering…"
              className="text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-300"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-900">Available Users</span>
              <span className="text-[11px] text-gray-400">{selectedIds.length} selected</span>
            </div>

            {users.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No users available</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isSelected = selectedIds.includes(user._id);
                  return (
                    <label key={user._id}
                      className={["flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                        isSelected ? "bg-emerald-50" : "hover:bg-gray-50"].join(" ")}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleUser(user._id)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer" />
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[11px] font-semibold text-emerald-700 shrink-0">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-[13px] text-gray-800 truncate">{user.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {user.role}
                      </span>
                      {isSelected && <i className="ti ti-check text-emerald-600 text-base" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <div className="text-[12px] text-emerald-700 font-medium mb-2">
                {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""} selected
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedIds.map((id) => {
                  const u = users.find((u) => u._id === id);
                  if (!u) return null;
                  return (
                    <span key={id}
                      className="flex items-center gap-1.5 text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      {u.name}
                      <button type="button" onClick={() => toggleUser(id)}
                        className="bg-transparent border-none text-emerald-700 cursor-pointer p-0 leading-none hover:text-red-600 transition-colors">
                        <i className="ti ti-x text-[10px]" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm cursor-pointer bg-transparent hover:text-gray-800 hover:border-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || selectedIds.length === 0 || !teamName.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium cursor-pointer border-none transition-colors">
              {submitting ? "Creating…" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateTeam;