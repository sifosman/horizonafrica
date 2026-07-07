import { createClient } from "@/lib/supabase/server";
import { ConversationView } from "@/components/conversation-view";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const supabase = await createClient();
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Conversations</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          WhatsApp conversation history between leads and the AI assistant
        </p>
      </div>
      <ConversationView conversations={conversations ?? []} />
    </div>
  );
}
