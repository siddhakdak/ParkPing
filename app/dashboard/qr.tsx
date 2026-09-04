"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

type Vehicle = {
  id: string;
  nickname?: string | null;
  model?: string | null;
  registration_number?: string | null;
};

export default function QRPanel({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  const [open, setOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const qrUrl = `/api/owner/vehicles/${vehicle.id}/qr`;

  const vehicleName =
    vehicle.nickname ||
    vehicle.model ||
    "My Vehicle";

  function safeFileName() {
    return (
      vehicle.registration_number ||
      vehicleName ||
      "Vehicle"
    )
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");
  }

  /*
   * Download the actual QR image directly.
   * This avoids navigating to a blank browser page.
   */
  async function downloadQR() {
    setBusy(true);

    try {
      const response = await fetch(qrUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load QR code.");
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `ParkPing-QR-${safeFileName()}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("QR download failed:", error);

      alert(
        "Unable to download QR code. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  /*
   * Generate compact PDF.
   *
   * Maximum size:
   * 5 x 5 inches
   * = 127 x 127 mm
   *
   * We use a square PDF so it never becomes
   * a full A4-sized document.
   */
  async function downloadPDF() {
    const sticker =
      document.getElementById(
        "parkping-qr-sticker"
      );

    if (!sticker) return;

    setBusy(true);

    try {
      const dataUrl = await toPng(sticker, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const MAX_MM = 127;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [MAX_MM, MAX_MM],
      });

      /*
       * Keep a small printable margin.
       */
      const margin = 5;

      const contentSize =
        MAX_MM - margin * 2;

      pdf.addImage(
        dataUrl,
        "PNG",
        margin,
        margin,
        contentSize,
        contentSize
      );

      pdf.save(
        `ParkPing-QR-Sticker-${safeFileName()}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      alert(
        "Unable to generate PDF. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function shareSticker() {
    const sticker =
      document.getElementById(
        "parkping-qr-sticker"
      );

    if (!sticker) return;

    setBusy(true);

    try {
      const dataUrl = await toPng(sticker, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const response = await fetch(dataUrl);

      const blob = await response.blob();

      const file = new File(
        [blob],
        `ParkPing-QR-Sticker-${safeFileName()}.png`,
        {
          type: "image/png",
        }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title:
            "ParkPing Vehicle QR Sticker",
          text:
            "Scan this QR code to contact the vehicle owner.",
          files: [file],
        });

        return;
      }

      /*
       * Fallback to downloading PNG.
       */
      const link =
        document.createElement("a");

      link.download =
        `ParkPing-QR-Sticker-${safeFileName()}.png`;

      link.href = dataUrl;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Sticker sharing failed:",
        error
      );

      alert(
        "Sharing is not supported on this device."
      );
    } finally {
      setBusy(false);
    }
  }

  function printSticker() {
    window.print();
  }

  return (
    <>
      {/* VIEW QR */}
      <button
        type="button"
        className="btn btn-light"
        onClick={() => setOpen(true)}
        style={{
          minHeight: 42,
          padding: "0 15px",
          fontWeight: 700,
        }}
      >
        ▦ View QR
      </button>

      {/* QR MODAL */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.60)",
            zIndex: 20,
            display: "grid",
            placeItems: "center",
            padding: 16,
            overflowY: "auto",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="card"
            style={{
              padding: 28,
              width: "min(440px,100%)",
              textAlign: "center",
              position: "relative",
              borderRadius: 20,
            }}
          >
            {/* CLOSE */}
            <button
              type="button"
              className="no-print"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                right: 15,
                top: 12,
                width: 36,
                height: 36,
                border: 0,
                borderRadius: 10,
                background: "#f3f3f3",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "#777",
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              ParkPing QR
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 25,
                letterSpacing: "-0.03em",
              }}
            >
              Contact this vehicle
            </h2>

            <p
              className="muted"
              style={{
                margin: "7px 0 18px",
                fontSize: 14,
              }}
            >
              Scan the QR code to contact the
              owner without seeing their phone
              number.
            </p>

            {/* QR */}
            <div
              style={{
                width: 292,
                maxWidth: "100%",
                aspectRatio: "1",
                margin: "0 auto 15px",
                padding: 12,
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: 18,
                boxSizing: "border-box",
              }}
            >
              <img
                src={qrUrl}
                alt="Vehicle QR code"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            </div>

            <strong
              style={{
                display: "block",
                fontSize: 17,
              }}
            >
              {vehicleName}
            </strong>

            {vehicle.registration_number && (
              <div
                className="muted"
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  letterSpacing: ".05em",
                }}
              >
                {vehicle.registration_number}
              </div>
            )}

            {/* ACTIONS */}
            <div
              style={{
                marginTop: 22,
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 9,
              }}
            >
              <button
                type="button"
                className="btn btn-dark no-print"
                disabled={busy}
                onClick={() => {
                  void downloadQR();
                }}
                style={{
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                {busy
                  ? "Downloading…"
                  : "⬇ Download QR"}
              </button>

              <button
                type="button"
                className="btn btn-light no-print"
                onClick={printSticker}
                style={{
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                🖨 Print
              </button>

              <button
                type="button"
                className="btn btn-dark no-print"
                onClick={() =>
                  setStickerOpen(true)
                }
                style={{
                  gridColumn: "1 / -1",
                  minHeight: 46,
                  fontWeight: 800,
                }}
              >
                ✨ Generate QR Sticker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKER MODAL */}
      {stickerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.76)",
            zIndex: 30,
            display: "grid",
            placeItems: "center",
            padding: 16,
            overflowY: "auto",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              width: "min(520px,100%)",
              maxHeight: "95vh",
              overflowY: "auto",
            }}
          >
            {/* HEADER */}
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: 12,
                color: "#fff",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      ".1em",
                  }}
                >
                  ParkPing
                </div>

                <strong
                  style={{
                    fontSize: 19,
                  }}
                >
                  QR Sticker
                </strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  setStickerOpen(false)
                }
                style={{
                  border: 0,
                  background:
                    "rgba(255,255,255,.15)",
                  color: "#fff",
                  borderRadius: 10,
                  fontSize: 22,
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* STICKER */}
            <div
              id="parkping-qr-sticker"
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: "#ffffff",
                borderRadius: 20,
                padding: "7%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent:
                  "space-between",
                textAlign: "center",
                fontFamily:
                  "Arial, Helvetica, sans-serif",
                color: "#111111",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,.25)",
              }}
            >
              {/* BRAND */}
              <div
                style={{
                  width: "100%",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "clamp(18px,4vw,25px)",
                    fontWeight: 900,
                    letterSpacing:
                      "1.5px",
                  }}
                >
                  PARKPING
                </div>

                <div
                  style={{
                    marginTop: 5,
                    height: 3,
                    width: 55,
                    background:
                      "#111111",
                    marginLeft: "auto",
                    marginRight: "auto",
                    borderRadius: 10,
                  }}
                />
              </div>

              {/* MESSAGE */}
              <div
                style={{
                  width: "100%",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "clamp(20px,5vw,30px)",
                    fontWeight: 900,
                    letterSpacing:
                      ".3px",
                    lineHeight: 1.05,
                  }}
                >
                  IN CASE OF
                  <br />
                  EMERGENCY
                </div>

                <div
                  style={{
                    marginTop: 9,
                    fontSize:
                      "clamp(11px,3vw,15px)",
                    lineHeight: 1.4,
                    color: "#555",
                  }}
                >
                  Scan this QR code to
                  contact the vehicle
                  owner.
                </div>
              </div>

              {/* QR */}
              <div
                style={{
                  background: "#fff",
                  padding: "3.5%",
                  border:
                    "1px solid #dedede",
                  borderRadius: 15,
                  width: "68%",
                  maxWidth: 330,
                  boxSizing:
                    "border-box",
                }}
              >
                <img
                  src={qrUrl}
                  alt="ParkPing vehicle QR"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>

              {/* VEHICLE */}
              <div
                style={{
                  width: "100%",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "clamp(15px,4vw,21px)",
                    fontWeight: 800,
                  }}
                >
                  {vehicleName}
                </div>

                {vehicle.registration_number && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize:
                        "clamp(12px,3vw,15px)",
                      fontWeight: 700,
                      letterSpacing:
                        "1px",
                      color: "#555",
                    }}
                  >
                    {
                      vehicle.registration_number
                    }
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div
                style={{
                  fontSize:
                    "clamp(9px,2.5vw,12px)",
                  color: "#777",
                  lineHeight: 1.4,
                }}
              >
                Private & secure
                <br />
                No phone number is displayed.
              </div>
            </div>

            {/* ACTIONS */}
            <div
              className="no-print"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr 1fr",
                gap: 8,
                marginTop: 12,
              }}
            >
              <button
                type="button"
                className="btn btn-dark"
                disabled={busy}
                onClick={() => {
                  void downloadPDF();
                }}
                style={{
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                {busy
                  ? "Working…"
                  : "📄 Download PDF"}
              </button>

              <button
                type="button"
                className="btn btn-light"
                disabled={busy}
                onClick={() => {
                  void shareSticker();
                }}
                style={{
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                📤 Share
              </button>

              <button
                type="button"
                className="btn btn-light"
                disabled={busy}
                onClick={printSticker}
                style={{
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                🖨 Print
              </button>
            </div>

            <div
              className="no-print"
              style={{
                color: "rgba(255,255,255,.65)",
                textAlign: "center",
                fontSize: 12,
                marginTop: 10,
              }}
            >
              Compact 5 × 5 inch maximum
              print size
            </div>
          </div>
        </div>
      )}
    </>
  );
}