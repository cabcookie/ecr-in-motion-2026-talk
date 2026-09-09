/**
 * Entity: Message
 * Domain-Modell für Outlook- und Teams-Nachrichten.
 */

import { useCallback, useEffect, useState } from "react";
import { api } from "@/shared/api";

export interface Message {
  id: number;
  channel: "outlook" | "teams";
  sender: string;
  recipient: string;
  subject: string | null;
  body: string;
  timestamp: string;
  read_status: 0 | 1;
  thread_id: string | null;
}

interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch outlook messages from the Soul API.
 * Filters by channel=outlook and orders by timestamp descending.
 */
export function useMessages(): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.tables.getRows<Message>("messages", {
        filter: "channel:outlook",
        _sort: "timestamp",
        _order: "DESC",
      });
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  return { messages, loading, error, refetch: fetchMessages };
}
/**
 * Hook to mark a message as read via the Soul API.
 * Returns a function that updates read_status to 1.
 */
export function useMarkAsRead(): (id: number) => Promise<void> {
  return useCallback(async (id: number) => {
    await api.tables.updateRow<Message>("messages", id, { read_status: 1 });
  }, []);
}
