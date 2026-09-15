import { useEffect } from "react";
import { api } from "aws-blocks";

/**
 * Horcht darauf, dass der Vortragende alles zurückgesetzt hat.
 *
 * Gebraucht wird das in den Proben. Ein Durchlauf hinterlässt Antworten im
 * Speicher und Gespräche auf den Handys; beim nächsten Durchlauf stünden sie
 * wieder da, und auf der Leinwand hätte die Umfrage Punkte, bevor jemand
 * geantwortet hat.
 *
 * Der Rückruf steckt in einem Ref-freien Effekt, der nur einmal aufgebaut wird:
 * Die Aufrufer übergeben eine stabile Funktion, und ein Kanal, der bei jedem
 * Rendern neu abonniert wird, verliert Ereignisse zwischen Ab- und Anmeldung.
 */
export function useReset(onReset: () => void) {
  useEffect(() => {
    let abgebrochen = false;
    let abmelden: (() => void) | null = null;

    void api
      .subscribeReset()
      .then((channel) => {
        if (abgebrochen) return;
        const sub = channel.subscribe(() => onReset());
        abmelden = () => sub.unsubscribe();
      })
      .catch(() => {
        /*
          Ohne Backend gibt es keinen Kanal — dann bleibt der Knopf im
          Steuerpult ohne Wirkung auf andere Geräte. Das ist kein Grund, die
          Ansicht abstürzen zu lassen.
        */
      });

    return () => {
      abgebrochen = true;
      abmelden?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Die Schlüssel, unter denen ein Handy seine eigenen Eingaben führt. */
const EIGENE = [/^ecr-answers$/, /^ecr-chat:/];

/**
 * Was auf dem Handy zurückgesetzt wird.
 *
 * Die Gerätekennung bleibt stehen — sie ist keine Eingabe, sondern das, was
 * dieses Gerät ausmacht. Gelöscht werden die zwischengespeicherten Antworten
 * und die Gesprächskennungen; danach beginnt ein Chat von vorn, statt das alte
 * Gespräch weiterzuführen.
 */
export function eigeneEingabenLoeschen(): void {
  try {
    const raus: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && EIGENE.some((m) => m.test(key))) raus.push(key);
    }
    for (const key of raus) localStorage.removeItem(key);
  } catch {
    // Privater Modus: dort gab es ohnehin nichts zu löschen
  }
}
