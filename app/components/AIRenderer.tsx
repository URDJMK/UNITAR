"use client";

import { Fragment, ReactNode } from "react";
import {
  getAIResponseCacheGeneration,
  readCachedAIResponse,
  writeCachedAIResponse,
} from "../lib/ai-cache";

export type AIAction =
  | "ask"
  | "word"
  | "phrases"
  | "lesson"
  | "compare"
  | "translate"
  | "timeline"
  | "museum"
  | "archive";

export type AIPayload = {
  action: AIAction;
  question?: string;
  grade?: string;
  compareCulture?: string;
  text?: string;
  targetLanguage?: string;
  year?: string;
};

export interface PhraseCard {
  original?: string;
  pronunciation?: string;
  meaning?: string;
  usage?: string;
}

export interface LearningResponse {
  title?: string;
  summary?: string;
  language?: string;
  variant?: string;
  featured_word?: PhraseCard | null;
  phrases?: PhraseCard[];
  sections?: Array<{ heading?: string; body?: string; bullets?: string[] }>;
  cultural_habit?: string;
}

export interface AIStreamState {
  loading: boolean;
  streaming: boolean;
  markdown: string;
  data: LearningResponse | null;
  error: string;
}

export const emptyAIStream: AIStreamState = {
  loading: false,
  streaming: false,
  markdown: "",
  data: null,
  error: "",
};

export function sanitizeAIText(value: unknown) {
  const raw = String(value || "");
  const compact = raw.trim().toLowerCase();
  const blockedPlaceholders = ["community verification needed", "verification needed"];
  if (compact && blockedPlaceholders.some((placeholder) => placeholder.startsWith(compact))) return "";
  return raw
    .replace(/(?:community\s+)?verification\s+(?:is\s+)?needed[.!]?/gi, "")
    .replace(/(?:please\s+)?verify\s+with\b[^.\n]*(?:\.|$)/gi, "")
    .replace(/\b(?:needs?|requires?)\s+(?:community\s+)?verification\b[^.\n]*(?:\.|$)/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function sanitizeAIData(value: LearningResponse): LearningResponse {
  const cleanPhrase = (phrase?: PhraseCard | null) => phrase
    ? {
        original: sanitizeAIText(phrase.original),
        pronunciation: sanitizeAIText(phrase.pronunciation),
        meaning: sanitizeAIText(phrase.meaning),
        usage: sanitizeAIText(phrase.usage),
      }
    : null;
  return {
    title: sanitizeAIText(value.title),
    summary: sanitizeAIText(value.summary),
    language: sanitizeAIText(value.language),
    variant: sanitizeAIText(value.variant),
    featured_word: cleanPhrase(value.featured_word),
    phrases: value.phrases?.map((phrase) => cleanPhrase(phrase) || {}),
    sections: value.sections?.map((section) => ({
      heading: sanitizeAIText(section.heading),
      body: sanitizeAIText(section.body),
      bullets: section.bullets?.map(sanitizeAIText).filter(Boolean),
    })),
    cultural_habit: sanitizeAIText(value.cultural_habit),
  };
}

export function parseCompactWord(markdown: string): LearningResponse {
  const fields: Record<string, string> = {};
  markdown.split(/\r?\n/).forEach((line) => {
    const match = line.trim().match(/^(HABIT|LANGUAGE|VARIANT|PHRASE|MEANING|USE):\s*(.*)$/i);
    if (match) fields[match[1].toLowerCase()] = sanitizeAIText(match[2]);
  });
  return {
    cultural_habit: fields.habit || "",
    language: fields.language || "",
    variant: fields.variant || "",
    featured_word: {
      original: fields.phrase || "",
      meaning: fields.meaning || "",
      usage: fields.use || "",
    },
  };
}

export function parsePhraseSet(markdown: string): LearningResponse {
  const metadata: Record<string, string> = {};
  const phraseFields = new Map<number, PhraseCard>();
  markdown.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    const metaMatch = trimmed.match(/^(TITLE|LANGUAGE|VARIANT|NOTE):\s*(.*)$/i);
    if (metaMatch) {
      metadata[metaMatch[1].toLowerCase()] = sanitizeAIText(metaMatch[2]);
      return;
    }
    const phraseMatch = trimmed.match(/^(PHRASE|PRONUNCIATION|MEANING|USE|CONFIDENCE)\s+(\d{1,2}):\s*(.*)$/i);
    if (!phraseMatch) return;
    const index = Number(phraseMatch[2]);
    if (index < 1 || index > 10) return;
    const fields = phraseFields.get(index) || {};
    const key = phraseMatch[1].toLowerCase() === "phrase" ? "original" : phraseMatch[1].toLowerCase();
    if (key !== "confidence") fields[key as keyof PhraseCard] = sanitizeAIText(phraseMatch[3]);
    phraseFields.set(index, fields);
  });
  return {
    title: metadata.title || "10 useful phrases",
    summary: metadata.note || "",
    language: metadata.language || "",
    variant: metadata.variant || "",
    phrases: [...phraseFields.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, phrase]) => phrase)
      .filter((phrase) => phrase.original),
  };
}

function hasRenderableStructuredContent(data: LearningResponse | null, action: AIAction) {
  if (!data) return false;
  if (action === "word") return Boolean(data.featured_word?.original || data.cultural_habit);
  return Boolean(
    data.title || data.summary || data.language || data.variant || data.featured_word ||
    data.phrases?.length || data.sections?.length,
  );
}

export async function streamAI(
  payload: AIPayload,
  culture: string,
  onUpdate: (state: AIStreamState) => void,
  options: { endpoint?: string; signal?: AbortSignal; cacheScope?: string } = {},
) {
  const endpoint = options.endpoint || "/api/ai";
  const cacheRequest = { scope: options.cacheScope || culture, endpoint, payload };
  const cacheGeneration = getAIResponseCacheGeneration();
  const cached = readCachedAIResponse(cacheRequest) as AIStreamState | null;
  if (cached) {
    onUpdate(cached);
    return;
  }

  let markdown = "";
  let latestStructured: LearningResponse | null = null;
  let streamError = "";
  onUpdate({ ...emptyAIStream, loading: true, streaming: true });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ culture, ...payload }),
    signal: options.signal,
  });
  if (!response.body) throw new Error("The live guide returned no stream.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as {
        type?: string;
        text?: string;
        data?: LearningResponse;
        error?: string;
      };
      if (event.type === "snapshot" && event.data) {
        latestStructured = sanitizeAIData(event.data);
        if (hasRenderableStructuredContent(latestStructured, payload.action)) {
          onUpdate({ loading: false, streaming: true, markdown, data: latestStructured, error: "" });
        }
      } else if (event.type === "delta") {
        markdown += event.text || "";
        onUpdate({ loading: false, streaming: true, markdown, data: null, error: "" });
      } else if (event.type === "done") {
        if (event.data) latestStructured = sanitizeAIData(event.data);
      } else if (event.type === "error") {
        streamError = event.error || "The live guide stopped unexpectedly.";
      }
    }
  }

  if (streamError) throw new Error(streamError);
  if (!response.ok) throw new Error("The live guide could not answer this request.");
  if (!latestStructured && !markdown) throw new Error("The live guide returned an empty response.");
  const finalState = { loading: false, streaming: false, markdown, data: latestStructured, error: "" };
  writeCachedAIResponse(cacheRequest, finalState, cacheGeneration);
  onUpdate(finalState);
}

function LoadingState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="ai-loading-shell" role="status" aria-label={title}>
      <div className="ai-loading-orbit" aria-hidden="true"><span className="ai-loading-core" /></div>
      <div className="ai-loading-copy">
        <strong>{title}</strong>
        <span>{detail} <span className="ai-loading-dots" aria-hidden="true"><span>·</span><span>·</span><span>·</span></span></span>
      </div>
      <div className="ai-loading-bars" aria-hidden="true"><span className="ai-loading-bar" /><span className="ai-loading-bar" /></div>
    </div>
  );
}

function InlineText({ children }: { children: string }) {
  const parts = sanitizeAIText(children).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : <Fragment key={index}>{part}</Fragment>);
}

function Phrase({ phrase, index, featured = false }: { phrase: PhraseCard; index: number; featured?: boolean }) {
  return (
    <article className={featured ? "featured-word" : "phrase-card"}>
      {!featured && <span className="phrase-number">Phrase {index + 1}</span>}
      {phrase.original && <strong className={featured ? "featured-original" : "phrase-original"}>{phrase.original}</strong>}
      {phrase.pronunciation && <span className={featured ? "featured-pronunciation" : "phrase-pronunciation"}>{phrase.pronunciation}</span>}
      {phrase.meaning && <span className="phrase-meaning">{phrase.meaning}</span>}
      {phrase.usage && <span className="phrase-usage">{phrase.usage}</span>}
    </article>
  );
}

function StructuredResponse({ data }: { data: LearningResponse }) {
  const clean = sanitizeAIData(data);
  return (
    <div className="rich-response">
      {(clean.title || clean.summary) && <header className="rich-header">
        {clean.title && <h2 className="rich-title">{clean.title}</h2>}
        {clean.summary && <p className="rich-summary">{clean.summary}</p>}
      </header>}
      {(clean.language || clean.variant) && <div className="rich-meta">
        {clean.language && <span className="rich-pill">{clean.language}</span>}
        {clean.variant && <span className="rich-pill">{clean.variant}</span>}
      </div>}
      {clean.featured_word && <Phrase phrase={clean.featured_word} index={0} featured />}
      {!!clean.phrases?.length && <div className="rich-phrase-grid">
        {clean.phrases.map((phrase, index) => <Phrase phrase={phrase} index={index} key={`${index}-${phrase.original}`} />)}
      </div>}
      {!!clean.sections?.length && <div className="rich-section-grid">
        {clean.sections.map((section, index) => <section className="response-section" key={`${index}-${section.heading}`}>
          {section.heading && <h3>{section.heading}</h3>}
          {section.body && <p><InlineText>{section.body}</InlineText></p>}
          {!!section.bullets?.length && <ul>{section.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}><InlineText>{bullet}</InlineText></li>)}</ul>}
        </section>)}
      </div>}
    </div>
  );
}

function MarkdownResponse({ markdown }: { markdown: string }) {
  const nodes: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let suppressSection = false;
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    nodes.push(<Tag key={`list-${nodes.length}`}>{list.items.map((item, index) => <li key={index}><InlineText>{item}</InlineText></li>)}</Tag>);
    list = null;
  };

  markdown.split(/\r?\n/).forEach((line) => {
    const trimmed = sanitizeAIText(line);
    if (!trimmed) { flushList(); return; }
    const heading = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (heading) {
      flushList();
      suppressSection = /^verify this\b/i.test(heading[2]);
      if (!suppressSection) {
        const Tag = heading[1].length <= 2 ? "h2" : "h3";
        nodes.push(<Tag key={`heading-${nodes.length}`}><InlineText>{heading[2]}</InlineText></Tag>);
      }
      return;
    }
    if (suppressSection || /^AI-generated learning aid\b/i.test(trimmed)) return;
    const unordered = trimmed.match(/^[-*]\s+(.+)/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      if (list && list.ordered !== isOrdered) flushList();
      list ||= { ordered: isOrdered, items: [] };
      list.items.push((unordered || ordered)![1]);
      return;
    }
    flushList();
    if (trimmed.startsWith("> ")) nodes.push(<blockquote key={`quote-${nodes.length}`}><InlineText>{trimmed.slice(2)}</InlineText></blockquote>);
    else nodes.push(<p key={`paragraph-${nodes.length}`}><InlineText>{trimmed}</InlineText></p>);
  });
  flushList();
  return <div className="markdown-response">{nodes}</div>;
}

function LivingWordCards({
  data,
  onExplorePhrases,
  onAskMore,
}: {
  data: LearningResponse;
  onExplorePhrases?: () => void;
  onAskMore?: () => void;
}) {
  const clean = sanitizeAIData(data);
  const word = clean.featured_word;
  return (
    <div className="living-mini-grid">
      {word?.original && <article className="living-mini-card">
        <span className="living-mini-label">Living word</span>
        <div className="living-phrase-top">
          <strong className="living-phrase">{word.original}</strong>
          {(clean.language || clean.variant) && <span className="living-language">{[clean.language, clean.variant].filter(Boolean).join(" · ")}</span>}
        </div>
        {word.meaning && <span className="living-meaning">{word.meaning}</span>}
        {(word.pronunciation || word.usage) && <span className="living-use">{word.pronunciation || word.usage}</span>}
        <button className="living-mini-action" type="button" onClick={onExplorePhrases}>Explore 10 phrases</button>
      </article>}
      {clean.cultural_habit && <article className="living-mini-card">
        <span className="living-mini-label">Culture</span>
        <p className="living-habit">{clean.cultural_habit}</p>
        <button className="living-mini-action" type="button" onClick={onAskMore}>Ask more</button>
      </article>}
    </div>
  );
}

export function AIResultView({
  state,
  action,
  compact = false,
  loadingTitle = "Preparing your learning experience",
  loadingDetail = "AI is organizing the answer",
  onExplorePhrases,
  onAskMore,
}: {
  state: AIStreamState;
  action: AIAction;
  compact?: boolean;
  loadingTitle?: string;
  loadingDetail?: string;
  onExplorePhrases?: () => void;
  onAskMore?: () => void;
}) {
  if (state.error) return <div className="response-error">{state.error}</div>;
  if (state.loading && !state.markdown && !state.data) return <LoadingState title={loadingTitle} detail={loadingDetail} />;

  let data = state.data;
  if (!data && state.markdown && compact) data = parseCompactWord(state.markdown);
  if (!data && state.markdown && action === "phrases") data = parsePhraseSet(state.markdown);
  const content = data && hasRenderableStructuredContent(data, action)
    ? compact
      ? <LivingWordCards data={data} onExplorePhrases={onExplorePhrases} onAskMore={onAskMore} />
      : <StructuredResponse data={data} />
    : state.markdown
      ? <MarkdownResponse markdown={state.markdown} />
      : null;

  return <>{content}{state.streaming && <span className="stream-cursor" aria-label="Response streaming" />}</>;
}
