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
  const [stickerOpen, setStickerOpen] =
    useState(false);
  const [busy, setBusy] = useState(false);

  const qrUrl =
    `/api/owner/vehicles/${vehicle.id}/qr`;

  const vehicleName =
    vehicle.nickname ||
    vehicle.model ||
    "My Vehicle";

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

      const pdf =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [100, 140],
        });

      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        100,
        140
      );

      const safeName =
        (vehicle.registration_number ||
          vehicleName)
          .replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          );

      pdf.save(
        `ParkPing-QR-Sticker-${safeName}.pdf`
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

      const response =
        await fetch(dataUrl);

      const blob =
        await response.blob();

      const file = new File(
        [blob],
        "ParkPing-QR-Sticker.png",
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
       * Fallback:
       * If native file sharing isn't supported,
       * download the sticker image instead.
       */
      const link =
        document.createElement("a");

      link.download =
        "ParkPing-QR-Sticker.png";

      link.href = dataUrl;

      link.click();
    } catch (error) {
      /*
       * User cancelling the share dialog
       * should not show an error.
       */
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
        "Sharing is not supported on this device. The sticker image will be downloaded instead."
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
      >
        ▦ View QR
      </button>

      {/* QR MODAL */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,.55)",
            zIndex: 20,
            display: "grid",
            placeItems: "center",
            padding: 16,
            overflowY: "auto",
          }}
        >
          <div
            className="card"
            style={{
              padding: 28,
              width:
                "min(420px,100%)",
              textAlign: "center",
              position: "relative",
            }}
          >
            <button
              type="button"
              className="no-print"
              onClick={() =>
                setOpen(false)
              }
              style={{
                position: "absolute",
                right: 15,
                top: 12,
                border: 0,
                background:
                  "transparent",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              🚗 NEED TO CONTACT ME?
            </div>

            <p className="muted">
              SCAN HERE — NO PHONE NUMBER
              REQUIRED
            </p>

            <img
              src={qrUrl}
              alt="Vehicle QR code"
              style={{
                width: 280,
                height: 280,
                margin:
                  "10px auto",
                display: "block",
              }}
            />

            <strong>
              {vehicleName}
            </strong>

            {vehicle.registration_number && (
              <div
                className="muted"
                style={{
                  marginTop: 4,
                }}
              >
                {
                  vehicle.registration_number
                }
              </div>
            )}

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 8,
                justifyContent:
                  "center",
                flexWrap: "wrap",
              }}
            >
              <a
                className="btn btn-dark no-print"
                href={`${qrUrl}?download=1`}
              >
                Download QR
              </a>

              <button
                type="button"
                className="btn btn-light no-print"
                onClick={printSticker}
              >
                Print
              </button>

              <button
                type="button"
                className="btn btn-dark no-print"
                onClick={() =>
                  setStickerOpen(true)
                }
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
            background:
              "rgba(0,0,0,.72)",
            zIndex: 30,
            display: "grid",
            placeItems: "center",
            padding: 16,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width:
                "min(520px,100%)",
              maxHeight:
                "95vh",
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
              <strong
                style={{
                  fontSize: 18,
                }}
              >
                QR Sticker Preview
              </strong>

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
                  borderRadius: 8,
                  fontSize: 22,
                  width: 38,
                  height: 38,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* PRINT STICKER */}
            <div
              id="parkping-qr-sticker"
              style={{
                width: "100%",
                aspectRatio:
                  "100 / 140",
                background:
                  "#ffffff",
                borderRadius: 20,
                padding: "7%",
                boxSizing:
                  "border-box",
                display: "flex",
                flexDirection:
                  "column",
                alignItems:
                  "center",
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
                      "clamp(18px, 4vw, 25px)",
                    fontWeight: 900,
                    letterSpacing:
                      "1.5px",
                  }}
                >
                  PARKPING
                </div>

                <div
                  style={{
                    marginTop: 4,
                    height: 3,
                    width: 55,
                    background:
                      "#111111",
                    marginLeft:
                      "auto",
                    marginRight:
                      "auto",
                    borderRadius: 10,
                  }}
                />
              </div>

              {/* EMERGENCY MESSAGE */}
              <div
                style={{
                  width: "100%",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "clamp(18px, 5vw, 28px)",
                    fontWeight: 900,
                    letterSpacing:
                      ".5px",
                  }}
                >
                  IN CASE OF
                  <br />
                  EMERGENCY
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize:
                      "clamp(11px, 3vw, 15px)",
                    lineHeight: 1.4,
                    color:
                      "#555555",
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
                  background:
                    "#ffffff",
                  padding:
                    "4%",
                  border:
                    "1px solid #e5e5e5",
                  borderRadius: 14,
                  width: "72%",
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
                      "clamp(15px, 4vw, 21px)",
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
                        "clamp(12px, 3vw, 15px)",
                      fontWeight: 700,
                      letterSpacing:
                        "1px",
                      color:
                        "#555555",
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
                    "clamp(9px, 2.5vw, 12px)",
                  color:
                    "#777777",
                  lineHeight: 1.4,
                }}
              >
                Private & secure
                <br />
                No phone number is
                displayed.
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
              >
                📤 Share
              </button>

              <button
                type="button"
                className="btn btn-light"
                disabled={busy}
                onClick={printSticker}
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
