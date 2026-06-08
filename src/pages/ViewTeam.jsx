import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTeamMembers, removeUserFromTeam, getAllUsers, addUserToTeam } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";

const ROLE_STYLE = {
  user: "bg-gray-100 text-gray-700",
  admin: "bg-blue-100 text-blue-800",
  superadmin: "bg-violet-100 text-violet-800",
};

const ViewTeam = () => {
  const navigate = useNavigate();
  const [members, setMembers]= useState([]);
  const [allUsers, setAllUsers]= useState([]);
  const [loading, setLoading]= useState(true);
  const [removingId, setRemovingId]= useState(null);
  const [showAddModal, setShowAddModal]= useState(false);
  const [addingId, setAddingId]= useState(null);

  const fetchMembers = () => {
    setLoading(true);
    getTeamMembers()
      .then((res) => setMembers(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load team members"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
      fetchMembers();
      getAllUsers()
      .then((res) => setAllUsers((res.data || []).filter((u) => u.role === "user")))
      .catch(() => {});
  }, []);

    const handleRemove = async (userId, name) => {
      if (!window.confirm(`Remove ${name} from the team?`)) return;
      setRemovingId(userId);
      try {
        await removeUserFromTeam(userId);
        toast.success(`${name} removed from team`);
        setMembers((prev) => prev.filter((m) => m._id !== userId));
      } catch {
        toast.error("Failed to remove user");
      } finally {
        setRemovingId(null);
      }
    };

  const handleAddUser = async (userId, name) => {
    setAddingId(userId);
      try {
        await addUserToTeam({ userIds: [userId] });
        toast.success(`${name} added to team`);
        setShowAddModal(false);
        fetchMembers();
      } 
      catch {
        toast.error("Failed to add user");
      } 
      finally {
      setAddingId(null);
    }
  };

  const memberIds = new Set(members.map((m) => m._id));
  const availableToAdd = allUsers.filter((u) => !memberIds.has(u._id));

  if (loading) {
    return (
      <DashboardLayout title="Manage Team">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading team…</div>
      </DashboardLayout>
    );
  }

  return (
      <DashboardLayout title="Manage Team">
        <div className="px-4 md:px-6 py-5 max-w-4xl mx-auto w-full flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BackToDashboardButton />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium border-none cursor-pointer">
                <i className="ti ti-user-plus" /> Add User
              </button>
            
          </div>
        </div>

        <p className="text-sm text-gray-600 -mt-2">{members.length} team member{members.length !== 1 ? "s" : ""}</p>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {members.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <i className="ti ti-users-off text-3xl text-gray-300" />
              <p className="text-gray-500 text-sm mt-2">No team members yet.</p>
              <button type="button" onClick={() => navigate("/createteam")}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm border-none cursor-pointer">
                Create Team
              </button>
            </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                      {["Name", "Email", "Role", ""].map((h) => (
                        <th key={h || "action"} className="text-left text-xs font-semibold text-gray-600 uppercase px-4 py-3">
                        {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50 h-14">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[11px] font-semibold text-emerald-700 shrink-0">
                            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 truncate">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-45">{member.email}</td>
                        <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_STYLE[member.role] ?? ROLE_STYLE.user}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => handleRemove(member._id, member.name)} disabled={removingId === member._id}title="Remove from team"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer disabled:opacity-50">
                          <i className={removingId === member._id ? "ti ti-loader-2 animate-spin" : "ti ti-trash"} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md flex flex-col gap-4 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Add User to Team</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="bg-transparent border-none text-gray-500 cursor-pointer text-lg hover:text-gray-800">
                <i className="ti ti-x" />
              </button>
            </div>
            {availableToAdd.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">All users are already in your team.</p>
            ) : (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {availableToAdd.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-700 shrink-0">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                    <button type="button" onClick={() => handleAddUser(user._id, user.name)} disabled={addingId === user._id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium border-none cursor-pointer">
                      {addingId === user._id ? "Adding…" : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm cursor-pointer bg-white hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ViewTeam;
