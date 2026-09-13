import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "aws-blocks";
import { participantId } from "./participant";

const CACHE = "ecr-answers";

type Answers = Record<string, string>;

function readCache(): Answers {
  try {
    return JSON.parse(localStorage.getItem(CACHE) ?? "{}") as Answers;
  } catch {
    return {};
  }
}

function writeCache(a: Answers) {
  try {
    localStorage.setItem(CACHE, JSON.stringify(a));
  } catch {
    // nicht schlimm — der Server ist die eigentliche Ablage
  }
}

/**
 * Antworten des Teilnehmers.
 *
 * Zuerst aus dem lokalen Speicher, damit beim Zurückkommen sofort etwas
 * dasteht; danach vom Server nachgeladen, falls dasselbe Gerät zwischendurch
 * neu geladen hat. Geschrieben wird beides — der Server ist die Ablage, der
 * lokale Speicher nur der schnelle Weg zurück.
 */
export function useAnswers() {
  const me = useRef(participantId()).current;
  const [answers, setAnswers] = useState<Answers>(readCache);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void api
      .myAnswers(me)
      .then((rows) => {
        if (cancelled || !rows?.length) return;
        setAnswers((current) => {
          const merged = { ...current };
          for (const row of rows) merged[row.interactionId] = row.value;
          writeCache(merged);
          return merged;
        });
      })
      .catch(() => {
        // offline: der lokale Speicher reicht, bis die Verbindung wieder steht
      });
    return () => {
      cancelled = true;
    };
  }, [me]);

  const submit = useCallback(
    async (interactionId: string, value: string) => {
      setAnswers((current) => {
        const next = { ...current, [interactionId]: value };
        writeCache(next);
        return next;
      });
      setPending(true);
      try {
        await api.submitAnswer(interactionId, me, value);
      } catch {
        // Die Antwort steht lokal; sie geht beim nächsten Versuch mit
      } finally {
        setPending(false);
      }
    },
    [me],
  );

  return { answers, submit, pending, participant: me };
}
