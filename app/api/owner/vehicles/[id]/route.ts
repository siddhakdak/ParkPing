import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await requireUser();

    const { id } = await params;

    const body = await req.json();

    const brand =
      typeof body.brand === "string"
        ? body.brand.trim()
        : "";

    const model =
      typeof body.model === "string"
        ? body.model.trim()
        : "";

    const nickname =
      typeof body.nickname === "string"
        ? body.nickname.trim()
        : "";

    const registration_number =
      typeof body.registration_number ===
      "string"
        ? body.registration_number
            .trim()
            .toUpperCase()
        : "";

    const vehicle_type =
      body.vehicle_type === "Bike"
        ? "Bike"
        : "Car";

    const db = createAdminClient();

    /*
     * Update only a vehicle belonging
     * to the currently authenticated owner.
     */
    const { data, error } = await db
      .from("vehicles")
      .update({
        brand,
        model,
        nickname,
        registration_number,
        vehicle_type,
      })
      .eq("id", id)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Vehicle update failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to update vehicle.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      vehicle: data,
    });
  } catch (error: any) {
    console.error(
      "Vehicle PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unauthorized.",
      },
      { status: 401 }
    );
  }
}