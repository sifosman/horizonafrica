import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "horizon_africa_verify_2026";
const N8N_WEBHOOK_URL = "https://n8n.horizonafrica.co.za/webhook/whatsapp-webhook";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ALERT_EMAIL = "mohamed@owdsolutions.co.za";

async function sendErrorAlert(error: string) {
  if (!BREVO_API_KEY) return;
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: "alerts@horizonafrica.co.za", name: "Horizon Africa Alerts" },
        to: [{ email: ALERT_EMAIL }],
        subject: "URGENT: WhatsApp Webhook Proxy Error",
        htmlContent: `<html><body><h2>WhatsApp Webhook Proxy Error</h2><p>The Vercel webhook proxy failed to forward a Meta webhook event to n8n.</p><p><strong>Error:</strong> ${error}</p><p><strong>Time:</strong> ${new Date().toISOString()}</p><p>This means inbound WhatsApp messages may not be reaching Layla (AI assistant).</p><p>Check: https://n8n.horizonafrica.co.za</p></body></html>`,
      }),
    });
  } catch {
    // Silent fail - don't block the response
  }
}

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
    const contentType = request.headers.get("content-type") || "application/json";

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body,
    });

    if (!response.ok) {
      await sendErrorAlert(`n8n returned HTTP ${response.status} - ${await response.text()}`);
    }

    const responseText = await response.text();
    return new NextResponse(responseText || null, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    await sendErrorAlert(`Failed to reach n8n: ${errorMsg}`);
    return NextResponse.json({ error: "Forwarding failed" }, { status: 502 });
  }
}

export const runtime = "nodejs";
