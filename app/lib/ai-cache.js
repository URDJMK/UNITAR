"use client";

const STORAGE_KEY = "living-voices:ai-cache:v1";
const CACHE_VERSION = 1;
const MAX_RESPONSES = 160;
const MAX_CHAT_COMMUNITIES = 24;
const MAX_CHAT_MESSAGES = 80;

function createEmptyEnvelope(generation = 0) {
  return {
    version: CACHE_VERSION,
    generation,
    responses: {},
    chats: {},
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseEnvelope(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.version !== CACHE_VERSION ||
      typeof parsed.generation !== "number" ||
      !parsed.responses ||
      !parsed.chats
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizePayload(payload) {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  );
}

export function createAIResponseCacheKey({ scope, endpoint = "/api/ai", payload }) {
  return JSON.stringify({
    endpoint,
    scope: String(scope || "").trim().toLowerCase(),
    payload: normalizePayload(payload),
  });
}

function isCompleteResponse(state) {
  return Boolean(
    state &&
    !state.loading &&
    !state.streaming &&
    !state.error &&
    (String(state.markdown || "").trim() || state.data),
  );
}

export function createAIResponseCache(storage = null, now = () => Date.now()) {
  let memory = null;

  function load() {
    if (memory) return memory;
    let stored = null;
    try {
      stored = parseEnvelope(storage?.getItem(STORAGE_KEY));
    } catch {
      stored = null;
    }
    memory = stored || createEmptyEnvelope();
    return memory;
  }

  function persist() {
    if (!storage || !memory) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch {
      const newestResponses = Object.fromEntries(
        Object.entries(memory.responses)
          .sort(([, left], [, right]) => right.savedAt - left.savedAt)
          .slice(0, Math.floor(MAX_RESPONSES / 2)),
      );
      memory = { ...memory, responses: newestResponses };
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(memory));
      } catch {
        // The in-memory cache remains useful when browser storage is unavailable.
      }
    }
  }

  function getGeneration() {
    return load().generation;
  }

  function readResponse(request) {
    const key = createAIResponseCacheKey(request);
    const cached = load().responses[key];
    if (!cached || !isCompleteResponse(cached.state)) return null;
    return {
      ...clone(cached.state),
      loading: false,
      streaming: false,
      error: "",
    };
  }

  function writeResponse(request, state, requestGeneration = getGeneration()) {
    const envelope = load();
    if (requestGeneration !== envelope.generation || !isCompleteResponse(state)) return false;
    const key = createAIResponseCacheKey(request);
    envelope.responses[key] = { savedAt: now(), state: clone(state) };
    const responseEntries = Object.entries(envelope.responses);
    if (responseEntries.length > MAX_RESPONSES) {
      envelope.responses = Object.fromEntries(
        responseEntries
          .sort(([, left], [, right]) => right.savedAt - left.savedAt)
          .slice(0, MAX_RESPONSES),
      );
    }
    persist();
    return true;
  }

  function readChat(scope) {
    const cached = load().chats[String(scope || "").trim().toLowerCase()];
    return cached?.messages ? clone(cached.messages) : [];
  }

  function writeChat(scope, messages, requestGeneration = getGeneration()) {
    const envelope = load();
    if (requestGeneration !== envelope.generation) return false;
    const key = String(scope || "").trim().toLowerCase();
    if (!key) return false;
    envelope.chats[key] = {
      savedAt: now(),
      messages: clone(messages.slice(-MAX_CHAT_MESSAGES)),
    };
    const chatEntries = Object.entries(envelope.chats);
    if (chatEntries.length > MAX_CHAT_COMMUNITIES) {
      envelope.chats = Object.fromEntries(
        chatEntries
          .sort(([, left], [, right]) => right.savedAt - left.savedAt)
          .slice(0, MAX_CHAT_COMMUNITIES),
      );
    }
    persist();
    return true;
  }

  function clear() {
    const nextGeneration = load().generation + 1;
    memory = createEmptyEnvelope(nextGeneration);
    persist();
  }

  return { clear, getGeneration, readChat, readResponse, writeChat, writeResponse };
}

let browserCache = null;

function getBrowserCache() {
  if (!browserCache) {
    let storage = null;
    try {
      storage = typeof window === "undefined" ? null : window.localStorage;
    } catch {
      storage = null;
    }
    browserCache = createAIResponseCache(storage);
  }
  return browserCache;
}

export function getAIResponseCacheGeneration() {
  return getBrowserCache().getGeneration();
}

export function readCachedAIResponse(request) {
  return getBrowserCache().readResponse(request);
}

export function writeCachedAIResponse(request, state, requestGeneration) {
  return getBrowserCache().writeResponse(request, state, requestGeneration);
}

export function readCachedAIChat(scope) {
  return getBrowserCache().readChat(scope);
}

export function writeCachedAIChat(scope, messages, requestGeneration) {
  return getBrowserCache().writeChat(scope, messages, requestGeneration);
}

export function clearAIResponseCache() {
  getBrowserCache().clear();
}

