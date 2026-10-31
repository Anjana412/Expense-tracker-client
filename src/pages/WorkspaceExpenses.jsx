import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import WorkspaceTabs from "../components/workspace/WorkspaceTabs";
import StatusBadge from "../components/workspace/StatusBadge";
import { useConfirm } from "../components/ui/ConfirmDialog";

import {
  getWorkspace, getCompanyExpenses, addCompanyExpense, updateCompanyExpense,
  deleteCompanyExpense, setCompanyExpenseStatus,
} from "../api/api";
import { getStoredUser } from "../components/layout/navConfig";
import { CATEGORIES, errMsg, formatDate, formatINR, toDateInput, downloadCSV, dateKey } from "../utils/format";

const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10";
const EMPTY = { title: "", amount: "", category: "", date: "", description: "" };

const WorkspaceExpenses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm, ConfirmModal } = useConfirm();
  const me = getStoredUser()._id;

  const [info, setInfo] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    Promise.all([getWorkspace(id), getCompanyExpenses(id)])
      .then(([w, e]) => {
        setInfo(w.data);
        setExpenses(Array.isArray(e.data) ? e.data : []);
      })
      .catch((err) => {
        toast.error(errMsg(err, "Workspace not found"));
        navigate("/workspaces", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate, tick]);

  const isAdmin = info?.myRole === "admin";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter((e) =>
      (statusFilter === "all" || e.status === statusFilter) &&
      (!q || (e.title || "").toLowerCase().includes(q) || (e.userId?.name || "").toLowerCase().includes(q))
    );
  }, [expenses, search, statusFilter]);

  const total = filtered.filter((e) => e.status !== "rejected").reduce((s, e) => s + e.amount, 0);

  const openNew = () => { setEditingId(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (e) => {
    setEditingId(e._id);
    setForm({ title: e.title, amount: String(e.amount), category: e.category, date: toDateInput(e.date), description: e.description || "" });
    setShowForm(true);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editingId) await updateCompanyExpense(id, editingId, payload);
      else await addCompanyExpense(id, payload);
      toast.success(editingId ? "Expense updated" : "Company expense added");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Could not save expense")); // form stays filled
    } finally {
      setSaving(false);
    }
  };

  const run = async (fn, okMsg, failMsg) => {
    try { await fn(); toast.success(okMsg); reload(); }
    catch (err) { toast.error(errMsg(err, failMsg)); }
  };

  const handleDelete = async (e) => {
    if (!(await confirm({ title: "Delete company expense?", message: `"${e.title}" will be permanently removed from the workspace.`, confirmLabel: "Delete", danger: true }))) return;
    run(() => deleteCompanyExpense(id, e._id), "Expense deleted", "Could not delete");
  };

  const exportCSV = () =>
    downloadCSV(`${info.workspace.name}-expenses.csv`, [
      ["Date", "Title", "Member", "Category", "Amount", "Status", "Description"],
      ...filtered.map((e) => [dateKey(e.date), e.title, e.userId?.name || "", e.category, e.amount, e.status, e.description || ""]),
    ]);

  if (loading || !info) {
    return (
      <DashboardLayout title="Company Expenses">
        <div className="flex justify-center py-16" role="status" aria-label="Loading">
          <span className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Company Expenses">
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-5">
        <WorkspaceTabs id={id} name={info.workspace.name} role={info.myRole} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            {isAdmin ? "All company expenses in this workspace." : "Your company expenses. Your personal expenses are never shown here."}
          </p>
          <div className="flex gap-2">
            {filtered.length > 0 && (
              <button type="button" onClick={exportCSV}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                <i className="ti ti-download" /> Export CSV
              </button>
            )}
            <button type="button" onClick={showForm ? () => setShowForm(false) : openNew}
              className="text-sm font-semibold text-white bg-violet-500 hover:bg-violet-700 px-4 py-2 rounded-lg border-none cursor-pointer">
              {showForm ? "Close" : "Add company expense"}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <h3 className="sm:col-span-2 text-sm font-semibold text-gray-900">{editingId ? "Edit expense" : "New company expense"}</h3>
            <div>
              <label htmlFor="ce-title" className="block mb-1.5 text-xs font-semibold text-gray-600">Title</label>
              <input id="ce-title" className={inputClass} required maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Client lunch" />
            </div>
            <div>
              <label htmlFor="ce-amount" className="block mb-1.5 text-xs font-semibold text-gray-600">Amount (₹)</label>
              <input id="ce-amount" type="number" min="0.01" step="0.01" required className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label htmlFor="ce-cat" className="block mb-1.5 text-xs font-semibold text-gray-600">Category</label>
              <select id="ce-cat" required className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ce-date" className="block mb-1.5 text-xs font-semibold text-gray-600">Date</label>
              <input id="ce-date" type="date" required className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ce-desc" className="block mb-1.5 text-xs font-semibold text-gray-600">Note (optional)</label>
              <textarea id="ce-desc" rows={2} maxLength={500} className={`${inputClass} resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-700 text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Save changes" : "Add expense"}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="ce-search" className="sr-only">Search</label>
            <input id="ce-search" className={inputClass} placeholder={isAdmin ? "Search by title or member…" : "Search by title…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label htmlFor="ce-status" className="sr-only">Status</label>
            <select id="ce-status" className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-gray-600">{filtered.length} of {expenses.length} expenses</span>
            <span className="font-semibold text-gray-900">Total (excluding rejected): {formatINR(total)}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="py-14 text-center px-4">
              <p className="text-gray-900 font-medium mb-1">{expenses.length === 0 ? "No company expenses yet" : "No expenses match your filters"}</p>
              <p className="text-sm text-gray-500">{expenses.length === 0 ? "Use “Add company expense” to record the first one." : "Try clearing the search or status filter."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Date", "Title", ...(isAdmin ? ["Member"] : []), "Category", "Amount", "Status", "Actions"].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((e) => {
                    const mine = String(e.userId?._id) === String(me);
                    return (
                      <tr key={e._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(e.date)}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-48 truncate" title={e.description || undefined}>{e.title}</td>
                        {isAdmin && <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{e.userId?.name || "Former member"}</td>}
                        <td className="px-4 py-3"><span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{e.category}</span></td>
                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatINR(e.amount)}</td>
                        <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {isAdmin && e.status !== "approved" && (
                              <button type="button" onClick={() => run(() => setCompanyExpenseStatus(id, e._id, "approved"), "Approved", "Could not approve")}
                                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100">Approve</button>
                            )}
                            {isAdmin && e.status !== "rejected" && (
                              <button type="button" onClick={() => run(() => setCompanyExpenseStatus(id, e._id, "rejected"), "Rejected", "Could not reject")}
                                className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 cursor-pointer hover:bg-red-100">Reject</button>
                            )}
                            {mine && e.status === "pending" && (
                              <button type="button" onClick={() => openEdit(e)} aria-label={`Edit ${e.title}`}
                                className="text-xs px-2.5 py-1 rounded-lg bg-white text-blue-600 border border-blue-200 cursor-pointer hover:bg-blue-50">Edit</button>
                            )}
                            {(isAdmin || (mine && e.status === "pending")) && (
                              <button type="button" onClick={() => handleDelete(e)} aria-label={`Delete ${e.title}`}
                                className="text-xs px-2.5 py-1 rounded-lg bg-white text-red-600 border border-red-200 cursor-pointer hover:bg-red-50">Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal />
    </DashboardLayout>
  );
};

export default WorkspaceExpenses;
