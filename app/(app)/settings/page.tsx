import { CheckCircle2, XCircle, Clock, Mail, MessageSquare, Sheet, Bot, Radio } from "lucide-react";
import { AlertEmailsManager } from "@/components/alert-emails-manager";

export const dynamic = "force-dynamic";

interface IntegrationStatus {
  name: string;
  description: string;
  status: "connected" | "pending" | "not-configured";
  icon: typeof Mail;
}

const integrations: IntegrationStatus[] = [
  {
    name: "Gemini AI",
    description: "Powers the Layla AI assistant for lead qualification",
    status: "pending",
    icon: Bot,
  },
  {
    name: "Brevo Email",
    description: "Sends hot lead email alerts to staff",
    status: "pending",
    icon: Mail,
  },
  {
    name: "Google Sheets",
    description: "Syncs lead data to Google Sheets for reporting",
    status: "not-configured",
    icon: Sheet,
  },
  {
    name: "Chatwoot",
    description: "Live chat handover when AI escalates to human agent",
    status: "not-configured",
    icon: MessageSquare,
  },
  {
    name: "Meta WhatsApp Business",
    description: "WhatsApp Business API for sending/receiving messages",
    status: "pending",
    icon: Radio,
  },
];

const statusStyles = {
  connected: { color: "text-green-600", bg: "bg-green-100", label: "Connected", icon: CheckCircle2 },
  pending: { color: "text-amber-600", bg: "bg-amber-100", label: "Pending", icon: Clock },
  "not-configured": { color: "text-gray-500", bg: "bg-gray-100", label: "Not Configured", icon: XCircle },
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Integration status and platform configuration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          const style = statusStyles[integration.status];
          const StatusIcon = style.icon;
          return (
            <div key={integration.name} className="rounded-xl border border-outline bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary-50 p-2.5">
                    <integration.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">{integration.name}</p>
                    <p className="mt-0.5 text-sm text-on-surface-variant">{integration.description}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 rounded-full ${style.bg} px-3 py-1 text-xs font-medium ${style.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {style.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AlertEmailsManager />

      <div className="rounded-xl border border-outline bg-surface p-5">
        <h2 className="mb-2 font-semibold text-on-surface">Platform Info</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-on-surface-variant">Supabase Project</p>
            <p className="font-medium text-on-surface">gbchhzipbbxpvgtaheze</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Region</p>
            <p className="font-medium text-on-surface">eu-west-3 (Paris)</p>
          </div>
          <div>
            <p className="text-on-surface-variant">n8n URL</p>
            <p className="font-medium text-on-surface">n8n.horizonafrica.co.za</p>
          </div>
          <div>
            <p className="text-on-surface-variant">AI Persona</p>
            <p className="font-medium text-on-surface">Layla</p>
          </div>
        </div>
      </div>
    </div>
  );
}
