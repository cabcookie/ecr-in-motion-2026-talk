/**
 * Die Mitschrift eines Mailvorgangs.
 *
 * Die Begründungsfusszeile unter der Antwortmail zählt auf, welche Systeme
 * der Agent befragt hat, warum, und was dabei herauskam. Die alte
 * Werkzeugschleife hatte das als Nebenprodukt, weil sie jeden Aufruf selbst
 * sah. Im Blocks-Agenten läuft die Schleife im Rahmenwerk — also schreiben die
 * Werkzeuge selbst mit, und `antworte_per_mail` liest es beim Versand.
 *
 * Im Speicher des Prozesses, und das trägt: Ein Mailvorgang ist ein Zug, und
 * ein Zug läuft in AgentCore vollständig in derselben Sitzung. Seit
 * `frage_das_team` nicht mehr anhält, gibt es kein `resume()`, das in einem
 * anderen Prozess weitermachen könnte.
 *
 * Schlüssel ist der Kanal des Zuges. Der Chat hat keinen im Kontext und
 * schreibt deshalb nichts mit.
 */

export interface Schritt {
  readonly system: string;
  /** Vom Agenten selbst, gegeben BEVOR er das Ergebnis kannte. */
  readonly warum?: string;
  readonly ergebnis: Record<string, unknown>;
}

export interface Akte {
  readonly schritte: Schritt[];
  readonly fragen: { frage: string; warum: string }[];
  gesendet: boolean;
}

/*
  Ein Deckel gegen das Volllaufen: Ein Vorgang, der nie sendet, würde sonst
  liegen bleiben. Hundert offene Vorgänge in einem Prozess gibt es an einem
  Vortragsabend nicht; wer darüber kommt, verliert den ältesten.
*/
const HOECHSTENS = 100;
const akten = new Map<string, Akte>();

export function akteFuer(kanal: string): Akte {
  let akte = akten.get(kanal);
  if (!akte) {
    akte = { schritte: [], fragen: [], gesendet: false };
    akten.set(kanal, akte);
    if (akten.size > HOECHSTENS) {
      const aeltester = akten.keys().next().value;
      if (aeltester !== undefined) akten.delete(aeltester);
    }
  }
  return akte;
}
/*
  Nach dem Versand bleibt die Akte bewusst stehen: Ihr `gesendet` verhindert,
  dass ein zweiter Aufruf von `antworte_per_mail` eine zweite Mail schickt.
  Gelöscht, gäbe es für denselben Kanal eine frische Akte, die nichts davon
  weiß. Aufgeräumt wird über den Deckel.
*/
