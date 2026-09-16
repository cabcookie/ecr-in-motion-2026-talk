import type { ReactNode } from "react";

/** Rahmen, der einen Mock wie ein echtes Anwendungsfenster wirken lässt. */
export function AppWindow({
  label,
  pip,
  width = 1704,
  children,
}: {
  label: string;
  /** Tailwind-Klasse für den Punkt in der Fensterzeile — ordnet das System zu */
  pip: string;
  width?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-lg bg-win text-win-ink shadow-[0_2px_4px_rgba(0,0,0,0.3),0_24px_70px_rgba(0,0,0,0.55)] [--rich-strong:var(--color-win-ink)]"
      style={{ maxWidth: width }}
    >
      <div className="flex items-center gap-[15px] border-b border-win-rule bg-win-2 px-[30px] py-[20px] font-mono text-[21px] tracking-[0.09em] text-win-muted uppercase">
        <span className={`size-[15px] rounded-[3px] ${pip}`} />
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

/** Inhalte aus den Foliendaten dürfen <b> enthalten. */
export function Rich({ html, className = "" }: { html: string; className?: string }) {
  return <span className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
