import { ReactNode, useEffect } from "react";

export function OverlayInfoModal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <button
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/72 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/88 p-6 shadow-2xl backdrop-blur-3xl transition-transform duration-200 [animation:modal-enter_180ms_var(--ease-out)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-100">{title}</h3>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-400">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="pressable rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300"
          >
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
