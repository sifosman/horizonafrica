import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const META_API_VERSION = process.env.META_API_VERSION ?? "v21.0";
const META_WABA_ID = process.env.META_WABA_ID!;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;

interface MetaTemplate {
  name: string;
  status: string;
  language: string;
  category: string;
  components: Array<{ type: string; text?: string }>;
}

interface MetaTemplatesResponse {
  data: MetaTemplate[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

const LABEL_MAP: Record<string, string> = {
  hello_world: "Hello World (Test)",
  horizon_welcome_v1: "Welcome to Horizon Africa",
  horizon_followup_v5: "Follow-up Enquiry",
};

function formatLabel(name: string): string {
  if (LABEL_MAP[name]) return LABEL_MAP[name];
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(status: string): string {
  return status.toLowerCase();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!META_WABA_ID || !META_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "META_WABA_ID and META_ACCESS_TOKEN must be configured" },
      { status: 500 }
    );
  }

  let body: {
    name?: string;
    language?: string;
    category?: string;
    body_text?: string;
    header_text?: string;
    footer_text?: string;
    body_example?: string[];
    header_example?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, language, category, body_text, header_text, footer_text, body_example, header_example } = body;

  if (!name || !language || !category || !body_text) {
    return NextResponse.json(
      { error: "name, language, category, and body_text are required" },
      { status: 400 }
    );
  }

  const hasBodyParams = /\{\{\d+\}\}/.test(body_text);
  const hasHeaderParams = header_text ? /\{\{\d+\}\}/.test(header_text) : false;

  const bodyComponent: Record<string, unknown> = {
    type: "BODY",
    text: body_text,
  };
  if (hasBodyParams && body_example && body_example.length > 0) {
    bodyComponent.example = {
      body_text: [body_example],
    };
  }

  const components: Array<Record<string, unknown>> = [bodyComponent];

  if (header_text) {
    const headerComponent: Record<string, unknown> = {
      type: "HEADER",
      format: "TEXT",
      text: header_text,
    };
    if (hasHeaderParams && header_example) {
      headerComponent.example = {
        header_text: [header_example],
      };
    }
    components.unshift(headerComponent);
  }

  if (footer_text) {
    components.push({
      type: "FOOTER",
      text: footer_text,
    });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${META_WABA_ID}/message_templates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          language,
          category,
          parameter_format: "positional",
          components,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? `Meta API error: ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json({
      template: {
        name: data.name,
        status: formatStatus(data.status ?? "PENDING"),
        language: data.language,
        category: data.category,
        id: data.id,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit template to Meta" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!META_WABA_ID || !META_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "META_WABA_ID and META_ACCESS_TOKEN must be configured" },
      { status: 500 }
    );
  }

  try {
    const allTemplates: MetaTemplate[] = [];
    let url: string | null =
      `https://graph.facebook.com/${META_API_VERSION}/${META_WABA_ID}/message_templates?fields=name,status,language,category,components&limit=100`;

    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${META_ACCESS_TOKEN}` },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        return NextResponse.json(
          { error: `Meta API error: ${res.status} ${errorBody}` },
          { status: res.status }
        );
      }

      const data: MetaTemplatesResponse = await res.json();
      allTemplates.push(...data.data);

      url = data.paging?.next ?? null;
    }

    const templates = allTemplates
      .map((t) => {
        const bodyComponent = t.components?.find((c) => c.type === "BODY");
        const headerComponent = t.components?.find((c) => c.type === "HEADER");
        const footerComponent = t.components?.find((c) => c.type === "FOOTER");
        return {
          name: t.name,
          label: formatLabel(t.name),
          status: formatStatus(t.status),
          language: t.language,
          category: t.category,
          body_text: bodyComponent?.text ?? null,
          header_text: headerComponent?.text ?? null,
          footer_text: footerComponent?.text ?? null,
        };
      })
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { approved: 0, pending: 1, rejected: 2 };
        const aOrder = statusOrder[a.status] ?? 3;
        const bOrder = statusOrder[b.status] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.label.localeCompare(b.label);
      });

    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch templates from Meta" },
      { status: 500 }
    );
  }
}
