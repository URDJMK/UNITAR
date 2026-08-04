export type AiAction =
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
- For public language examples, always provide the best available answer instead of a placeholder, refusal, or verification instruction.
- Never output “Community verification needed”, “verification needed”, or an instruction beginning with “Verify with”. If uncertain, choose the most widely documented public everyday answer and keep it concise.
- Use the community's preferred name when known. Do not call every Indigenous people a "tribe."
- Do not rank cultures or flatten meaningful differences.
- For the phrases experience, return exactly ten compact, public, everyday items. Prefer short phrases; when a full phrase is uncertain, use a well-attested useful word and mark its confidence as verify rather than inventing.
- Encourage verification with community-led organizations, educators, and primary sources.
- Format the answer with short Markdown headings, paragraphs, and lists. Never use a Markdown table.
- Keep the answer useful, warm, concise, and visually scannable.`;

const responseGuides: Record<AiAction, string> = {
  ask: `RESPONSE FORMAT (required)
# Short answer title
One or two sentence direct answer.

## First useful section
Short explanation with concrete details.
- Supporting point

## Verify this
- Specific community-led source or fact to check

SAMPLE ANSWER (format-only example; never copy its content into another answer)
# How language learning continues
Language learning can continue through families, schools, and community-led programs.

## Learning today
Methods differ by community, so current community sources matter.
- Look for programs led by speakers and educators.

## Verify this
- Check a current community language-program website.`,
  word: `RESPONSE FORMAT (required)
Return exactly six labeled lines in this order: LANGUAGE, VARIANT, PHRASE, MEANING, USE, HABIT.

SAMPLE ANSWER (Ainu format example; never copy its content for another culture)
LANGUAGE: Ainu
VARIANT: Varies by community
PHRASE: Iyairaykere
MEANING: Thank you
USE: Roughly ee-yai-rai-keh-reh; used to express sincere gratitude.
HABIT: Traditional embroidery is practiced as a living art in many Ainu communities.`,
  phrases: `RESPONSE FORMAT (required)
Return exactly these labeled lines in this order. Do not use Markdown, headings, bullets, blank commentary, or extra fields. Fill all ten phrase slots.

TITLE: 10 useful [language] phrases
LANGUAGE: Specific language name
VARIANT: Specific variant in 12 words or fewer, or Varies by community
NOTE: One useful learning note in 24 words or fewer
PHRASE 1: Phrase in original writing
PRONUNCIATION 1: Short guide
MEANING 1: Short English meaning
USE 1: One-line everyday context
PHRASE 2: Phrase in original writing
PRONUNCIATION 2: Short guide
MEANING 2: Short English meaning
USE 2: One-line everyday context
Continue the same four labeled lines for PHRASE 3 through PHRASE 10.

SAMPLE ANSWER (complete English format example; copy all ten slots, never copy its content)
TITLE: 10 useful English phrases
LANGUAGE: English
VARIANT: General international English
NOTE: Ten compact everyday examples in the required card format.
PHRASE 1: Hello
PRONUNCIATION 1: heh-LOH
MEANING 1: A greeting
USE 1: Use when greeting someone.
PHRASE 2: Good morning
PRONUNCIATION 2: good MOR-ning
MEANING 2: A morning greeting
USE 2: Use earlier in the day.
PHRASE 3: Thank you
PRONUNCIATION 3: thank yoo
MEANING 3: An expression of gratitude
USE 3: Use after receiving help.
PHRASE 4: Please
PRONUNCIATION 4: pleez
MEANING 4: A polite request marker
USE 4: Use when making a request.
PHRASE 5: Excuse me
PRONUNCIATION 5: ik-SKYOOZ mee
MEANING 5: A polite way to get attention
USE 5: Use before interrupting.
PHRASE 6: How are you?
PRONUNCIATION 6: how ar yoo
MEANING 6: A wellbeing question
USE 6: Use in a friendly greeting.
PHRASE 7: I am well
PRONUNCIATION 7: eye am well
MEANING 7: A positive reply
USE 7: Use when answering a wellbeing question.
PHRASE 8: What is your name?
PRONUNCIATION 8: what iz yor naym
MEANING 8: A question about someone's name
USE 8: Use during an introduction.
PHRASE 9: Goodbye
PRONUNCIATION 9: good-BYE
MEANING 9: A farewell
USE 9: Use when leaving.
PHRASE 10: See you again
PRONUNCIATION 10: see yoo uh-GEN
MEANING 10: A future-facing farewell
USE 10: Use when you expect to meet again.`,
  lesson: `RESPONSE FORMAT (required)
# 35-minute lesson title
One-sentence lesson overview.

## Learning objectives
- Observable objective

## Opening · 5 minutes
Short activity instructions.

## Three key ideas
1. Key idea with context

## Source evaluation · 10 minutes
Classroom-ready exercise.

## Quiz and answers
1. Question
   - Answer: concise answer

## Reflection
One closing prompt.

## Verify this
- Source teachers and learners should review

SAMPLE ANSWER (format-only lesson excerpt; still include every required section)
# Learning from living voices
Students practice distinguishing community sources from outside interpretation.

## Learning objectives
- Identify who created a source and whose perspective it represents.

## Reflection
Name one question that still needs community verification.`,
  compare: `RESPONSE FORMAT (required)
# Respectful comparison title
One shared theme plus an important limit on the comparison.

## Living context today
Describe each community on its own terms.

## Language and place
- First community: specific point
- Second community: specific point

## Shared themes
Careful comparison.

## Important differences
Differences without ranking.

## Verify this
- One community-led source for each community

SAMPLE ANSWER (format-only comparison excerpt; never reuse as factual content)
# Two distinct living communities
A shared theme can support learning, but it does not make two cultures equivalent.

## Important differences
Name the specific place, language, and source behind each point.

## Verify this
- Check one current community-led source for each community.`,
  translate: `RESPONSE FORMAT (required)
# Translation into [target language]
[Put only the translated text here first.]

## Tone
One short note about register.

## Ambiguity or variant
One short note, or say there is no material ambiguity.

## Verify this
- State what a fluent speaker should confirm

SAMPLE ANSWER (format-only; brackets show where the real translation belongs)
# Translation into the requested language
[Translated text appears here first.]

## Tone
This wording aims for a warm, everyday tone.

## Ambiguity or variant
A fluent speaker should confirm the local variant.

## Verify this
- Review meaning, tone, and variant with a fluent speaker.`,
  timeline: `RESPONSE FORMAT (required)
# Community around [year]
Two-sentence historical context that does not freeze the community in the past.

## Broader context
Short dated context.

## Community continuity
What people maintained and adapted.

## What changed
Specific changes with careful scope.

## Verify this
- Archive or community history source to consult

SAMPLE ANSWER (format-only timeline excerpt; never reuse as factual content)
# A community in historical context
A date is one viewpoint into a continuing community, not a complete portrait.

## Community continuity
Connect the historical moment to present-day community life.

## Verify this
- Compare community histories with the relevant archival record.`,
  museum: `RESPONSE FORMAT (required)
# Audio-guide introduction
A short visitor-facing invitation.

## Approach the objects
Responsible viewing guidance.

## Community knowledge and museum interpretation
Clearly distinguish the two.

## Questions to carry
- Who authorized its collection and display?
- What is known about provenance and consent?
- How does the community describe it today?

## Verify this
- Museum or community information to check

SAMPLE ANSWER (format-only audio-guide excerpt; never reuse as factual content)
# Begin with the people, not the object
Treat the display as one interpretation and look for the living community voices connected to it.

## Questions to carry
- Who authorized its collection and display?
- How does the community describe it today?`,
  archive: `RESPONSE FORMAT (required)
# Contribution and consent checklist
State that this is a draft for community and legal review.

## Contributor authority
- ☐ Actionable consent check

## Attribution and visibility
- ☐ Actionable consent check

## Restricted access and reuse
- ☐ Actionable consent check

## AI-training permission
- ☐ Yes
- ☐ No
- ☐ Revisit later

## Review, withdrawal, and governance
- ☐ Actionable consent check

## Verify this
- Community and legal review step

SAMPLE ANSWER (format-only checklist excerpt; expand every required section)
# Community archive consent checklist
This draft separates public access, reuse, and AI-training permission for community and legal review.

## Contributor authority
- ☐ Record who owns or stewards the item.
- ☐ Record any culturally restricted access.

## AI-training permission
- ☐ Yes
- ☐ No
- ☐ Revisit later`,
};

function withResponseGuide(action: AiAction, prompt: string) {
  return `${prompt}\n\n${responseGuides[action]}\n\nNow answer the learner's request using that format. Do not repeat the labels “RESPONSE FORMAT” or “SAMPLE ANSWER”.`;
}

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
      return withResponseGuide(
        "ask",
        `Culture or community: ${culture}\nLearner question: ${question}\n\nAnswer with a concise title, two to four short sections, and a final **Verify this** list.`,
      );
    }
    case "word":
      return withResponseGuide("word", `Create the compact Living Word card for ${culture}. Return exactly these six labeled lines and nothing else:
LANGUAGE: The specific language name.
VARIANT: The specific regional variant in five words or fewer, or "Varies by community".
PHRASE: One well-attested, useful everyday phrase in the original writing.
MEANING: Its short English meaning.
USE: A pronunciation hint or usage note in twelve words or fewer.
HABIT: One public, everyday cultural habit or custom in one short sentence. Never use a sacred, private, ceremonial, or stereotyped example.

Always provide a usable phrase. Choose the most widely documented public everyday option when sources vary. Never return a placeholder, refusal, uncertainty warning, verification request, or caveat in any field. Do not add an introduction, history, sources, headings, bullets, or explanation.`);
    case "phrases":
      return withResponseGuide(
        "phrases",
        `Create exactly 10 compact beginner items connected to ${culture}. Prefer public, everyday phrases; if a full phrase is uncertain, use a well-attested useful word instead of stopping early or inventing. Fill every numbered slot from 1 through 10. Keep NOTE under 24 words, VARIANT under 12 words, and every item field to one short line. Do not add confidence levels, disclaimers, history, an introduction, or commentary.`,
      );
    case "lesson": {
      const grade = clean(payload.grade, 40) || "middle school";
      return withResponseGuide(
        "lesson",
        `Create a 35-minute, age-appropriate lesson kit about ${culture} for ${grade}. Use headings and lists for learning objectives, a respectful opening activity, three key ideas, one source-evaluation exercise, five quiz questions with answers, and a closing reflection. Avoid role-playing sacred practices or speaking on behalf of the community. Clearly mark facts that need community review.`,
      );
    }
    case "compare": {
      const compareCulture = clean(payload.compareCulture, 80);
      if (!compareCulture) throw new Error("Choose a second culture to compare.");
      return withResponseGuide(
        "compare",
        `Create a respectful introductory comparison of ${culture} and ${compareCulture}. Use short sections for living context today, language, relationships to place, arts or storytelling, shared themes, important differences, and what should be verified. Avoid claims of equivalence, ancestry, or cultural borrowing without strong evidence.`,
      );
    }
    case "translate": {
      const text = clean(payload.text, 3000);
      const targetLanguage = clean(payload.targetLanguage, 60) || "English";
      if (!text) throw new Error("Enter text to translate.");
      return withResponseGuide(
        "translate",
        `Translate the following text into ${targetLanguage}, using cultural context related to ${culture} only when relevant. Put the translation first, then use short sections for tone and ambiguity. If the requested language or variant is uncertain, say so rather than guessing.\n\nText:\n${text}`,
      );
    }
    case "timeline": {
      const year = clean(payload.year, 12);
      if (!year) throw new Error("Choose a timeline year.");
      return withResponseGuide(
        "timeline",
        `Give a concise historical context note for ${culture} around ${year}. Use sections for broader context, community continuity, what changed, and what needs verification. Avoid presenting a single date as representative of every person or place.`,
      );
    }
    case "museum":
      return withResponseGuide(
        "museum",
        `Write a short, responsible museum-audio-guide introduction to ${culture}. Use sections to explain how visitors should approach objects, archives, and reconstructions; distinguish community knowledge from museum interpretation; and list three questions about provenance, consent, and present-day community life.`,
      );
    case "archive":
      return withResponseGuide(
        "archive",
        `Create a concise, practical contribution and consent checklist for a community archive connected to ${culture}. Use headings and checklists for contributor authority, attribution, public visibility, culturally restricted access, AI-training permission as a separate choice, permitted reuse, review, withdrawal, and ongoing community governance. Make clear that this is a draft for community and legal review.`,
      );
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

  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "The PydanticAI stream stopped unexpectedly.";
        controller.enqueue(new TextEncoder().encode(packet("error", { error: message })));
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

async function streamAnthropic(payload: AiRequest, apiKey: string) {
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens:
        payload.action === "phrases" || payload.action === "lesson"
          ? 1800
          : payload.action === "word"
            ? 260
            : 1200,
      thinking: { type: "disabled" },
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: buildPrompt(payload) }],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok || !response.body) {
    let message = "AI could not answer this request.";
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
                encoder.encode(packet("error", { error: event.error?.message || "AI stopped unexpectedly." })),
              );
            }
          }
        }
        controller.enqueue(encoder.encode(packet("done", { runtime: "anthropic-direct", model })));
      } catch (error) {
        const message = error instanceof Error ? error.message : "The AI stream stopped unexpectedly.";
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
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      runtime: pydanticAgentUrl ? "pydantic-ai" : "anthropic-direct",
      streaming: true,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function handleAIRequest(request: Request, forcedAction?: AiAction) {
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
    if (forcedAction) payload.action = forcedAction;
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
          error: "AI is not configured yet. Add the API key to the server environment.",
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

export async function POST(request: Request) {
  return handleAIRequest(request);
}
