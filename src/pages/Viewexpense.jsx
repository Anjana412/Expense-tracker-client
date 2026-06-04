import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses, deleteExpense } from "../api/api";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import BackToDashboardButton from "../components/layout/BackToDashboardButton";
import ExpenseRowActions from "../components/ui/ExpenseRowActions";

const Viewexpense = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [period, setPeriod] = useState("All Time");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    getExpenses()
      .then((res) => setExpenses(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense permanently?")) return;
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      toast.success("Expense deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return [...expenses]
      .filter((expense) => {
        const d = new Date(expense.date);
        const matchesSearch = (expense.title || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || expense.category === category;
        let matchesPeriod = true;
        if (period === "This Month")
          matchesPeriod = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        if (period === "Last Month") {
          const lm = currentMonth === 0 ? 11 : currentMonth - 1;
          const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
          matchesPeriod = d.getMonth() === lm && d.getFullYear() === ly;
        }

        if (period === "This Year") matchesPeriod = d.getFullYear() === currentYear;
        return matchesSearch && matchesCategory && matchesPeriod;
      })
      .sort((a, b) => {
        if (sortBy==="Oldest") return new Date(a.date)-new Date(b.date);
        if (sortBy==="Highest") return b.amount-a.amount;
        if (sortBy==="Lowest") return a.amount-b.amount;
        return new Date(b.date)-new Date(a.date);
      });
  }, [expenses, search, category, period, sortBy]);

  const totalAmount = filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const exportCSV = () => {
    const headers = ["Title", "Amount", "Category", "Date", "Description"];
    const rows = filteredExpenses.map((e) => [
      e.title, e.amount, e.category, new Date(e.date).toLocaleDateString(), e.description || "",
    ]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" })
    );
    link.download = "expenses.csv";
    link.click();
  };

  if (loading) {
    return (
      <DashboardLayout title="All Expenses">
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Loading expenses…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="All Expenses">
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackToDashboardButton />
          <button type="button" onClick={exportCSV}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl border-none cursor-pointer">
            <i className="ti ti-download" /> Export CSV
          </button>
        </div>

        <p className="text-sm text-gray-600 -mt-2">{filteredExpenses.length} of {expenses.length} expenses</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Expenses", value: filteredExpenses.length, color: "text-gray-900" },
            { label: "Total Amount", value: `₹${totalAmount.toLocaleString()}`, color: "text-red-600" },
            { label: "Active Filter", value: period, color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-600 text-sm mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} truncate`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-emerald-400 bg-white" />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-emerald-400">
              {["All", "Food", "Transport", "Shopping", "Health", "Entertainment", "Education", "Bills", "Other"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-emerald-400">
              {["All Time", "This Month", "Last Month", "This Year"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-emerald-400">
              {["Newest", "Oldest", "Highest", "Lowest"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">No expenses found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                      {["Title", "Category", "Amount", "Date", ""].map((h) => (
                        <th key={h || "actions"} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50 h-14">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-40 truncate">{expense.title}</td>
                      <td className="px-4 py-3">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{expense.category}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-red-600 whitespace-nowrap">₹{Number(expense.amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {new Date(expense.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                        <ExpenseRowActions
                          onEdit={() => navigate(`/editexpense/${expense._id}`)}
                          onDelete={() => handleDelete(expense._id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Viewexpense;
