import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { createAIResponseCache, createAIResponseCacheKey } from "../app/lib/ai-cache.js";

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    removeItem(key) { values.delete(key); },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

async function fetchWorker(path = "/", init) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" }, ...init }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("discovery is server-rendered as React without the legacy iframe", async () => {
  const response = await fetchWorker();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Living Voices — A Conversation with Humanity<\/title>/i);
  assert.match(html, /Not a museum of the past\. A conversation with humanity\./);
  assert.match(html, /50 communities/);
  assert.match(html, /href="\/culture\/ainu"/);
  assert.match(html, /href="\/culture\/maasai"/);
  assert.match(html, /href="\/culture\/nubian"/);
  assert.match(html, /class="hero-wave-field"/);
  assert.match(html, /class="hero-wave-line/);
  assert.doesNotMatch(html, /<canvas|TIME \/ ms|AMPLITUDE/);
  assert.doesNotMatch(html, /archive-status|community-index|Complete index/);
  assert.doesNotMatch(html, /<iframe|living-voices-demo\.html/i);
});

test("each experience has a distinct working route", async () => {
  const routes = [
    ["/culture/ainu", /Living culture profile[\s\S]*Ainu[\s\S]*Learn 10 Phrases/],
    ["/culture/ainu/documentary?mode=watch", /AI documentary studio[\s\S]*Turn a story into a doorway/],
    ["/culture/ainu/ask", /Live cultural learning guide[\s\S]*A story that listens back/],
  ];
  for (const [path, pattern] of routes) {
    const response = await fetchWorker(path);
    assert.equal(response.status, 200, `${path} should render`);
    assert.match(await response.text(), pattern);
  }
  assert.equal((await fetchWorker("/culture/not-a-community")).status, 404);
});

test("community data preserves all 50 profiles and testimonies", async () => {
  const source = await readFile(new URL("../app/data/communities.ts", import.meta.url), "utf8");
  assert.equal((source.match(/\n    "name":/g) || []).length, 50);
  assert.equal((source.match(/\n    "slug":/g) || []).length, 50);
  assert.equal((source.match(/\n      "speaker":/g) || []).length, 50);
  assert.equal((source.match(/\n      "localFirst":/g) || []).length, 50);
  assert.equal((source.match(/\n      "localSecond":/g) || []).length, 50);
  for (const culture of ["Ainu", "Sámi", "Māori", "Diné", "Maasai", "Nubian", "Wodaabe", "Yanomami"]) {
    assert.match(source, new RegExp(`"name": "${culture}"`));
  }
  assert.doesNotMatch(source, /A verified original-language excerpt is not yet available/i);
});

test("React profile preserves the existing controls and behavior", async () => {
  const profile = await readFile(new URL("../app/components/CultureProfile.tsx", import.meta.url), "utf8");
  const dialog = await readFile(new URL("../app/components/AIExperienceDialog.tsx", import.meta.url), "utf8");
  const documentary = await readFile(new URL("../app/components/DocumentaryStudio.tsx", import.meta.url), "utf8");
  const ask = await readFile(new URL("../app/components/AskGuide.tsx", import.meta.url), "utf8");

  for (const label of [
    "Watch Story", "Village Testimony", "Learn 10 Phrases", "Translate Text", "Documentary",
    "Ask a Question", "Create a lesson kit", "Community archive", "Compare cultures",
  ]) assert.match(profile, new RegExp(label));
  assert.match(profile, /endpoint: "\/api\/living-word"/);
  assert.match(profile, /className="story-video-dialog"/);
  assert.match(profile, /<video/);
  assert.match(profile, /onClick=\{openStoryVideo\}/);
  assert.doesNotMatch(profile, /href=\{`\/culture\/\$\{community\.slug\}\/documentary\?mode=watch`\}/);
  assert.match(profile, /Explore \{currentYear\} in context/);
  assert.match(profile, /onClick=\{\(\) => setCurrentYear\(year\)\}/);
  assert.match(dialog, /showModal\(\)/);
  assert.match(dialog, /action === "timeline"/);
  assert.match(dialog, /translationTimer/);
  assert.match(documentary, /runDocumentaryDemo = useCallback/);
  assert.match(documentary, /showDocumentaryPreview = useCallback/);
  assert.match(ask, /askQuestion = useCallback\(async \(question: string\)/);
  assert.match(ask, /autoQuestion/);
  assert.doesNotMatch(profile, /See Pronunciation|Museum Guide|Story Companion/);
});

test("all frontend AI experiences consume NDJSON updates live", async () => {
  const renderer = await readFile(new URL("../app/components/AIRenderer.tsx", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/components/CultureProfile.tsx", import.meta.url), "utf8");
  const dialog = await readFile(new URL("../app/components/AIExperienceDialog.tsx", import.meta.url), "utf8");
  const ask = await readFile(new URL("../app/components/AskGuide.tsx", import.meta.url), "utf8");
  assert.match(renderer, /response\.body\.getReader\(\)/);
  assert.match(renderer, /event\.type === "snapshot"/);
  assert.match(renderer, /event\.type === "delta"/);
  assert.match(renderer, /onUpdate\(\{ loading: false, streaming: true, markdown/);
  assert.match(renderer, /function parseCompactWord/);
  assert.match(renderer, /function parsePhraseSet/);
  assert.match(profile, /streamAI\(\{ action: "word" \}/);
  assert.match(dialog, /streamAI\(pendingRequest\.payload, community\.name/);
  assert.match(ask, /streamAI\(\s*\{ action: "ask", question: cleanQuestion \}/);
  assert.ok(
    renderer.indexOf("readCachedAIResponse(cacheRequest)") < renderer.indexOf("const response = await fetch(endpoint"),
    "cached results should be returned before the API request starts",
  );
});

test("AI result cache isolates every community and request variant", () => {
  const base = { scope: "ainu", endpoint: "/api/ai", payload: { action: "timeline", year: "1900" } };
  const keys = [
    createAIResponseCacheKey(base),
    createAIResponseCacheKey({ ...base, scope: "maori" }),
    createAIResponseCacheKey({ ...base, payload: { action: "timeline", year: "1950" } }),
    createAIResponseCacheKey({ ...base, payload: { action: "translate", text: "Hello", targetLanguage: "Korean" } }),
    createAIResponseCacheKey({ ...base, payload: { action: "translate", text: "Hello", targetLanguage: "Japanese" } }),
    createAIResponseCacheKey({ ...base, payload: { action: "lesson", grade: "Elementary school" } }),
    createAIResponseCacheKey({ ...base, payload: { action: "compare", compareCulture: "Sámi" } }),
    createAIResponseCacheKey({ ...base, payload: { action: "ask", question: "What language is spoken?" } }),
  ];
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(
    createAIResponseCacheKey({ ...base, payload: { year: "1900", action: "timeline" } }),
    createAIResponseCacheKey(base),
    "payload property order should not affect the cache key",
  );
});

test("AI result cache restores structured formatting and ignores incomplete responses", () => {
  const storage = createMemoryStorage();
  let timestamp = 100;
  const cache = createAIResponseCache(storage, () => timestamp++);
  const request = { scope: "ainu", endpoint: "/api/ai", payload: { action: "phrases" } };
  const complete = {
    loading: false,
    streaming: false,
    markdown: "",
    data: {
      title: "10 useful phrases",
      featured_word: { original: "Irankarapte", meaning: "Hello" },
      phrases: [{ original: "Iyairaykere", meaning: "Thank you" }],
      cultural_habit: "Guests are welcomed with care.",
    },
    error: "",
  };
  const generation = cache.getGeneration();
  assert.equal(cache.writeResponse(request, complete, generation), true);
  assert.deepEqual(cache.readResponse(request), complete);
  assert.equal(cache.writeResponse(
    { ...request, payload: { action: "timeline", year: "1800" } },
    { ...complete, streaming: true },
    generation,
  ), false);
  assert.equal(cache.writeResponse(
    { ...request, payload: { action: "ask", question: "test" } },
    { ...complete, data: null, error: "Stopped" },
    generation,
  ), false);
});

test("main-page reset clears only Living Voices AI results and blocks stale writes", () => {
  const storage = createMemoryStorage();
  storage.setItem("unrelated-preference", "keep-me");
  const cache = createAIResponseCache(storage, () => 500);
  const generation = cache.getGeneration();
  const state = {
    loading: false,
    streaming: false,
    markdown: "A complete answer",
    data: null,
    error: "",
  };
  const wordRequest = { scope: "ainu", endpoint: "/api/living-word", payload: { action: "word" } };
  assert.equal(cache.writeResponse(wordRequest, state, generation), true);
  assert.equal(cache.writeChat("ainu", [
    { id: 1, role: "user", text: "What should I know?" },
    { id: 2, role: "ai", state },
  ], generation), true);
  cache.clear();
  assert.equal(cache.readResponse(wordRequest), null);
  assert.deepEqual(cache.readChat("ainu"), []);
  assert.equal(cache.writeResponse(wordRequest, state, generation), false, "a cleared in-flight request must not repopulate the cache");
  assert.equal(storage.getItem("unrelated-preference"), "keep-me");
});

test("React routes wire response restoration, chat history, and home reset", async () => {
  const renderer = await readFile(new URL("../app/components/AIRenderer.tsx", import.meta.url), "utf8");
  const profile = await readFile(new URL("../app/components/CultureProfile.tsx", import.meta.url), "utf8");
  const dialog = await readFile(new URL("../app/components/AIExperienceDialog.tsx", import.meta.url), "utf8");
  const ask = await readFile(new URL("../app/components/AskGuide.tsx", import.meta.url), "utf8");
  const discover = await readFile(new URL("../app/components/DiscoverPage.tsx", import.meta.url), "utf8");
  assert.match(renderer, /writeCachedAIResponse\(cacheRequest, finalState, cacheGeneration\)/);
  assert.match(profile, /cacheScope: community\.slug/);
  assert.match(dialog, /cacheScope: community\.slug/);
  assert.match(ask, /readCachedAIChat\(community\.slug\)/);
  assert.match(ask, /writeCachedAIChat\(community\.slug, messages/);
  assert.match(discover, /useEffect\(\(\) => \{\s*clearAIResponseCache\(\);\s*\}, \[\]\)/);
});

test("mobile safeguards remain active for routed components", async () => {
  const css = await readFile(new URL("../app/living-voices.css", import.meta.url), "utf8");
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /@media \(max-height: 500px\) and \(orientation: landscape\)/);
  assert.match(css, /max-height: calc\(100dvh - 16px\)/);
  assert.match(css, /\.culture-card \{[\s\S]*min-height: 104px/);
  assert.match(css, /\.feature-button \{[\s\S]*grid-template-columns: 38px minmax\(0, 1fr\)/);
  assert.match(css, /\.ai-dialog \{[\s\S]*position: fixed;[\s\S]*inset: 0;[\s\S]*margin: auto;/);
  assert.match(css, /\.story-video-dialog \{[\s\S]*position: fixed;[\s\S]*margin: auto;/);
  assert.match(css, /\.hero-wave-field \{[\s\S]*position: absolute/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.hero-wave-field \{[\s\S]*inset: 16px -34% 12px/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.home-hero \.eyebrow \{[\s\S]*margin-inline: auto/);
  assert.doesNotMatch(css, /\.archive-status|\.community-card-head|\.community-focus/);
});

test("homepage uses a decorative mirrored wave field instead of a data chart", async () => {
  const graphic = await readFile(new URL("../app/components/HeroWaveField.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/living-voices.css", import.meta.url), "utf8");
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(packageJson.dependencies["chart.js"], undefined);
  assert.match(graphic, /const lineCount = 34/);
  assert.match(graphic, /<WaveBand \/>/);
  assert.match(graphic, /<WaveBand mirrored \/>/);
  assert.match(graphic, /preserveAspectRatio="none"/);
  assert.doesNotMatch(graphic, /canvas|chart\.js|TIME \/ ms|AMPLITUDE/);
  assert.match(css, /animation: wave-field-breathe 8s ease-in-out infinite alternate/);
  assert.match(css, /@keyframes wave-field-breathe/);
  assert.match(css, /stroke: rgba\(23, 108, 86, \.42\)/);
  assert.doesNotMatch(graphic, /hero-wave-glow/);
  assert.doesNotMatch(css, /radial-gradient\(circle at 50% 44%|radial-gradient\(ellipse at center|\.hero-wave-glow/);
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

test("AI endpoints and their prompt contracts remain unchanged", async () => {
  const source = await readFile(new URL("../app/api/ai/route.ts", import.meta.url), "utf8");
  const livingWord = await readFile(new URL("../app/api/living-word/route.ts", import.meta.url), "utf8");
  assert.match(source, /application\/x-ndjson/);
  assert.match(source, /PYDANTIC_AGENT_URL/);
  assert.match(source, /stream:\s*true/);
  assert.match(livingWord, /handleAIRequest\(request, "word"\)/);
  for (const action of ["ask", "word", "phrases", "lesson", "compare", "translate", "timeline", "museum", "archive"]) {
    assert.match(source, new RegExp(action + ": `RESPONSE FORMAT \\(required\\)[\\s\\S]*?SAMPLE ANSWER"));
    assert.match(source, new RegExp(`withResponseGuide\\(\\s*["']${action}["']`));
  }
  assert.match(source, /Create exactly 10 compact beginner items/);
  assert.match(source, /PHRASE 10: See you again/);
  assert.match(source, /Always provide a usable phrase/);
  assert.doesNotMatch(source, /say "Community verification needed"/);
});

test("expected project assets and route files exist", async () => {
  for (const path of [
    "../PRD.md",
    "../public/og.png",
    "../app/culture/[slug]/page.tsx",
    "../app/culture/[slug]/ask/page.tsx",
    "../app/culture/[slug]/documentary/page.tsx",
    "../app/components/HeroWaveField.tsx",
  ]) await access(new URL(path, import.meta.url));
});
