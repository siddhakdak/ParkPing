"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import { startAlarm, stopAlarm } from "@/lib/alarm";

type Message = {
  id: string;
  conversation_id: string;
  message: string;
  created_at: string;
  sender_type: string;
};

type Conversation = {
  id: string;
  messages?: Message[];
  last_message_at?: string;
};

type RealtimeMessage = {
  id?: string;
  conversation_id?: string;
  message?: string;
  created_at?: string;
  sender_type?: string;
};

export default function Inbox({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [items, setItems] = useState<Conversation[]>(
    conversations
  );

  const [alarmActive, setAlarmActive] =
    useState(false);

  const seenMessageIds = useRef<Set<string>>(
    new Set()
  );

  const supabase = useMemo(
    () => createClient(),
    []
  );

  useEffect(() => {
    const ids = new Set<string>();

    conversations.forEach((conversation) => {
      (conversation.messages || []).forEach(
        (message) => {
          if (message.id) {
            ids.add(message.id);
          }
        }
      );
    });

    seenMessageIds.current = ids;
  }, [conversations]);

  useEffect(() => {
    const channel = supabase
      .channel("parkping-owner-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const incoming =
            payload.new as RealtimeMessage;

          const messageId = incoming.id;
          const conversationId =
            incoming.conversation_id;

          if (!messageId || !conversationId) {
            return;
          }

          if (
            seenMessageIds.current.has(
              messageId
            )
          ) {
            return;
          }

          seenMessageIds.current.add(
            messageId
          );

          const newMessage: Message = {
            id: messageId,
            conversation_id:
              conversationId,
            message:
              incoming.message || "",
            created_at:
              incoming.created_at ||
              new Date().toISOString(),
            sender_type:
              incoming.sender_type ||
              "visitor",
          };

          setItems((current) => {
            const existing =
              current.find(
                (conversation) =>
                  conversation.id ===
                  conversationId
              );

            if (existing) {
              const messages = [
                ...(existing.messages || []),
              ];

              if (
                messages.some(
                  (message) =>
                    message.id ===
                    messageId
                )
              ) {
                return current;
              }

              messages.push(newMessage);

              return current.map(
                (conversation) =>
                  conversation.id ===
                  conversationId
                    ? {
                        ...conversation,
                        messages,
                        last_message_at:
                          newMessage.created_at,
                      }
                    : conversation
              );
            }

            const newConversation: Conversation =
              {
                id: conversationId,
                messages: [newMessage],
                last_message_at:
                  newMessage.created_at,
              };

            return [
              newConversation,
              ...current,
            ];
          });

          if (
            newMessage.sender_type ===
            "visitor"
          ) {
            const alarmStarted =
              startAlarm();

            if (alarmStarted) {
              setAlarmActive(true);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "ParkPing realtime status:",
          status
        );
      });

    return () => {
      stopAlarm();
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  function handleStopAlarm() {
    stopAlarm();
    setAlarmActive(false);
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      {alarmActive && (
        <div
          className="card"
          style={{
            padding: 20,
            border: "2px solid #111",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong>
              🚨 NEW VEHICLE MESSAGE
            </strong>

            <div
              className="muted"
              style={{
                marginTop: 5,
              }}
            >
              Someone is trying to contact you
              about your vehicle.
            </div>
          </div>

          <button
            type="button"
            className="btn btn-dark"
            onClick={handleStopAlarm}
          >
            🔇 STOP ALARM
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 35,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 42,
              marginBottom: 10,
            }}
          >
            🔔
          </div>

          <h2>No messages</h2>

          <p className="muted">
            Vehicle alerts will appear here
            automatically.
          </p>
        </div>
      ) : (
        items.map((conversation) => {
          const messages = [
            ...(conversation.messages || []),
          ].sort(
            (a, b) =>
              new Date(
                a.created_at
              ).getTime() -
              new Date(
                b.created_at
              ).getTime()
          );

          return (
            <div
              className="card"
              style={{
                padding: 20,
              }}
              key={conversation.id}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <b>
                  🔔 Anonymous Vehicle Visitor
                </b>

                <span className="muted">
                  {messages.length > 0 &&
                  messages[
                    messages.length - 1
                  ].created_at
                    ? new Date(
                        messages[
                          messages.length - 1
                        ].created_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : ""}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 15,
                }}
              >
                {messages.map(
                  (message) => {
                    const isVisitor =
                      message.sender_type ===
                      "visitor";

                    return (
                      <div
                        key={message.id}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          backgroundColor:
                            isVisitor
                              ? "#f3f3f3"
                              : "#e9f7ee",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 5,
                          }}
                        >
                          {isVisitor
                            ? "Visitor"
                            : "You"}
                        </div>

                        <div
                          style={{
                            fontSize: 16,
                          }}
                        >
                          {message.message}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <Conversation
                id={conversation.id}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

function Conversation({
  id,
}: {
  id: string;
}) {
  const [message, setMessage] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  async function reply() {
    const text = message.trim();

    if (!text || busy) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `/api/owner/conversations/${id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to send reply."
        );
      }

      setMessage("");
    } catch (error) {
      console.error(
        "Reply error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to send reply."
      );
    } finally {
      setBusy(false);
    }
  }

  async function resolve() {
    try {
      const response = await fetch(
        `/api/owner/conversations/${id}/resolve`,
        {
          method: "POST",
        }
      );

      const result =
        await response.json().catch(
          () => null
        );

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to resolve conversation."
        );
      }

      stopAlarm();

      window.location.reload();
    } catch (error) {
      console.error(
        "Resolve error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to resolve conversation."
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 15,
      }}
    >
      <input
        className="field"
        type="text"
        placeholder="Reply anonymously…"
        value={message}
        onChange={(event) =>
          setMessage(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            void reply();
          }
        }}
      />

      <button
        type="button"
        className="btn btn-dark"
        disabled={
          busy || !message.trim()
        }
        onClick={() => {
          void reply();
        }}
      >
        {busy
          ? "Sending…"
          : "Reply"}
      </button>

      <button
        type="button"
        className="btn btn-light"
        onClick={() => {
          void resolve();
        }}
      >
        Resolve
      </button>
    </div>
  );
}

