import { useEffect, useState } from "react";
import { api } from "aws-blocks";

export interface LiveAnswer {
  interactionId: string;
  participantId: string;
  value: string;
  at: number;
}

/**
 * Antworten des Publikums für die Leinwand.
 *
 * Beim Öffnen wird geladen, was schon da ist — sonst stünde die Auswertung
 * leer, wenn der Abschnitt ein zweites Mal aufgerufen wird. Danach kommt
 * jede neue Antwort über den Realtime-Kanal dazu.
 *
 * Ein Teilnehmer darf seine Antwort ändern; deshalb wird nach
 * Interaktion und Teilnehmer entdoppelt, nicht angehängt.
 */
export function useLiveAnswers(interactionIds: string[]) {
  const key = interactionIds.join("|");
  const [answers, setAnswers] = useState<LiveAnswer[]>([]);

  useEffect(() => {
    const ids = key ? key.split("|") : [];
    if (!ids.length) return;

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const merge = (incoming: LiveAnswer[]) =>
      setAnswers((current) => {
        const byKey = new Map(current.map((a) => [`${a.interactionId}:${a.participantId}`, a]));
        for (const a of incoming) {
          if (!ids.includes(a.interactionId)) continue;
          byKey.set(`${a.interactionId}:${a.participantId}`, a);
        }
        return [...byKey.values()].sort((a, b) => a.at - b.at);
      });

    void Promise.all(ids.map((id) => api.answersFor(id)))
      .then((lists) => {
        if (!cancelled) merge(lists.flat());
      })
      .catch(() => {
        // Ohne Backend bleibt die Auswertung leer — das ist besser als ein Absturz
      });

    void api
      .subscribeAnswers()
      .then((channel) => {
        if (cancelled) return;
        const sub = channel.subscribe((a: LiveAnswer) => merge([a]));
        unsubscribe = () => sub.unsubscribe();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [key]);

  return answers;
}
