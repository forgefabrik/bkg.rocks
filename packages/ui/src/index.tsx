import type { ReactNode } from "react";

export interface PageShellProps {
  children: ReactNode;
  title: string;
}

export function PageShell({ children, title }: PageShellProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
