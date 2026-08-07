import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "horizon_africa_verify_2026";
const N8N_WEBHOOK_URL = "https://n8n.horizonafrica.co.za/webhook/whatsapp-webhook";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    return new NextResponse(null, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Forwarding failed" }, { status: 502 });
  }
}
