import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "aws-blocks";
import { useChat, type ChatInstance, type ChatMessage } from "@aws-blocks/bb-agent/client";
import { SEED_MESSAGE } from "@/slides/agent";
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
export function useAgentChat(interactionId: string) {
  const me = useRef(participantId()).current;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(() => readConversation(interactionId) !== null);
  const chat = useRef<ChatInstance | null>(null);

  useEffect(() => {
    /**
     * Anlegen und Aufräumen gehören in denselben Effekt. Im StrictMode läuft
     * das Paar zweimal; steht das Anlegen außerhalb, zerstört der erste
     * Aufräumlauf die Instanz, die der zweite noch benutzt.
     */
    const instance = useChat({
      api: {
        createConversation: () => api.chatStart(me),
        sendMessage: (conversationId, message, channelId) =>
          api.chatSend(conversationId, message, channelId, me),
        getConversation: (id) => api.chatHistory(id),
      },
      subscribe: async (channelId, handler) => {
        const channel = await api.chatChannel(channelId);
        return channel.subscribe(handler);
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
  }, [interactionId, me]);

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

  /** Beginnt das Gespräch mit der eingehenden Mail. */
  const start = useCallback(async () => {
    if (started) return;
    setStarted(true);
    await send(SEED_MESSAGE);
  }, [send, started]);

  return { messages, loading, error, started, start, send, seed: SEED_MESSAGE };
}
