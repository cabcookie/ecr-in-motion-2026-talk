import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/shared/api";
import { ChannelList, MessageThread } from "@/features/chat-viewer";
import type { Message } from "@/entities/message";

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  sidebar: {
    width: "300px",
    minWidth: "240px",
    borderRight: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#5f6368",
    fontSize: "14px",
  },
  error: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#d93025",
    fontSize: "14px",
    padding: "20px",
    textAlign: "center" as const,
  },
};

export function TeamsPage() {
  useEffect(() => {
    document.title = "ALDI Teams";
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.tables.getRows<Message>("messages", {
        filter: "channel:teams",
        _sort: "timestamp",
        _order: "ASC",
      });
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Laden der Nachrichten",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const threads = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const message of messages) {
      const threadId = message.thread_id ?? "Allgemein";
      const existing = map.get(threadId);
      if (existing) {
        existing.push(message);
      } else {
        map.set(threadId, [message]);
      }
    }
    return map;
  }, [messages]);

  const selectedMessages = useMemo(() => {
    if (!selectedThreadId) return [];
    return threads.get(selectedThreadId) ?? [];
  }, [threads, selectedThreadId]);

  if (loading) {
    return (
      <div style={styles.layout}>
        <div style={styles.loading}>Nachrichten werden geladen…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.layout}>
        <div style={styles.error}>
          Fehler beim Laden der Nachrichten: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <ChannelList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
        />
      </div>
      <div style={styles.content}>
        <MessageThread
          threadId={selectedThreadId}
          messages={selectedMessages}
        />
      </div>
    </div>
  );
}
