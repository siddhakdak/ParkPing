import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .select("id, owner_id, qr_token, is_active")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (error || !vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    if (!vehicle.is_active) {
      return NextResponse.json(
        { error: "QR code is inactive" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const vehicleUrl = `${baseUrl}/v/${vehicle.qr_token}`;

    const png = await QRCode.toBuffer(vehicleUrl, {
      width: 1200,
      margin: 4,
      errorCorrectionLevel: "H",
      type: "png",
    });

    return new NextResponse(png as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="parkping-${vehicle.qr_token}.png"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}