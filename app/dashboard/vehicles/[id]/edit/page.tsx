import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import VehicleEditForm from "./form";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const db = createAdminClient();

  const { data: vehicle, error } = await db
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  return (
    <main
      className="container"
      style={{
        maxWidth: 700,
        padding: "32px 0 70px",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          className="muted"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}
        >
          ParkPing
        </div>

        <h1
          style={{
            margin: "5px 0 7px",
            fontSize: 32,
            letterSpacing: "-.03em",
          }}
        >
          Edit vehicle
        </h1>

        <p className="muted">
          Update your vehicle details below.
        </p>
      </div>

      <VehicleEditForm vehicle={vehicle} />
    </main>
  );
}