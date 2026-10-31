const STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

// Text label is always shown, so colour is never the only signal.
const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STYLES[status] || STYLES.pending}`}>
    {status || "pending"}
  </span>
);

export default StatusBadge;
