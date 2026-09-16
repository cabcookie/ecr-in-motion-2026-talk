import { anhangStruktur } from "../../../aws-blocks/mail/anhang";
import anhangRoh from "../../../aws-blocks/mail/anhang.md?raw";

/**
 * Der Abspann — im Saal, auf dem Blatt und im Postfach derselbe.
 *
 * Gelesen wird aws-blocks/mail/anhang.md, dieselbe Datei, aus der die
 * Antwortmail ihren festen Teil nimmt. Eine dritte gepflegte Fassung waere
 * eine zu viel gewesen: Sie veraltet, und man merkt es erst, wenn jemand auf
 * einen toten Link klickt.
 *
 * Der Kopf der Datei — Dank, die drei Adressen, der Satz zur geloeschten
 * Mailadresse — bleibt hier draussen. Er gehoert in ein Postfach, nicht auf
 * eine Leinwand; `anhangStruktur` trennt das schon.
 *
 * `?raw` bettet die Datei beim Bauen ein. Im Browser gibt es kein Dateisystem,
 * und ein Abruf zur Laufzeit waere eine Netzverbindung, die auf der Leinwand
 * fehlschlagen kann.
 */
const ABSPANN = anhangStruktur(anhangRoh);

/** Die Adresse verkuerzt — auf einer Folie liest niemand "https://". */
function knapp(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Wo der Abspann auftritt, und was das mit ihm macht.
 *
 * `buehne` ist die Leinwand: gross, wenige Zeilen, aus zehn Metern lesbar.
 * `blatt` ist das PDF: klein, dafuer mit der vollstaendigen Adresse, weil ein
 * Blatt niemand anklicken kann und man sie abtippen koennen muss.
 */
export function AbspannListe({ ort }: { ort: "buehne" | "blatt" }) {
  const buehne = ort === "buehne";
  return (
    <div
      className={
        buehne
          ? "grid w-full grid-cols-2 gap-x-[90px] gap-y-[44px]"
          : "grid w-full grid-cols-2 gap-x-[12mm] gap-y-[6mm]"
      }
    >
      {ABSPANN.abschnitte.map((abschnitt) => (
        <div key={abschnitt.titel}>
          <h3
            className={
              buehne
                ? "m-0 font-display text-[34px] leading-tight font-extrabold text-[color:var(--accent)]"
                : "m-0 font-display text-[11pt] leading-tight font-extrabold text-[color:var(--accent)]"
            }
          >
            {abschnitt.titel}
          </h3>
          <ul className={buehne ? "mt-[18px] mb-0 list-none p-0" : "mt-2 mb-0 list-none p-0"}>
            {abschnitt.eintraege.map((e) => (
              <li key={e.url} className={buehne ? "mt-[14px]" : "mt-[2.5mm]"}>
                <p
                  className={
                    buehne
                      ? "m-0 text-[26px] leading-[1.3] text-fg"
                      : "m-0 text-[9pt] leading-snug text-fg"
                  }
                >
                  <b className="font-bold">{e.was}</b>
                  {/*
                    Auf der Leinwand nur der Name. Der erklaerende Satz ist fuer
                    das Postfach geschrieben — projiziert waeren vier Abschnitte
                    mal drei Saetze eine Textwand, und gelesen wuerde nichts.
                  */}
                  {!buehne && e.warum ? ` — ${e.warum}` : ""}
                </p>
                <p
                  className={
                    buehne
                      ? "m-0 font-mono text-[20px] leading-snug text-fg-3"
                      : "m-0 font-mono text-[7.5pt] leading-snug break-all text-fg-3"
                  }
                >
                  {buehne ? knapp(e.url) : e.url}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
