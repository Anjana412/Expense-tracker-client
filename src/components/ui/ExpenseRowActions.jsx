/** Icon-only edit/delete actions for expense rows and tables */
const ExpenseRowActions = ({
  onEdit,
  onDelete,
  deleting = false,
  editTitle = "Edit expense",
  deleteTitle = "Delete expense",
}) => (
  <div className="flex items-center gap-0.5 shrink-0">
    {onEdit && (
      <button type="button" onClick={onEdit} title={editTitle} aria-label={editTitle}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border-none bg-transparent cursor-pointer transition-colors">
        <i className="ti ti-pencil text-[17px]" />
      </button>
    )}
    {onDelete && (
      <button type="button" onClick={onDelete} disabled={deleting} title={deleteTitle} aria-label={deleteTitle}
      className={["p-2 rounded-lg border-none bg-transparent cursor-pointer transition-colors",deleting? "text-gray-300 cursor-not-allowed": "text-red-500 hover:bg-red-50",].join(" ")}>
        <i className="ti ti-trash text-[17px]" />
      </button>
    )}
  </div>
);

export default ExpenseRowActions;
