import { ReactNode } from "react";

export function DashboardShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8 xl:px-8">
      {header}
      <div className="space-y-6">{children}</div>
    </main>
  );
}
