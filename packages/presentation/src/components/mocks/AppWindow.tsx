import type { ReactNode } from "react";

/** Rahmen, der einen Mock wie ein echtes Anwendungsfenster wirken lässt. */
export function AppWindow({
  label,
  pip,
  width = 1704,
  children,
}: {
  label: string;
  /** Farbe des Punktes in der Fensterzeile — ordnet das System zu */
  pip: string;
  width?: number;
  children: ReactNode;
}) {
  return (
    <div className="win" style={{ maxWidth: width }}>
      <div className="win-bar">
        <span className="pip" style={{ ["--pip" as string]: pip }} />
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

/** Inhalte aus den Foliendaten dürfen <b> enthalten. */
export function Rich({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
