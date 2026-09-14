/** Maße eines üblichen Handys — die Zuschauersicht ist dafür gebaut. */
const HANDY_W = 393;
const HANDY_H = 852;

/**
 * Was die Teilnehmer gerade auf dem Handy sehen.
 *
 * Bewusst die echte Ansicht in einem Rahmen und keine Nachbildung: sie folgt
 * über denselben Kanal wie alles andere, zeigt also genau das, was im Saal
 * auf den Geräten steht — samt Interaktion des aktuellen Panels.
 *
 * Klicks gehen nicht hinein. Der Vortragende soll hier nichts auslösen
 * können, was als Antwort eines Teilnehmers in der Auswertung landet.
 */
export function AudiencePreview({ width, height }: { width: number; height: number }) {
  const scale = Math.min(width / HANDY_W, height / HANDY_H);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[14px] border border-hair bg-stage"
      style={{ width: HANDY_W * scale, height: HANDY_H * scale }}
    >
      <iframe
        src="/?audience"
        title="Zuschauersicht"
        tabIndex={-1}
        className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
        style={{ width: HANDY_W, height: HANDY_H, transform: `scale(${scale})` }}
      />
    </div>
  );
}
