import { useEffect } from "react";
import { BiLoader, BiX } from "react-icons/bi";
import { AppButton } from "./AppUI";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal = ({
  open,
  title,
  message,
  detail,
  confirmLabel = "Yes, cancel order",
  cancelLabel = "Go back",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => !loading && onClose()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-black/20 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-[#E23744] via-[#d93240] to-[#b82532] px-6 pb-8 pt-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <BiX size={20} />
          </button>

          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-2xl shadow-lg backdrop-blur-md">
            ⚠️
          </div>
          <h2
            id="confirm-modal-title"
            className="relative mt-4 text-center text-lg font-black text-white"
          >
            {title}
          </h2>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {message}
          </p>

          {detail && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-center text-xs leading-relaxed text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
              {detail}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <AppButton
              variant="secondary"
              disabled={loading}
              onClick={onClose}
              className="!py-2.5"
            >
              {cancelLabel}
            </AppButton>
            <AppButton
              variant="danger"
              disabled={loading}
              onClick={onConfirm}
              className="!py-2.5"
            >
              {loading ? <BiLoader className="animate-spin" /> : confirmLabel}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
