import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "aws-blocks";
import { useChat, type ChatInstance, type ChatMessage } from "@aws-blocks/bb-agent/client";
import { ANTWORT_WERKZEUGE, SEED_MESSAGE } from "@/slides/agent";
import { briefingFuer } from "@/slides/briefing";
import { participantId } from "./participant";

export type { ChatMessage };

/** Ein Eintrag, wie `chatHistory` ihn liefert — auch Werkzeugaufrufe. */
interface Verlaufseintrag {
  role: string;
  content: string;
  metadata?: { toolName?: string; toolInput?: unknown };
}

/**
 * Baut aus dem gespeicherten Verlauf, was die App zeigt: je Zug des Agenten
 * EINE Nachricht mit dem Gedankengang, und daneben seine Antwort.
 *
 * Der Bibliothek allein reicht das nicht. Sie behält beim Laden nur Nachrichten
 * von Nutzer und Assistent — die Antwort steckt aber im Aufruf des
 * Antwortwerkzeugs und fiel dabei weg. Wer vom Chat weg- und zurücksprang, sah
 * danach nur noch die Anfrage.
 */
export function verlaufAufbereiten(verlauf: readonly Verlaufseintrag[]): {
  messages: ChatMessage[];
  antworten: (string | undefined)[];
} {
  const messages: ChatMessage[] = [];
  const antworten: (string | undefined)[] = [];
  let zug: { weg: string[]; antwort?: string } | null = null;
  const abschliessen = () => {
    if (!zug) return;
    messages.push({ id: `verlauf-${messages.length}`, role: "assistant", content: zug.weg.join("\n\n") });
    antworten.push(zug.antwort);
    zug = null;
  };
  for (const m of verlauf) {
    if (m.role === "user") {
      abschliessen();
      messages.push({ id: `verlauf-${messages.length}`, role: "user", content: m.content });
      continue;
    }
    zug ??= { weg: [] };
    if (m.role === "assistant" && m.content.trim()) zug.weg.push(m.content);
    const werkzeug = m.metadata?.toolName ?? "";
    const text = (m.metadata?.toolInput as { text?: unknown } | undefined)?.text;
    if (m.role === "tool-call" && ANTWORT_WERKZEUGE.includes(werkzeug) && typeof text === "string") {
      zug.antwort = text;
    }
  }
  abschliessen();
  return { messages, antworten };
}

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
  { stufe = "voll", auftakt = "hallbach" }: { stufe?: "voll" | "werkzeuge" | "prompt" | "roh"; auftakt?: "hallbach" | "briefing" } = {},
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
  const [antworten, setAntworten] = useState<(string | undefined)[]>([]);

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
        /*
          Die Bibliothek wirft beim Laden die Werkzeugaufrufe weg. Deshalb
          bekommt sie hier schon den aufbereiteten Verlauf, und die Antworten
          werden nebenbei gesetzt.
        */
        getConversation: async (id) => {
          const { messages: roh } = await api.chatHistory(id, stufe);
          const v = verlaufAufbereiten(roh);
          setAntworten(v.antworten);
          return { messages: v.messages };
        },
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
    let aktiv = true;
    if (existing) {
      /*
        Zweimal, mit Absicht. loadConversation abonniert zuerst den Kanal und
        lädt erst danach den Verlauf — steht das Abonnement nicht, kommt nichts.
        Der direkte Abruf zeigt das Gespräch trotzdem sofort; was die
        Bibliothek danach liefert, ist derselbe Stand.
      */
      void api
        .chatHistory(existing, stufe)
        .then(({ messages: roh }) => {
          if (!aktiv) return;
          const v = verlaufAufbereiten(roh);
          setMessages(v.messages);
          setAntworten(v.antworten);
        })
        .catch(() => {});
      void instance.loadConversation(existing).catch(() => {
        if (aktiv) setError("Das Gespräch ließ sich nicht laden.");
      });
    }

    return () => {
      aktiv = false;
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
