import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Styled replacement for window.confirm.
 *   const { confirm, ConfirmModal } = useConfirm();
 *   if (!(await confirm({ title, message, confirmLabel, danger }))) return;
 *   ...render <ConfirmModal /> once in the page.
 */
export function useConfirm() {
  const [opts, setOpts] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOpts(options);
      }),
    []
  );

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  };

  const ConfirmModal = () => (opts ? <ConfirmDialog {...opts} onCancel={() => close(false)} onConfirm={() => close(true)} /> : null);
  return { confirm, ConfirmModal };
}

const ConfirmDialog = ({ title = "Are you sure?", message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, onCancel, onConfirm }) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-msg"
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${danger ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-600"}`}>
          <i className={`ti ${danger ? "ti-trash" : "ti-help-circle"} text-xl`} aria-hidden="true" />
        </div>
        <h3 id="confirm-title" className="text-gray-900 font-semibold text-lg mb-1">{title}</h3>
        <p id="confirm-msg" className="text-gray-500 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button type="button" ref={cancelRef} onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-violet-500 hover:bg-violet-700"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
