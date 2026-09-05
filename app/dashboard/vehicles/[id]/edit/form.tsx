"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VehicleEditForm({
  vehicle,
}: {
  vehicle: any;
}) {
  const router = useRouter();

  const [brand, setBrand] = useState(
    vehicle.brand || ""
  );

  const [model, setModel] = useState(
    vehicle.model || ""
  );

  const [nickname, setNickname] = useState(
    vehicle.nickname || ""
  );

  const [registrationNumber, setRegistrationNumber] =
    useState(
      vehicle.registration_number || ""
    );

  const [vehicleType, setVehicleType] =
    useState(
      vehicle.vehicle_type || "Car"
    );

  const [busy, setBusy] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);

    try {
      const response = await fetch(
        `/api/owner/vehicles/${vehicle.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            brand,
            model,
            nickname,
            registration_number:
              registrationNumber,
            vehicle_type: vehicleType,
          }),
        }
      );

      const result =
        await response.json().catch(
          () => null
        );

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to update vehicle."
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(
        "Vehicle update error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update vehicle."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        padding: 24,
        display: "grid",
        gap: 18,
      }}
    >
      <div>
        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          Vehicle type
        </label>

        <select
          className="field"
          value={vehicleType}
          onChange={(event) =>
            setVehicleType(
              event.target.value
            )
          }
        >
          <option value="Car">
            🚗 Car
          </option>

          <option value="Bike">
            🏍️ Bike
          </option>
        </select>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          Brand
        </label>

        <input
          className="field"
          value={brand}
          onChange={(event) =>
            setBrand(event.target.value)
          }
          placeholder="e.g. Tata"
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          Model
        </label>

        <input
          className="field"
          value={model}
          onChange={(event) =>
            setModel(event.target.value)
          }
          placeholder="e.g. Punch EV"
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          Nickname
        </label>

        <input
          className="field"
          value={nickname}
          onChange={(event) =>
            setNickname(event.target.value)
          }
          placeholder="e.g. My Punch"
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          Registration number
        </label>

        <input
          className="field"
          value={registrationNumber}
          onChange={(event) =>
            setRegistrationNumber(
              event.target.value
            )
          }
          placeholder="e.g. RJ27AB1234"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 5,
        }}
      >
        <button
          type="submit"
          className="btn btn-dark"
          disabled={busy}
          style={{
            minHeight: 44,
            padding: "0 20px",
            fontWeight: 700,
          }}
        >
          {busy
            ? "Saving…"
            : "Save changes"}
        </button>

        <button
          type="button"
          className="btn btn-light"
          disabled={busy}
          onClick={() =>
            router.push("/dashboard")
          }
          style={{
            minHeight: 44,
            padding: "0 20px",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}