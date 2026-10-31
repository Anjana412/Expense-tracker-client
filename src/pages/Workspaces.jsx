import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  getMyWorkspaces, getMyInvitations, acceptInvitation, declineInvitation, createWorkspace,
} from "../api/api";
import { errMsg, formatINR } from "../utils/format";

const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10";

const Workspaces = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyInvite, setBusyInvite] = useState(null);

  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    Promise.all([getMyWorkspaces(), getMyInvitations()])
      .then(([w, i]) => {
        setWorkspaces(Array.isArray(w.data) ? w.data : []);
        setInvites(Array.isArray(i.data) ? i.data : []);
      })
      .catch((e) => toast.error(errMsg(e, "Could not load your workspaces")))
      .finally(() => setLoading(false));
  }, [tick]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = { name: name.trim() };
      if (budget !== "") payload.monthlyBudget = Number(budget);
      const res = await createWorkspace(payload);
      toast.success("Workspace created");
      navigate(`/workspaces/${res.data.workspace._id}`);
    } catch (err) {
      toast.error(errMsg(err, "Could not create workspace"));
      setSaving(false);
    }
  };

  const respond = async (inv, accept) => {
    setBusyInvite(inv._id);
    try {
      await (accept ? acceptInvitation(inv._id) : declineInvitation(inv._id));
      toast.success(accept ? `You joined ${inv.workspace.name}` : "Invitation declined");
      reload();
    } catch (e) {
      toast.error(errMsg(e, "Could not respond to the invitation"));
    } finally {
      setBusyInvite(null);
    }
  };

  return (
    <DashboardLayout title="Company Workspaces">
      <div className="px-4 md:px-6 py-5 max-w-4xl mx-auto w-full flex flex-col gap-5">
        <p className="text-sm text-gray-600">
          A workspace keeps a company's expenses separate from your personal ones. Create one to manage a business, or join one when you are invited.
        </p>

        {loading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Loading">
            <span className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {invites.length > 0 && (
              <section aria-labelledby="inv-h" className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <h3 id="inv-h" className="text-sm font-semibold text-violet-900 mb-3">
                  Invitations ({invites.length})
                </h3>
                <ul className="flex flex-col gap-2">
                  {invites.map((inv) => (
                    <li key={inv._id} className="bg-white rounded-xl border border-violet-100 p-3 flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-48">
                        <p className="text-sm font-medium text-gray-900">{inv.workspace.name}</p>
                        <p className="text-xs text-gray-500">Invited by {inv.invitedBy}. Joining lets the company see the expenses you record in this workspace, never your personal ones.</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" disabled={busyInvite === inv._id} onClick={() => respond(inv, false)}
                          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50">Decline</button>
                        <button type="button" disabled={busyInvite === inv._id} onClick={() => respond(inv, true)}
                          className="px-3 py-2 text-sm rounded-lg bg-violet-500 hover:bg-violet-700 text-white font-semibold border-none cursor-pointer disabled:opacity-50">Accept</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="ws-h" className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h3 id="ws-h" className="text-sm font-semibold text-gray-900">Your workspaces</h3>
                <button type="button" onClick={() => setShowCreate((s) => !s)}
                  className="text-sm font-semibold text-white bg-violet-500 hover:bg-violet-700 px-4 py-2 rounded-lg border-none cursor-pointer">
                  {showCreate ? "Close" : "Create workspace"}
                </button>
              </div>

              {showCreate && (
                <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <label htmlFor="ws-name" className="block mb-1.5 text-sm font-semibold text-gray-700">Company name</label>
                    <input id="ws-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required placeholder="e.g. Acme Traders" />
                  </div>
                  <div>
                    <label htmlFor="ws-budget" className="block mb-1.5 text-sm font-semibold text-gray-700">
                      Monthly company budget (₹) <span className="font-normal text-gray-500">(optional)</span>
                    </label>
                    <input id="ws-budget" type="number" min="0" step="0.01" className={inputClass} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 100000" />
                  </div>
                  <p className="text-xs text-gray-500">You become the Admin of this workspace. You can invite employees afterwards.</p>
                  <button type="submit" disabled={saving || !name.trim()}
                    className="self-start px-5 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-700 text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? "Creating…" : "Create"}
                  </button>
                </form>
              )}

              {workspaces.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <i className="ti ti-building text-2xl text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 font-semibold mb-1">No workspaces yet</h4>
                  <p className="text-sm text-gray-500">Your personal tracker works without one. Create a workspace to manage company expenses.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {workspaces.map((w) => (
                    <li key={w._id}>
                      <Link to={`/workspaces/${w._id}`}
                        className="block bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all no-underline">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-semibold text-gray-900 truncate">{w.name}</h4>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${w.myRole === "admin" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
                            {w.myRole === "admin" ? "Admin" : "Member"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {w.memberCount} {w.memberCount === 1 ? "member" : "members"}
                          {w.monthlyBudget > 0 && ` · Budget ${formatINR(w.monthlyBudget)}/month`}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Workspaces;
