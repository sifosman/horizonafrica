import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminRecord } = await supabase
    .from("users")
    .select("id, tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!adminRecord || adminRecord.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can invite team members" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, role } = body as { email: string; role: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    );
  }

  const assignedRole = role === "admin" ? "admin" : "staff";
  const tempPassword = generateTempPassword();

  const adminClient = createAdminClient();

  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        invited_by: user.email,
        tenant_id: adminRecord.tenant_id,
        role: assignedRole,
      },
    });

  if (createError) {
    if (createError.message.includes("already been registered")) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: createError.message },
      { status: 400 }
    );
  }

  const { error: linkError } = await adminClient.from("users").insert({
    id: newUser.user.id,
    tenant_id: adminRecord.tenant_id,
    email,
    role: assignedRole,
  });

  if (linkError) {
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json(
      { error: "Failed to link user to clinic. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: newUser.user.id,
      email,
      role: assignedRole,
    },
    tempPassword,
  });
}
