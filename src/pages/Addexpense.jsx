import { useState } from "react";
import { addExpense } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";

const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-colors";
const labelClass = "block mb-1.5 text-gray-600 font-semibold";

const AddExpense = () => {

  const [expense, setExpense] = useState({ title: "", amount: "", category: "", date: "", description: "" });

  const handleChange =(e)=>setExpense({ ...expense, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res=await addExpense({
        title: expense.title,
        amount: Number(expense.amount),
        category: expense.category,
        date: expense.date,
        description: expense.description,
      });
      toast.success(res.data.message);

      setExpense({ title: "", amount: "", category: "", date: "", description: "" });
    } 
    catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <DashboardLayout title="Add Expense">
      <div className="px-4 md:px-6 py-5 max-w-xl mx-auto w-full flex flex-col gap-5">
        <BackToDashboardButton />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Expense title</label>
              <input type="text" name="title" value={expense.title} onChange={handleChange}
                placeholder="e.g. Swiggy order" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount (₹)</label>
              <input type="number" name="amount" value={expense.amount} onChange={handleChange}
                placeholder="0" required min="1" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={expense.category} onChange={handleChange} required className={inputClass}>
                <option value="">Select category</option>
                {["Food","Transport","Shopping","Bills","Health","Education","Entertainment","Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" name="date" value={expense.date} onChange={handleChange}
                required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description <span className="text-gray-500 font-normal">(optional)</span></label>
              <textarea rows={3} name="description" value={expense.description} onChange={handleChange}
                placeholder="Add a note…" className={`${inputClass} resize-none`} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="button"
                onClick={() => setExpense({ title: "", amount: "", category: "", date: "", description: "" })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl py-3 text-gray-700  font-medium cursor-pointer transition-colors">Clear
                </button>
              <button type="submit"
                className="flex-1 bg-violet-500 hover:bg-violet-700 border-none rounded-xl py-3 text-white  font-semibold cursor-pointer transition-colors shadow-sm">Save Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddExpense;
