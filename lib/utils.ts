/**
 * Extracts plain text from a WhatsApp message or AI response that may be
 * stored as JSON. Handles various WhatsApp Cloud API message formats and
 * AI response objects. Falls back to returning the original string if
 * it's not valid JSON or no text can be extracted.
 */
export function extractMessageText(raw: string | null): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return raw;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return extractFromParsed(parsed) ?? raw;
  } catch {
    return raw;
  }
}

function extractFromParsed(obj: unknown): string | null {
  if (typeof obj === "string") return obj;
  if (!obj || typeof obj !== "object") return null;

  const o = obj as Record<string, unknown>;

  // AI response format: { reply: "...", leadScore: "...", ... }
  if (typeof o.reply === "string") return o.reply;

  // Direct WhatsApp message formats: { type: "text", text: { body: "..." } }
  if (o.text && typeof o.text === "object") {
    const body = (o.text as Record<string, unknown>).body;
    if (typeof body === "string") return body;
  }

  // { body: "..." }
  if (typeof o.body === "string") return o.body;

  // Interactive button/list replies
  if (o.interactive && typeof o.interactive === "object") {
    const interactive = o.interactive as Record<string, unknown>;
    if (interactive.button_reply && typeof interactive.button_reply === "object") {
      const title = (interactive.button_reply as Record<string, unknown>).title;
      if (typeof title === "string") return title;
    }
    if (interactive.list_reply && typeof interactive.list_reply === "object") {
      const title = (interactive.list_reply as Record<string, unknown>).title;
      if (typeof title === "string") return title;
    }
  }

  // Button reply: { button: { text: "..." } }
  if (o.button && typeof o.button === "object") {
    const text = (o.button as Record<string, unknown>).text;
    if (typeof text === "string") return text;
  }

  // Full webhook payload: { messages: [{ ... }] }
  if (Array.isArray(o.messages) && o.messages.length > 0) {
    return extractFromParsed(o.messages[0]);
  }

  // Nested: { message: { ... } }
  if (o.message && typeof o.message === "object") {
    return extractFromParsed(o.message);
  }

  // Entry array (webhook): { entry: [{ changes: [{ value: { messages: [...] } }] }] }
  if (Array.isArray(o.entry)) {
    for (const entry of o.entry) {
      if (entry && typeof entry === "object") {
        const changes = (entry as Record<string, unknown>).changes;
        if (Array.isArray(changes)) {
          for (const change of changes) {
            if (change && typeof change === "object") {
              const value = (change as Record<string, unknown>).value;
              if (value && typeof value === "object") {
                const result = extractFromParsed(value);
                if (result) return result;
              }
            }
          }
        }
      }
    }
  }

  return null;
}
