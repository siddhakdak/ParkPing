"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id?: string;
  conversation_id?: string;
  message?: string;
  created_at?: string;
  sender_type?: string;
};

type Conversation = {
  id: string;
  messages?: Message[];
  last_message_at?: string;
};

type RealtimePayload = {
  new: Message;
};

export default function Inbox({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [items, setItems] = useState<Conversation[]>(conversations);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("owner-inbox")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const data = payload as unknown as RealtimePayload;
          const newMessage = data.new;

          if (!newMessage?.conversation_id) return;

          setItems((old) =>
            old.map((conversation) =>
              conversation.id === newMessage.conversation_id
                ? {
                    ...conversation,
                    messages: [
                      ...(conversation.messages || []),
                      newMessage,
                    ],
                    last_message_at:
                      newMessage.created_at ||
                      conversation.last_message_at,
                  }
                : conversation
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 35,
            textAlign: "center",
          }}
        >
          <h2>No messages</h2>
          <p className="muted">
            Vehicle alerts will appear here.
          </p>
        </div>
      ) : (
        items.map((conversation) => {
          const messages = [...(conversation.messages || [])].sort(
            (a, b) =>
              +new Date(a.created_at || 0) -
              +new Date(b.created_at || 0)
          );

          const latestMessage = messages[messages.length - 1];

          return (
            <div
              className="card"
              style={{ padding: 20 }}
              key={conversation.id}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <b>🔔 Anonymous Vehicle Visitor</b>

                <span className="muted">
                  {latestMessage?.created_at
                    ? new Date(
                        latestMessage.created_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>

              <p style={{ fontSize: 17 }}>
                {latestMessage?.message || "New conversation"}
              </p>

              <Conversation id={conversation.id} />
            </div>
          );
        })
      )}
    </div>
  );
}

function Conversation({ id }: { id: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function reply() {
    const text = message.trim();

    if (!text || busy) return;

    setBusy(true);

    try {
      await fetch(`/api/owner/conversations/${id}/reply`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function resolve() {
    await fetch(`/api/owner/conversations/${id}/resolve`, {
      method: "POST",
    });

    window.location.reload();
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <input
        className="field"
        placeholder="Reply anonymously…"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            reply();
          }
        }}
      />

      <button
        className="btn btn-dark"
        disabled={busy || !message.trim()}
        onClick={reply}
      >
        {busy ? "Sending…" : "Reply"}
      </button>

      <button
        className="btn btn-light"
        onClick={resolve}
      >
        Resolve
      </button>
    </div>
  );
}