import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTeams, getTeamMembers, removeUserFromTeam, getAllUsers, addUserToTeam, deleteTeam } from "../api/api";
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
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [deletingTeamId, setDeletingTeamId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    fetchTeams();
    getAllUsers()
      .then((res) => setAllUsers((res.data || []).filter((u) => u.role === "user")))
      .catch(() => {});
  }, []);

  const fetchTeams = () => {
    setLoading(true);
    getTeams()
      .then((res) => setTeams(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load teams"))
      .finally(() => setLoading(false));
  };

  const openTeam = (team) => {
    setSelectedTeam(team);
    setMembersLoading(true);
    getTeamMembers(team._id)
      .then((res) => setMembers(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load members"))
      .finally(() => setMembersLoading(false));
  };

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from ${selectedTeam.name}?`)) return;
    setRemovingId(userId);
    try {
      await removeUserFromTeam(selectedTeam._id, userId);
      toast.success(`${name} removed`);
      setMembers((prev) => prev.filter((m) => m._id !== userId));
      // update count in teams list
      setTeams((prev) =>
        prev.map((t) =>
          t._id === selectedTeam._id
            ? { ...t, members: t.members.filter((id) => id !== userId && id?._id !== userId) }
            : t
        )
      );
    } catch {
      toast.error("Failed to remove user");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddUser = async (userId, name) => {
    setAddingId(userId);
    try {
      await addUserToTeam(selectedTeam._id, { userId });
      toast.success(`${name} added`);
      setShowAddModal(false);
      // refresh members
      const res = await getTeamMembers(selectedTeam._id);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to add user");
    } finally {
      setAddingId(null);
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Delete team "${teamName}"? This cannot be undone.`)) return;
    setDeletingTeamId(teamId);
    try {
      await deleteTeam(teamId);
      toast.success(`"${teamName}" deleted`);
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      if (selectedTeam?._id === teamId) setSelectedTeam(null);
    } catch {
      toast.error("Failed to delete team");
    } finally {
      setDeletingTeamId(null);
    }
  };

  const memberIds = new Set(members.map((m) => m._id));
  const availableToAdd = allUsers.filter((u) => !memberIds.has(u._id));

  // ── Team list view ──────────────────────────────────────────────
  if (!selectedTeam) {
    return (
      <DashboardLayout title="Manage Teams">
        <div className="px-4 md:px-6 py-5 max-w-4xl mx-auto w-full flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <BackToDashboardButton />
            <button onClick={() => navigate("/createteam")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium border-none cursor-pointer">
              <i className="ti ti-plus" /> New Team
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading teams…</div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <i className="ti ti-users-off text-4xl text-gray-300" />
              <p className="text-gray-400 text-sm">No teams yet.</p>
              <button onClick={() => navigate("/createteam")}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm border-none cursor-pointer">
                Create your first team
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teams.map((team) => (
                <div key={team._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{team.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTeam(team._id, team.name)}
                      disabled={deletingTeamId === team._id}
                      className="p-1.5 text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                      <i className={deletingTeamId === team._id ? "ti ti-loader-2 animate-spin" : "ti ti-trash"} />
                    </button>
                  </div>

                  {/* Member avatars */}
                  {team.members.length > 0 && (
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 5).map((m, i) => {
                        const name = m?.name ?? "?";
                        return (
                          <div key={i}
                            className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-emerald-700">
                            {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        );
                      })}
                      {team.members.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={() => openTeam(team)}
                    className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium bg-transparent hover:bg-gray-50 cursor-pointer transition-colors">
                    Manage Members
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ── Single team detail view ─────────────────────────────────────
  return (
    <DashboardLayout title={selectedTeam.name}>
      <div className="px-4 md:px-6 py-5 max-w-4xl mx-auto w-full flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setSelectedTeam(null)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer transition-colors">
            <i className="ti ti-arrow-left text-base" /> All Teams
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium border-none cursor-pointer">
            <i className="ti ti-user-plus" /> Add User
          </button>
        </div>

        <p className="text-sm text-gray-500 -mt-2">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </p>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {membersLoading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading…</div>
          ) : members.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <i className="ti ti-users-off text-3xl text-gray-300" />
              <p className="text-gray-400 text-sm mt-2">No members in this team yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Name", "Email", "Role", ""].map((h) => (
                      <th key={h || "action"}
                        className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50 h-14">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[11px] font-semibold text-emerald-700 shrink-0">
                            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 truncate">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-45">{member.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_STYLE[member.role] ?? ROLE_STYLE.user}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleRemove(member._id, member.name)}
                          disabled={removingId === member._id}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer disabled:opacity-50">
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md flex flex-col gap-4 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Add User to {selectedTeam.name}</h2>
              <button onClick={() => setShowAddModal(false)}
                className="bg-transparent border-none text-gray-400 cursor-pointer text-lg hover:text-gray-800">
                <i className="ti ti-x" />
              </button>
            </div>

            {availableToAdd.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">All users are already in this team.</p>
            ) : (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {availableToAdd.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-600 shrink-0">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">{user.name}</div>
                      <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    </div>
                    <button onClick={() => handleAddUser(user._id, user.name)}
                      disabled={addingId === user._id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium border-none cursor-pointer">
                      {addingId === user._id ? "Adding…" : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm cursor-pointer bg-white hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ViewTeam;