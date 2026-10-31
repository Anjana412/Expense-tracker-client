import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getAllWorkspaces } from "../api/api";
import { errMsg, formatDate } from "../utils/format";

const AllWorkspaces = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllWorkspaces()
      .then((r) => setRows(Array.isArray(r.data) ? r.data : []))
      .catch((e) => toast.error(errMsg(e, "Could not load workspaces")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="All Workspaces">
      <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto w-full flex flex-col gap-4">
        <p className="text-sm text-gray-600">Company workspaces on the platform. Their expenses and members' personal data are private and not shown here.</p>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12" role="status" aria-label="Loading">
              <span className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No workspaces have been created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Workspace", "Owner", "Members", "Created"].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((w) => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                      <td className="px-4 py-3 text-gray-700">{w.owner ? `${w.owner.name} (${w.owner.email})` : "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{w.memberCount}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(w.createdAt)}</td>
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

export default AllWorkspaces;
