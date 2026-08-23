import { NextResponse } from "next/server";

import { getGatewayConfig } from "@/lib/model-gateway";

export const runtime = "nodejs";

/** Reports whether the AI gateway connection is configured without exposing values. */
export async function GET() {
  const configured = getGatewayConfig() !== null;
  return NextResponse.json({
    status: "ok",
    modelConfigured: configured,
  });
}
