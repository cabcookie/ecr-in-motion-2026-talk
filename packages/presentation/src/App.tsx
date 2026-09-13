import { LiveView } from "./components/LiveView";
import { OperatorView } from "./components/OperatorView";
import { AudienceView } from "./components/AudienceView";

/**
 * Drei Ansichten, eine Anwendung.
 *
 * Die Auswahl läuft über Query-Parameter statt über Pfade, damit kein Host
 * eine SPA-Rewrite-Regel braucht:
 *   /              → Leinwand
 *   /?operator     → Steuerpult des Vortragenden
 *   /?audience     → Handy der Teilnehmer
 */
const params = new URLSearchParams(location.search);

export default function App() {
  if (params.has("audience")) return <AudienceView />;
  if (params.has("operator")) return <OperatorView />;
  return <LiveView />;
}
