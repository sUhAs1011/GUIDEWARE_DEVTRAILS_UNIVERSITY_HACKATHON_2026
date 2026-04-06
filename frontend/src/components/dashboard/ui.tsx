import { ReactNode } from "react";

export function SectionHeading({
  icon,
  title,
  action,
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-sm font-bold text-slate-300 uppercase tracking-[0.22em] flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}
