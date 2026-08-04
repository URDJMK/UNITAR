import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.match(ask, /streamAI\(\{ action: "ask", question: cleanQuestion \}/);
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
  ]) await access(new URL(path, import.meta.url));
});
