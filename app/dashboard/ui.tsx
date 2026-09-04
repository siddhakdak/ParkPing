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
  const [tab, setTab] =
    useState<"vehicles" | "inbox">(
      "vehicles"
    );

  return (
    <main
      className="container"
      style={{
        padding: "25px 0 70px",
      }}
    >
      {/* Automatic push setup */}
      <PushSetup />

      <header
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 25,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="muted">
            ParkPing owner
          </div>

          <h1 style={{ margin: "4px 0" }}>
            {tab === "vehicles"
              ? "Your vehicles"
              : "Message inbox"}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn btn-light"
            onClick={() =>
              setTab(
                tab === "vehicles"
                  ? "inbox"
                  : "vehicles"
              )
            }
          >
            {tab === "vehicles"
              ? "🔔 Inbox"
              : "🚗 Vehicles"}
          </button>

          <Link
            href="/dashboard/vehicles/new"
            className="btn btn-dark"
          >
            + Add vehicle
          </Link>
        </div>
      </header>

      {/* VEHICLES */}
      <div
        style={{
          display:
            tab === "vehicles"
              ? "grid"
              : "none",
          gap: 16,
        }}
      >
        {vehicles.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 35,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 44,
              }}
            >
              🚗
            </div>

            <h2>
              No vehicles yet
            </h2>

            <p className="muted">
              Create your first QR identity.
            </p>

            <Link
              href="/dashboard/vehicles/new"
              className="btn btn-dark"
            >
              Add vehicle
            </Link>
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              className="card"
              style={{
                padding: 22,
              }}
              key={v.id}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 15,
                  alignItems: "start",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin:
                        "0 0 5px",
                    }}
                  >
                    {v.nickname ||
                      `${v.brand || ""} ${
                        v.model || ""
                      }`.trim() ||
                      "Vehicle"}
                  </h2>

                  <div className="muted">
                    {
                      v.registration_number
                    }{" "}
                    ·{" "}
                    {v.is_active
                      ? "🟢 Active"
                      : "⚪ Inactive"}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 28,
                  }}
                >
                  {v.vehicle_type ===
                  "Bike"
                    ? "🏍️"
                    : "🚗"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 18,
                }}
              >
                <QRPanel vehicle={v} />

                <Link
                  className="btn btn-light"
                  href={`/dashboard/vehicles/${v.id}`}
                >
                  Edit
                </Link>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={async () => {
                    await fetch(
                      `/api/owner/vehicles/${v.id}/deactivate`,
                      {
                        method: "POST",
                      }
                    );

                    location.reload();
                  }}
                >
                  {v.is_active
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 20,
                  marginTop: 16,
                  color: "#666",
                  fontSize: 14,
                }}
              >
                <span>
                  Scans:{" "}
                  {v.scan_count || 0}
                </span>

                <span>
                  Messages:{" "}
                  {v.message_count || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INBOX
          Kept mounted even when hidden so
          Realtime continues running.
      */}
      <div
        style={{
          display:
            tab === "inbox"
              ? "block"
              : "none",
        }}
      >
        <Inbox
          conversations={conversations}
        />
      </div>
    </main>
  );
}