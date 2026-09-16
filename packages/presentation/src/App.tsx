import { LiveView } from "./components/LiveView";
import { OperatorView } from "./components/OperatorView";
import { AudienceView } from "./components/AudienceView";
import { PapierView } from "./components/PapierView";
import { Abschlussseite } from "./components/Abschlussseite";
import { useVortragsfenster } from "./sync/useVortragsfenster";
import { ansicht } from "./routen";

/**
 * Drei Ansichten, eine Anwendung. Welche, entscheidet der Pfad — siehe routen.ts.
 */
export default function App() {
  switch (ansicht()) {
    case "leinwand":
      return <LiveView />;
    case "operator":
      return <OperatorView />;
    case "papier":
      return <PapierView />;
    default:
      return <Teilnehmer />;
  }
}

/**
 * Die Wurzel: im Vortragsfenster die Teilnehmersicht, sonst die letzte Folie
 * (siehe aws-blocks/fenster.ts).
 */
function Teilnehmer() {
  const { stand } = useVortragsfenster();
  if (stand === null) return <div className="h-dvh bg-stage" aria-busy="true" />;
  return stand.aktiv ? <AudienceView /> : <Abschlussseite />;
}
