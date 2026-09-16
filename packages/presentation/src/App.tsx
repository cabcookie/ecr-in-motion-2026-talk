import { LiveView } from "./components/LiveView";
import { OperatorView } from "./components/OperatorView";
import { AudienceView } from "./components/AudienceView";
import { PapierView } from "./components/PapierView";
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
      return <AudienceView />;
  }
}
