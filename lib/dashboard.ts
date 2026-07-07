import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type StaffRecord = {
  id: string;
  tenant_id: string;
  email: string;
  role: string;
  tenants: {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string | null;
    business_hours: Record<string, unknown> | null;
    deposit_required: boolean | null;
    deposit_amount: number | null;
    auto_booking_enabled: boolean | null;
    reminder_schedule: Record<string, unknown> | null;
  } | null;
};

export async function getDashboardContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Auth user ID:", user?.id);
  console.log("Auth user email:", user?.email);

  if (!user) {
    redirect("/login");
  }

  const { data: staff, error: staffError } = await supabase
    .from("users")
    .select("id, tenant_id, email, role, tenants(id, name, slug, whatsapp_number, business_hours, deposit_required, deposit_amount, auto_booking_enabled, reminder_schedule)")
    .eq("id", user.id)
    .single<StaffRecord>();

  console.log("Staff query result:", staff);
  console.log("Staff query error:", staffError);

  if (staffError) {
    console.error("Staff query error:", staffError);
  }

  // If no staff record, still allow access but with null staff
  // Dashboard will handle empty data gracefully
  return { supabase, user, staff };
}

export const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/conversations", label: "Conversations" },
  { href: "/patients", label: "Patients" },
  { href: "/appointments", label: "Appointments" },
  { href: "/leads", label: "Leads" },
  { href: "/kb", label: "Knowledge Base" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
];
