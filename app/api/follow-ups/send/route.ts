import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendFollowUps } from "@/lib/follow-ups";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let leadId: number | undefined;
  try {
    const body = await request.json();
    leadId = body.lead_id;
  } catch {
    // No body or invalid JSON — send all eligible follow-ups
  }

  const result = await sendFollowUps(leadId);

  return NextResponse.json(result);
}
