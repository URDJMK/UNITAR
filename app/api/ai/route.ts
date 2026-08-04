type AiAction =
  | "ask"
  | "word"
  | "phrases"
  | "lesson"
  | "compare"
  | "translate"
  | "timeline"
  | "museum"
  | "archive";

type AiRequest = {
  action?: AiAction;
  culture?: string;
  question?: string;
  grade?: string;
  compareCulture?: string;
  text?: string;
  targetLanguage?: string;
  year?: string;
};

const allowedActions = new Set<AiAction>([
  "ask",
  "word",
  "phrases",
  "lesson",
  "compare",
  "translate",
  "timeline",
  "museum",
  "archive",
]);

const rateLimits = new Map<string, { count: number; resetAt: number }>();
const requestWindowMs = 10 * 60 * 1000;
const requestsPerWindow = 24;

const systemPrompt = `You are the Living Voices learning guide. You help people approach living cultures and languages with curiosity, humility, and respect.

Rules:
- You are an AI learning aid, not a community member, elder, cultural authority, or primary source.
- Never invent quotations, ceremonies, sacred knowledge, private practices, or claims of community consensus.
- Say clearly when facts, spellings, pronunciation, translations, or language status may vary or need verification.
- Use the community's preferred name when known. Do not call every Indigenous people a "tribe."
- Do not rank cultures or flatten meaningful differences.
- For language examples, name the language or variant and provide fewer items if you cannot give ten confidently.
- Encourage verification with community-led organizations, educators, and primary sources.
- Format the answer with short Markdown headings, paragraphs, and lists. Never use a Markdown table.
- Keep the answer useful, warm, concise, and visually scannable.`;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getClientId(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

function isRateLimited(request: Request) {
  const now = Date.now();
  const clientId = getClientId(request);
  const current = rateLimits.get(clientId);

  if (!current || current.resetAt <= now) {
    rateLimits.set(clientId, { count: 1, resetAt: now + requestWindowMs });
    return false;
  }

  current.count += 1;
  return current.count > requestsPerWindow;
}

function buildPrompt(payload: AiRequest) {
  const culture = clean(payload.culture, 80) || "the selected community";

  switch (payload.action) {
    case "ask": {
      const question = clean(payload.question, 1200);
      if (!question) throw new Error("Please enter a question.");
      return `Culture or community: ${culture}\nLearner question: ${question}\n\nAnswer with a concise title, two to four short sections, and a final **Verify this** list.`;
    }
    case "word":
      return `Offer one well-attested everyday word or short expression connected to ${culture}. Name the specific language and variant. Use headings for the word, pronunciation, meaning, usage, and verification. If no single language represents the whole community or you cannot choose confidently, explain that instead of guessing.`;
    case "phrases":
      return `Create a beginner learning set of up to 10 everyday phrases connected to ${culture}. Identify the specific language and variant first. For every phrase include the original writing, a careful romanization or pronunciation guide when appropriate, an English meaning, and a one-line usage note. Use a numbered list with bold phrase titles. Do not fabricate to reach ten; explain when fewer can be given confidently. End with a **Verify this** section.`;
    case "lesson": {
      const grade = clean(payload.grade, 40) || "middle school";
      return `Create a 35-minute, age-appropriate lesson kit about ${culture} for ${grade}. Use headings and lists for learning objectives, a respectful opening activity, three key ideas, one source-evaluation exercise, five quiz questions with answers, and a closing reflection. Avoid role-playing sacred practices or speaking on behalf of the community. Clearly mark facts that need community review.`;
    }
    case "compare": {
      const compareCulture = clean(payload.compareCulture, 80);
      if (!compareCulture) throw new Error("Choose a second culture to compare.");
      return `Create a respectful introductory comparison of ${culture} and ${compareCulture}. Use short sections for living context today, language, relationships to place, arts or storytelling, shared themes, important differences, and what should be verified. Avoid claims of equivalence, ancestry, or cultural borrowing without strong evidence.`;
    }
    case "translate": {
      const text = clean(payload.text, 3000);
      const targetLanguage = clean(payload.targetLanguage, 60) || "English";
      if (!text) throw new Error("Enter text to translate.");
      return `Translate the following text into ${targetLanguage}, using cultural context related to ${culture} only when relevant. Put the translation first, then use short sections for tone and ambiguity. If the requested language or variant is uncertain, say so rather than guessing.\n\nText:\n${text}`;
    }
    case "timeline": {
      const year = clean(payload.year, 12);
      if (!year) throw new Error("Choose a timeline year.");
      return `Give a concise historical context note for ${culture} around ${year}. Use sections for broader context, community continuity, what changed, and what needs verification. Avoid presenting a single date as representative of every person or place.`;
    }
    case "museum":
      return `Write a short, responsible museum-audio-guide introduction to ${culture}. Use sections to explain how visitors should approach objects, archives, and reconstructions; distinguish community knowledge from museum interpretation; and list three questions about provenance, consent, and present-day community life.`;
    case "archive":
      return `Create a concise, practical contribution and consent checklist for a community archive connected to ${culture}. Use headings and checklists for contributor authority, attribution, public visibility, culturally restricted access, AI-training permission as a separate choice, permitted reuse, review, withdrawal, and ongoing community governance. Make clear that this is a draft for community and legal review.`;
    default:
      throw new Error("Choose a supported AI experience.");
  }
}

function streamHeaders() {
  return {
    "cache-control": "no-store, no-transform",
    "content-type": "application/x-ndjson; charset=utf-8",
    "x-accel-buffering": "no",
  };
}

function packet(type: string, payload: Record<string, unknown> = {}) {
  return `${JSON.stringify({ type, ...payload })}\n`;
}

function errorMessage(status: number, fallback?: string) {
  if (status === 401) return "The Anthropic API key was rejected. Check or rotate the server key.";
  if (status === 429) return "Anthropic is rate-limiting requests right now. Please try again shortly.";
  return fallback || "The live guide could not answer this request.";
}

async function proxyPydanticAgent(payload: AiRequest, agentUrl: string) {
  const response = await fetch(`${agentUrl.replace(/\/$/, "")}/stream`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.PYDANTIC_AGENT_SECRET
        ? { "x-agent-secret": process.env.PYDANTIC_AGENT_SECRET }
        : {}),
    },
    body: JSON.stringify({
      ...payload,
      culture: clean(payload.culture, 80) || "the selected community",
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok || !response.body) {
    let detail = "PydanticAI could not answer this request.";
    try {
      const data = (await response.json()) as { detail?: string };
      detail = data.detail || detail;
    } catch {
      // Keep the human-readable fallback.
    }
    return new Response(packet("error", { error: detail }), {
      status: response.status || 502,
      headers: streamHeaders(),
    });
  }

  return new Response(response.body, { headers: streamHeaders() });
}

async function streamAnthropic(payload: AiRequest, apiKey: string) {
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: payload.action === "phrases" || payload.action === "lesson" ? 1800 : 1200,
      thinking: { type: "disabled" },
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: buildPrompt(payload) }],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok || !response.body) {
    let message = "Claude could not answer this request.";
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      message = data.error?.message || message;
    } catch {
      // Keep the human-readable fallback.
    }
    return new Response(packet("error", { error: errorMessage(response.status, message) }), {
      status: response.status || 502,
      headers: streamHeaders(),
    });
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(packet("meta", { runtime: "anthropic-direct", model })));
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;
            const event = JSON.parse(raw) as {
              type?: string;
              delta?: { type?: string; text?: string };
              error?: { message?: string };
            };
            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              controller.enqueue(encoder.encode(packet("delta", { text: event.delta.text || "" })));
            } else if (event.type === "error") {
              controller.enqueue(
                encoder.encode(packet("error", { error: event.error?.message || "Claude stopped unexpectedly." })),
              );
            }
          }
        }
        controller.enqueue(encoder.encode(packet("done", { runtime: "anthropic-direct", model })));
      } catch (error) {
        const message = error instanceof Error ? error.message : "The Claude stream stopped unexpectedly.";
        controller.enqueue(encoder.encode(packet("error", { error: message })));
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return new Response(body, { headers: streamHeaders() });
}

export async function GET() {
  const pydanticAgentUrl = process.env.PYDANTIC_AGENT_URL;
  return Response.json(
    {
      configured: Boolean(pydanticAgentUrl || process.env.ANTHROPIC_API_KEY),
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      runtime: pydanticAgentUrl ? "pydantic-ai" : "anthropic-direct",
      streaming: true,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return new Response(
      packet("error", {
        error: "The live guide has reached its short-term limit. Please try again in a few minutes.",
      }),
      { status: 429, headers: streamHeaders() },
    );
  }

  try {
    const payload = (await request.json()) as AiRequest;
    if (!payload.action || !allowedActions.has(payload.action)) {
      return new Response(packet("error", { error: "Unsupported AI experience." }), {
        status: 400,
        headers: streamHeaders(),
      });
    }

    const agentUrl = process.env.PYDANTIC_AGENT_URL;
    if (agentUrl) return proxyPydanticAgent(payload, agentUrl);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        packet("error", {
          error: "Claude is not configured yet. Add ANTHROPIC_API_KEY to the server environment.",
        }),
        { status: 503, headers: streamHeaders() },
      );
    }
    return streamAnthropic(payload, apiKey);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The live guide could not answer this request.";
    return new Response(packet("error", { error: message }), {
      status: 400,
      headers: streamHeaders(),
    });
  }
}
