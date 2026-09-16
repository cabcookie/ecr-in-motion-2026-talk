import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "aws-blocks";
import { useChat, type ChatInstance, type ChatMessage } from "@aws-blocks/bb-agent/client";
import { ANTWORT_WERKZEUGE, SEED_MESSAGE } from "@/slides/agent";
import { briefingFuer } from "@/slides/briefing";
import { participantId } from "./participant";

export type { ChatMessage };

const KEY = (id: string) => `ecr-chat:${id}`;

function readConversation(id: string): string | null {
  try {
    return localStorage.getItem(KEY(id));
  } catch {
    return null;
  }
}

function writeConversation(id: string, conversationId: string) {
  try {
    localStorage.setItem(KEY(id), conversationId);
  } catch {
    // Privater Modus: dann eben nur für diese Sitzung
  }
}

/**
 * Das Gespräch mit dem Agenten auf dem Handy.
 *
 * Begonnen wird es nicht mit einer Frage, sondern mit der Mail von Hallbach —
 * dieselbe, die in Abschnitt 2 auf der Leinwand stand. Der Agent ordnet sie
 * ein und fragt nach dem, was ihm fehlt. Deshalb ist die erste Nachricht des
 * Teilnehmers keine, die er getippt hat, und wird unten auch nicht als solche
 * gezeigt.
 *
 * Die Kennung des Gesprächs liegt im localStorage: wer sein Handy sperrt und
 * zurückkommt, landet wieder im selben Gespräch statt in einem neuen.
 */
/**
 * Womit das Gespräch beginnt.
 *
 * Aus dem Briefing heißt: mit der Mail, die dieser Teilnehmer als Lieferant
 * schreiben würde. Er bleibt damit die Rolle, die er den ganzen Abend hat, und
 * die Antwort des Agenten bezieht sich auf SEIN Produkt — nicht auf ein
 * Beispiel von der Leinwand, das er nur mitliest.
 */
function auftaktText(auftakt: "hallbach" | "briefing", teilnehmer: string): string {
  if (auftakt !== "briefing") return SEED_MESSAGE;
  const b = briefingFuer(teilnehmer);
  return [`Betreff: ${b.betreff}`, "", b.text.replace("[Dein Name]", "Ein Lieferant")].join("\n");
}

export function useAgentChat(
  interactionId: string,
  { stufe = "voll", auftakt = "hallbach" }: { stufe?: "voll" | "roh"; auftakt?: "hallbach" | "briefing" } = {},
) {
  const me = useRef(participantId()).current;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(() => readConversation(interactionId) !== null);
  const chat = useRef<ChatInstance | null>(null);

  /*
    Die Antworten, die der Agent über sein Werkzeug gegeben hat — je Zug eine.

    Sie stehen getrennt von `messages`, weil der Verlauf von Blocks je Nachricht
    EINEN zusammengesetzten Text führt: Was in ein Werkzeug geht, kommt dort nie
    an. Der Strom liefert es aber als eigenes Ereignis, und genau das macht die
    Trennung sauber — Werkzeug ist Antwort, alles andere ist Arbeitsweg.
  */
  const [antworten, setAntworten] = useState<string[]>([]);

  useEffect(() => {
    /**
     * Anlegen und Aufräumen gehören in denselben Effekt. Im StrictMode läuft
     * das Paar zweimal; steht das Anlegen außerhalb, zerstört der erste
     * Aufräumlauf die Instanz, die der zweite noch benutzt.
     */
    const instance = useChat({
      api: {
        createConversation: () => api.chatStart(me, stufe),
        sendMessage: (conversationId, message, channelId) =>
          api.chatSend(conversationId, message, channelId, me, stufe),
        getConversation: (id) => api.chatHistory(id, stufe),
      },
      subscribe: async (channelId, handler) => {
        const channel = await api.chatChannel(channelId, stufe);
        return channel.subscribe(handler);
      },
      /*
        Jeder Chunk läuft hier durch. Nur der Aufruf des Antwortwerkzeugs
        interessiert; die Fachwerkzeuge gehören zum Arbeitsweg und werden im
        Text ohnehin erwähnt.
      */
      onChunk: (chunk) => {
        if (chunk.type !== "tool-call") return;
        if (!ANTWORT_WERKZEUGE.includes(chunk.toolName ?? "")) return;
        const text = (chunk.input as { text?: string } | undefined)?.text;
        if (text) setAntworten((a) => [...a, text]);
      },
      onMessagesChange: setMessages,
      onLoadingChange: setLoading,
      onError: setError,
    });
    chat.current = instance;

    const existing = readConversation(interactionId);
    if (existing) {
      void instance.loadConversation(existing).catch(() => {
        setError("Das Gespräch ließ sich nicht laden.");
      });
    }

    return () => {
      instance.destroy();
      chat.current = null;
    };
  }, [interactionId, me, stufe]);

  /** Nach jedem Senden die Gesprächskennung sichern — sie entsteht erst dabei. */
  const remember = useCallback(() => {
    const id = chat.current?.getConversationId();
    if (id) writeConversation(interactionId, id);
  }, [interactionId]);

  const send = useCallback(
    async (text: string) => {
      const instance = chat.current;
      if (!instance || !text.trim()) return;
      setError(null);
      try {
        await instance.sendMessage(text.trim());
      } catch {
        setError("Die Nachricht kam nicht durch. Bitte noch einmal.");
      } finally {
        remember();
      }
    },
    [remember],
  );

  const seed = auftaktText(auftakt, me);

  /** Beginnt das Gespräch mit der eingehenden Mail. */
  const start = useCallback(async () => {
    if (started) return;
    setStarted(true);
    await send(seed);
  }, [send, started, seed]);

  return { messages, antworten, loading, error, started, start, send, seed };
}
