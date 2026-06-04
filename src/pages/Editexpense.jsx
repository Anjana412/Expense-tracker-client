import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleExpense, updateExpense, deleteExpense } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";

const categories = ["Food", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"];

const inputClass ="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-colors box-border";
const labelClass ="block mb-1.5 text-xs text-gray-600 font-semibold";

const Editexpense = () => {
  const {id} = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState({
    title: "", amount: "", category: "", date: "", description: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await getSingleExpense(id);
        setExpense({
          title: res.data.title,
          amount: String(res.data.amount),
          category: res.data.category,
          date: res.data.date.slice(0, 10),
          description: res.data.description || "",
        });
      } 
      catch (error) {
        toast.error(error.response?.data?.message || "Failed to load expense");
        navigate(-1);
      } 
      finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id, navigate]);

  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
    setIsDirty(true);
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateExpense(id, { ...expense, amount: Number(expense.amount) });
      toast.success(res.data.message);
      setIsDirty(false);
      setSaved(true);
    } 
    catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this expense? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await deleteExpense(id);
      toast.success(res.data.message);
      navigate("/dashboard");
    } 
    catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
      setDeleting(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await getSingleExpense(id);
      setExpense({
        title: res.data.title,
        amount: String(res.data.amount),
        category: res.data.category,
        date: res.data.date.slice(0, 10),
        description: res.data.description || "",
      });
      setIsDirty(false);
      setSaved(false);
    } 
    catch {
      toast.error("Failed to reset");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Expense">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading expense…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Expense">
      <div className="px-4 md:px-6 py-5 max-w-lg mx-auto w-full flex flex-col gap-5">
        <BackToDashboardButton />

        <div className="bg-white w-full p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5 mb-5 text-sm text-emerald-700 flex items-center gap-2">
              <i className="ti ti-circle-check" /> Expense updated successfully
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Expense title</label>
              <input type="text" name="title" value={expense.title} onChange={handleChange} placeholder="e.g. Swiggy order" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount (₹)</label>
              <input type="number" name="amount" value={expense.amount} onChange={handleChange} placeholder="0" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={expense.category} onChange={handleChange} required className={inputClass}>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" name="date" value={expense.date} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description (optional)</label>
              <textarea rows={3} name="description" value={expense.description} onChange={handleChange} placeholder="Add a note…" className={`${inputClass} resize-none`} />
            </div>

            <div className="flex flex-wrap gap-2.5 mt-1">
              <button type="button" onClick={handleDelete} disabled={deleting} title="Delete expense"
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 bg-white cursor-pointer disabled:opacity-50">
                <i className="ti ti-trash text-lg" />
              </button>
              {isDirty && (
                <button type="button" onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm bg-white hover:bg-gray-50 cursor-pointer"> Reset
                </button>
              )}
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 min-w-25 bg-gray-100 border border-gray-200 rounded-lg py-2.5 text-gray-700 text-sm cursor-pointer hover:bg-gray-200"> Cancel
              </button>
              <button type="submit"
                className={`flex-1 min-w-30 border-none rounded-lg py-2.5 text-sm font-semibold transition-colors ${isDirty ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                disabled={!isDirty}>Save changes
              </button>
            </div>
            {isDirty && (
              <p className="text-[11px] text-gray-500 text-center m-0">You have unsaved changes</p>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Editexpense;
