import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

async function fetchWorker(path, init) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, init),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Living Voices demo shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Living Voices — A Conversation with Humanity<\/title>/i);
  assert.match(html, /living-voices-demo\.html/);
  assert.match(html, /Living Voices interactive prototype/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("standalone demo includes live AI learning tools and the film demo", async () => {
  const html = await readFile(
    new URL("../public/living-voices-demo.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /Not a museum of the past\. A conversation with humanity\./);
  assert.match(html, /data-open-ainu/);
  assert.match(html, /Replay film demo/);
  assert.match(html, /Live cultural learning guide/);
  assert.match(html, /Claude stream live/);
  assert.match(html, /data-name="Sámi"/);
  assert.match(html, /data-name="Diné"/);
  assert.match(html, /data-ai-action="phrases"/);
  assert.match(html, /data-ai-action="lesson"/);
  assert.match(html, /data-ai-action="compare"/);
  assert.match(html, /data-ai-action="archive"/);
  assert.match(html, /data-auto-question=/);
  assert.match(html, /loadFeaturedWord\(\)/);
  assert.match(html, /runCurrentTool\(\)/);
  assert.match(html, /streamClaude\(/);
  assert.match(html, /renderLearningResponse\(/);
  assert.match(html, /parsePhraseSet\(/);
  assert.match(html, /renderPhraseSetResponse\(/);
  assert.match(html, /rich-phrase-grid/);
  assert.match(html, /renderLoadingState\(/);
  assert.match(html, /ai-loading-orbit/);
  assert.match(html, /hasRenderableStructuredContent\(/);
  assert.match(html, /Living word · Culture · Claude AI/);
  assert.match(html, /"Living word"/);
  assert.match(html, /"Culture"/);
  assert.match(html, /"Explore 10 phrases"/);
  assert.match(html, /"Ask more"/);
  assert.match(html, /living-mini-action/);
  assert.match(html, /data-real-voice/);
  assert.match(html, /id="voice-dialog"/);
  assert.match(html, /Quote from a Real Voice/);
  assert.match(html, /Kimi Kimura/);
  assert.match(html, /kotan kor utar aep uwekarpare pa\./);
  assert.match(html, /The villagers gathered food\./);
  assert.match(html, /Sir James Hēnare/);
  assert.match(html, /Ko te reo te mauri o te mana Māori\./);
  assert.match(html, /will not invent testimony/);
  assert.match(html, /ainu\.ninjal\.ac\.jp\/folklore\/en/);
  assert.match(html, /teara\.govt\.nz\/en\/video\/41077/);
  assert.doesNotMatch(html, /<strong>See Pronunciation<\/strong>/);
  assert.doesNotMatch(html, /<strong>Museum Guide<\/strong>/);
  assert.doesNotMatch(html, /<strong>Story Companion<\/strong>/);
  assert.doesNotMatch(html, /<strong>Documentary<\/strong>/);
  assert.doesNotMatch(html, /<button class="secondary" type="button" data-ai-action="phrases">Explore 10 phrases<\/button>/);
  assert.match(html, /\/api\/living-word/);
  assert.match(html, /renderLivingWordCards\(/);
  assert.match(html, /pauseForLivePaint\(/);
  assert.match(html, /liveTextPieces\(/);
  assert.match(html, /renderTextStream\(/);
  assert.doesNotMatch(html, />Generate (?:phrases|lesson|comparison|documentary)</i);
  assert.match(html, /Community archive/);
  assert.match(html, /Compare cultures/);
  assert.match(html, /fake|simulat/i);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await access(new URL("../PRD.md", import.meta.url));
  await access(new URL("public/living-voices-demo.html", templateRoot));
  await access(new URL("public/og.png", templateRoot));
  await access(new URL("../app/api/living-word/route.ts", import.meta.url));
});

test("AI route reports configuration without exposing credentials", async () => {
  const response = await fetchWorker("/api/ai");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(typeof body.configured, "boolean");
  assert.equal(typeof body.model, "string");
  assert.equal(typeof body.runtime, "string");
  assert.equal(body.streaming, true);
  assert.equal("apiKey" in body, false);
});

test("AI route is implemented as an NDJSON stream", async () => {
  const source = await readFile(new URL("../app/api/ai/route.ts", import.meta.url), "utf8");
  assert.match(source, /application\/x-ndjson/);
  assert.match(source, /PYDANTIC_AGENT_URL/);
  assert.match(source, /stream:\s*true/);
  assert.match(source, /async function proxyPydanticAgent[\s\S]*response\.body\.getReader\(\)/);
});

test("every frontend AI action paints streamed chunks live", async () => {
  const html = await readFile(
    new URL("../public/living-voices-demo.html", import.meta.url),
    "utf8",
  );
  assert.match(
    html,
    /event\.type === "delta"[\s\S]*for \(const piece of liveTextPieces\(event\.text, pieceSize\)\)[\s\S]*renderTextStream\([\s\S]*await pauseForLivePaint/,
  );
  assert.match(
    html,
    /event\.type === "snapshot"[\s\S]*renderLearningResponse\([\s\S]*await pauseForLivePaint/,
  );
  assert.match(html, /streamClaude\(\{ action: "ask", question \}, answer\)/);
  assert.match(html, /streamClaude\(currentToolPayload\(\), aiResult/);
});

test("every direct Claude experience has an explicit format and sample answer", async () => {
  const source = await readFile(new URL("../app/api/ai/route.ts", import.meta.url), "utf8");
  const actions = [
    "ask",
    "word",
    "phrases",
    "lesson",
    "compare",
    "translate",
    "timeline",
    "museum",
    "archive",
  ];

  for (const action of actions) {
    assert.match(
      source,
      new RegExp(action + ": `RESPONSE FORMAT \\(required\\)[\\s\\S]*?SAMPLE ANSWER"),
      `${action} should define a response format and sample`,
    );
    assert.match(
      source,
      new RegExp(`withResponseGuide\\(\\s*["']${action}["']`),
      `${action} should attach its response guide`,
    );
  }
});

test("the direct phrase prompt requires ten parseable cards", async () => {
  const source = await readFile(new URL("../app/api/ai/route.ts", import.meta.url), "utf8");
  assert.match(source, /Create exactly 10 compact beginner items/);
  assert.match(source, /PHRASE 10: See you again/);
  assert.match(source, /VERIFY 2: Check a current language-learning source/);
  assert.doesNotMatch(source, /provide fewer items if you cannot give ten/);
});

test("the live phrase parser turns all ten streamed slots into cards", async () => {
  const html = await readFile(
    new URL("../public/living-voices-demo.html", import.meta.url),
    "utf8",
  );
  const parserStart = html.indexOf("function parsePhraseSet(markdown)");
  const parserEnd = html.indexOf("function renderPhraseSetResponse", parserStart);
  assert.ok(parserStart > -1 && parserEnd > parserStart);

  const slots = Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return [
      `PHRASE ${number}: Phrase ${number}`,
      `PRONUNCIATION ${number}: pronunciation ${number}`,
      `MEANING ${number}: meaning ${number}`,
      `USE ${number}: use ${number}`,
      `CONFIDENCE ${number}: verify`,
    ].join("\n");
  }).join("\n");
  const context = {
    markdown: `TITLE: 10 useful phrases\nLANGUAGE: Test language\nVARIANT: Test variant\nNOTE: Compact note\n${slots}\nVERIFY 1: Check a speaker.`,
  };

  runInNewContext(`${html.slice(parserStart, parserEnd)}\nparsed = parsePhraseSet(markdown);`, context);
  assert.equal(context.parsed.phrases.length, 10);
  assert.equal(context.parsed.phrases[9].original, "Phrase 10");
  assert.equal(context.parsed.verification[0], "Check a speaker.");
});
