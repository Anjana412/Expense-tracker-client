import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import WorkspaceTabs from "../components/workspace/WorkspaceTabs";
import { useConfirm } from "../components/ui/ConfirmDialog";

import {
  getWorkspace, updateWorkspace, deleteWorkspace, inviteToWorkspace,
  removeWorkspaceMember, setWorkspaceMemberRole, leaveWorkspace,
} from "../api/api";
import { errMsg } from "../utils/format";

const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10";

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm, ConfirmModal } = useConfirm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [settings, setSettings] = useState({ name: "", monthlyBudget: "" });
  const [savingSettings, setSavingSettings] = useState(false);

  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    getWorkspace(id)
      .then((res) => {
        setData(res.data);
        setSettings({ name: res.data.workspace.name, monthlyBudget: String(res.data.workspace.monthlyBudget || 0) });
      })
      .catch((e) => {
        toast.error(errMsg(e, "Workspace not found"));
        navigate("/workspaces", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate, tick]);

  if (loading || !data) {
    return (
      <DashboardLayout title="Workspace">
        <div className="flex justify-center py-16" role="status" aria-label="Loading">
          <span className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const { workspace, myRole, isOwner, members } = data;
  const isAdmin = myRole === "admin";

  const handleInvite = async (e) => {
    e.preventDefault();
    if (inviting) return;
    setInviting(true);
    try {
      const res = await inviteToWorkspace(id, email.trim());
      toast.success(res.data.message);
      setEmail("");
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Could not send invitation"));
    } finally {
      setInviting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateWorkspace(id, { name: settings.name, monthlyBudget: Number(settings.monthlyBudget) });
      toast.success("Workspace updated");
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Could not update workspace"));
    } finally {
      setSavingSettings(false);
    }
  };

  const act = async (fn, okMsg, failMsg) => {
    try {
      await fn();
      toast.success(okMsg);
      reload();
    } catch (err) {
      toast.error(errMsg(err, failMsg));
    }
  };

  const handleRemove = async (m) => {
    const invited = m.status === "invited";
    if (!(await confirm({
      title: invited ? "Cancel invitation?" : "Remove member?",
      message: invited ? `The invitation to ${m.name} will be cancelled.` : `${m.name} will lose access to this workspace. Their company expenses stay with the company.`,
      confirmLabel: invited ? "Cancel invite" : "Remove", danger: true,
    }))) return;
    act(() => removeWorkspaceMember(id, m._id), "Member removed", "Could not remove member");
  };

  const handleRole = (m) =>
    act(() => setWorkspaceMemberRole(id, m._id, m.role === "admin" ? "member" : "admin"), "Role updated", "Could not change role");

  const handleLeave = async () => {
    if (!(await confirm({ title: "Leave workspace?", message: "You will lose access to this company's expenses and reports.", confirmLabel: "Leave", danger: true }))) return;
    try {
      await leaveWorkspace(id);
      toast.success("You left the workspace");
      navigate("/workspaces");
    } catch (err) {
      toast.error(errMsg(err, "Could not leave workspace"));
    }
  };

  const handleDelete = async () => {
    if (!(await confirm({ title: "Delete workspace?", message: `"${workspace.name}" and ALL of its company expenses and memberships will be permanently deleted. Personal expenses are not affected.`, confirmLabel: "Delete workspace", danger: true }))) return;
    try {
      await deleteWorkspace(id);
      toast.success("Workspace deleted");
      navigate("/workspaces");
    } catch (err) {
      toast.error(errMsg(err, "Could not delete workspace"));
    }
  };

  return (
    <DashboardLayout title="Workspace">
      <div className="px-4 md:px-6 py-5 max-w-4xl mx-auto w-full flex flex-col gap-5">
        <WorkspaceTabs id={id} name={workspace.name} role={myRole} />

        {isAdmin && (
          <section aria-labelledby="inv-h" className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 id="inv-h" className="text-sm font-semibold text-gray-900 mb-1">Invite an employee</h3>
            <p className="text-xs text-gray-500 mb-3">They need an account first. They will see the invitation and must accept before joining.</p>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="invite-email" className="sr-only">Employee email</label>
              <input id="invite-email" type="email" required className={inputClass} placeholder="employee@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" disabled={inviting}
                className="px-5 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-700 text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-60 shrink-0">
                {inviting ? "Sending…" : "Send invite"}
              </button>
            </form>
          </section>
        )}

        <section aria-labelledby="mem-h" className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <h3 id="mem-h" className="text-sm font-semibold text-gray-900 px-5 py-4 border-b border-gray-100">Members ({members.length})</h3>
          <ul className="divide-y divide-gray-100">
            {members.map((m) => (
              <li key={m._id} className="px-5 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-40">
                  <p className="text-sm font-medium text-gray-900">
                    {m.name} {m.isOwner && <span className="text-xs text-gray-500 font-normal">(owner)</span>}
                  </p>
                  {m.email && <p className="text-xs text-gray-500">{m.email}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.status === "invited" ? "bg-amber-50 text-amber-700" : m.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
                  {m.status === "invited" ? "Invited" : m.role === "admin" ? "Admin" : "Member"}
                </span>
                {isAdmin && !m.isOwner && (
                  <div className="flex gap-2">
                    {isOwner && m.status === "active" && (
                      <button type="button" onClick={() => handleRole(m)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                        {m.role === "admin" ? "Make member" : "Make admin"}
                      </button>
                    )}
                    {(m.role !== "admin" || isOwner) && (
                      <button type="button" onClick={() => handleRemove(m)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer">
                        {m.status === "invited" ? "Cancel invite" : "Remove"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {isAdmin && (
          <section aria-labelledby="set-h" className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 id="set-h" className="text-sm font-semibold text-gray-900 mb-3">Workspace settings</h3>
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="s-name" className="block mb-1.5 text-xs font-semibold text-gray-600">Name</label>
                <input id="s-name" className={inputClass} required maxLength={80} value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="s-budget" className="block mb-1.5 text-xs font-semibold text-gray-600">Monthly company budget (₹, 0 = none)</label>
                <input id="s-budget" type="number" min="0" step="0.01" className={inputClass} value={settings.monthlyBudget} onChange={(e) => setSettings({ ...settings, monthlyBudget: e.target.value })} />
              </div>
              <button type="submit" disabled={savingSettings}
                className="sm:col-span-2 self-start px-5 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-700 text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-60 justify-self-start">
                {savingSettings ? "Saving…" : "Save settings"}
              </button>
            </form>
          </section>
        )}

        <section className="flex flex-wrap gap-3">
          {!isOwner && (
            <button type="button" onClick={handleLeave}
              className="px-4 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 cursor-pointer">Leave workspace</button>
          )}
          {isOwner && (
            <button type="button" onClick={handleDelete}
              className="px-4 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 cursor-pointer">Delete workspace</button>
          )}
        </section>
      </div>
      <ConfirmModal />
    </DashboardLayout>
  );
};

export default WorkspaceDetail;
