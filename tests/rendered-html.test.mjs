import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

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

test("standalone demo includes the complete simulated journey", async () => {
  const html = await readFile(
    new URL("../public/living-voices-demo.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /Not a museum of the past\. A conversation with humanity\./);
  assert.match(html, /data-open-ainu/);
  assert.match(html, /Generate documentary/);
  assert.match(html, /Community-approved story companion/);
  assert.match(html, /Community archive/);
  assert.match(html, /Compare cultures/);
  assert.match(html, /fake|simulat/i);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await access(new URL("../PRD.md", import.meta.url));
  await access(new URL("public/living-voices-demo.html", templateRoot));
});
