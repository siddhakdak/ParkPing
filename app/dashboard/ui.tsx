"use client";

import { useState } from "react";
import Link from "next/link";

import QRPanel from "./qr";
import Inbox from "./inbox";
import PushSetup from "./push";

export default function DashboardClient({
  vehicles,
  conversations,
}: {
  vehicles: any[];
  conversations: any[];
}) {
  const [tab, setTab] = useState<"vehicles" | "inbox">("vehicles");

  return (
    <main
      className="container"
      style={{
        padding: "32px 0 80px",
      }}
    >
      <PushSetup />

      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            className="muted"
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            ParkPing Owner
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(28px, 5vw, 38px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            {tab === "vehicles"
              ? "Your vehicles"
              : "Message inbox"}
          </h1>

          <p
            className="muted"
            style={{
              margin: "8px 0 0",
              fontSize: 15,
            }}
          >
            {tab === "vehicles"
              ? "Manage your vehicles and QR contact codes."
              : "Messages from people trying to contact you."}
          </p>
        </div>

        {/* HEADER ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn btn-light"
            onClick={() =>
              setTab(tab === "vehicles" ? "inbox" : "vehicles")
            }
            style={{
              minHeight: 44,
              padding: "0 16px",
              fontWeight: 700,
            }}
          >
            {tab === "vehicles"
              ? "🔔  Inbox"
              : "🚗  Vehicles"}
          </button>

          <Link
            href="/dashboard/vehicles/new"
            className="btn btn-dark"
            style={{
              minHeight: 44,
              padding: "0 18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            + Add vehicle
          </Link>
        </div>
      </header>

      {/* QUICK STATS */}
      {vehicles.length > 0 && tab === "vehicles" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            className="card"
            style={{
              padding: "16px 18px",
            }}
          >
            <div
              className="muted"
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Vehicles
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                marginTop: 4,
              }}
            >
              {vehicles.length}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "16px 18px",
            }}
          >
            <div
              className="muted"
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Total scans
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                marginTop: 4,
              }}
            >
              {vehicles.reduce(
                (total, vehicle) =>
                  total + Number(vehicle.scan_count || 0),
                0
              )}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: "16px 18px",
            }}
          >
            <div
              className="muted"
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Messages
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                marginTop: 4,
              }}
            >
              {vehicles.reduce(
                (total, vehicle) =>
                  total + Number(vehicle.message_count || 0),
                0
              )}
            </div>
          </div>
        </div>
      )}

      {/* VEHICLES */}
      <div
        style={{
          display: tab === "vehicles" ? "grid" : "none",
          gap: 14,
        }}
      >
        {vehicles.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "55px 25px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                margin: "0 auto 18px",
                borderRadius: 22,
                display: "grid",
                placeItems: "center",
                background: "#f4f4f4",
                fontSize: 38,
              }}
            >
              🚗
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 24,
                letterSpacing: "-0.02em",
              }}
            >
              No vehicles yet
            </h2>

            <p
              className="muted"
              style={{
                margin: "8px auto 22px",
                maxWidth: 420,
              }}
            >
              Add your vehicle to create a unique ParkPing QR code
              that people can scan to contact you.
            </p>

            <Link
              href="/dashboard/vehicles/new"
              className="btn btn-dark"
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 20px",
                fontWeight: 700,
              }}
            >
              + Add your first vehicle
            </Link>
          </div>
        ) : (
          vehicles.map((v) => {
            const vehicleName =
              v.nickname ||
              `${v.brand || ""} ${v.model || ""}`.trim() ||
              "Vehicle";

            return (
              <div
                className="card"
                key={v.id}
                style={{
                  padding: 22,
                  overflow: "hidden",
                }}
              >
                {/* VEHICLE TOP */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        flexWrap: "wrap",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 22,
                          lineHeight: 1.2,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {vehicleName}
                      </h2>

                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "5px 9px",
                          borderRadius: 999,
                          background: v.is_active
                            ? "#eaf8ef"
                            : "#f1f1f1",
                        }}
                      >
                        {v.is_active
                          ? "● Active"
                          : "○ Inactive"}
                      </span>
                    </div>

                    <div
                      className="muted"
                      style={{
                        marginTop: 7,
                        fontSize: 14,
                      }}
                    >
                      {v.registration_number ||
                        "Registration number not added"}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 15,
                      display: "grid",
                      placeItems: "center",
                      background: "#f5f5f5",
                      fontSize: 25,
                      flexShrink: 0,
                    }}
                  >
                    {v.vehicle_type === "Bike"
                      ? "🏍️"
                      : "🚗"}
                  </div>
                </div>

                {/* DIVIDER */}
                <div
                  style={{
                    height: 1,
                    background: "#ededed",
                    margin: "20px 0 16px",
                  }}
                />

                {/* STATS */}
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      className="muted"
                      style={{
                        fontSize: 12,
                        marginBottom: 3,
                      }}
                    >
                      QR scans
                    </div>

                    <strong
                      style={{
                        fontSize: 17,
                      }}
                    >
                      {v.scan_count || 0}
                    </strong>
                  </div>

                  <div>
                    <div
                      className="muted"
                      style={{
                        fontSize: 12,
                        marginBottom: 3,
                      }}
                    >
                      Messages
                    </div>

                    <strong
                      style={{
                        fontSize: 17,
                      }}
                    >
                      {v.message_count || 0}
                    </strong>
                  </div>
                </div>

                {/* ACTIONS */}
                <div
                  style={{
                    display: "flex",
                    gap: 9,
                    flexWrap: "wrap",
                  }}
                >
                  <QRPanel vehicle={v} />

                  <Link
                    className="btn btn-light"
                    href={`/dashboard/vehicles/${v.id}/edit`}
                    style={{
                      minHeight: 42,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 15px",
                      fontWeight: 700,
                    }}
                  >
                    ✏️ Edit
                  </Link>

                  <button
                    type="button"
                    className="btn btn-light"
                    style={{
                      minHeight: 42,
                      padding: "0 15px",
                      fontWeight: 700,
                    }}
                    onClick={async () => {
                      const action = v.is_active
                        ? "deactivate"
                        : "activate";

                      const confirmed = window.confirm(
                        v.is_active
                          ? "Deactivate this vehicle QR?"
                          : "Activate this vehicle QR?"
                      );

                      if (!confirmed) return;

                      const response = await fetch(
                        `/api/owner/vehicles/${v.id}/deactivate`,
                        {
                          method: "POST",
                        }
                      );

                      if (!response.ok) {
                        alert(
                          `Failed to ${action} vehicle. Please try again.`
                        );
                        return;
                      }

                      window.location.reload();
                    }}
                  >
                    {v.is_active
                      ? "⏸ Deactivate"
                      : "▶ Activate"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INBOX */}
      <div
        style={{
          display: tab === "inbox" ? "block" : "none",
        }}
      >
        <Inbox conversations={conversations} />
      </div>
    </main>
  );
}