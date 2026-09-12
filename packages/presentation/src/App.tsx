import { LiveView } from "./components/LiveView";
import { OperatorView } from "./components/OperatorView";

/**
 * Zwei Ansichten, eine Anwendung.
 *
 * Die Auswahl läuft über einen Query-Parameter statt über Pfade, damit kein
 * Host eine SPA-Rewrite-Regel braucht: /?operator steuert, / zeigt.
 */
const IS_OPERATOR = new URLSearchParams(location.search).has("operator");

export default function App() {
  return IS_OPERATOR ? <OperatorView /> : <LiveView />;
}
