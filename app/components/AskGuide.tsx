"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Community } from "../data/communities";
import { AIResultView, emptyAIStream, streamAI, type AIStreamState } from "./AIRenderer";

type ChatMessage =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "ai"; state: AIStreamState };

const automaticQuestion = "What should a first-time learner understand about this community?";

export function AskGuide({ community, autoQuestion = false }: { community: Community; autoQuestion?: boolean }) {
  const nextId = useRef(1);
  const autoStarted = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const controllersRef = useRef<AbortController[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const updateAnswer = useCallback((id: number, state: AIStreamState) => {
    setMessages((current) => current.map((message) => message.id === id && message.role === "ai" ? { ...message, state } : message));
  }, []);

  const askQuestion = useCallback(async (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const userId = nextId.current++;
    const answerId = nextId.current++;
    setMessages((current) => [
      ...current,
      { id: userId, role: "user", text: cleanQuestion },
      { id: answerId, role: "ai", state: { ...emptyAIStream, loading: true, streaming: true } },
    ]);
    const controller = new AbortController();
    controllersRef.current.push(controller);
    try {
      await streamAI({ action: "ask", question: cleanQuestion }, community.name, (state) => updateAnswer(answerId, state), { signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) return;
      updateAnswer(answerId, {
        ...emptyAIStream,
        error: error instanceof Error ? error.message : "The live guide could not answer this request.",
      });
    }
  }, [community.name, updateAnswer]);

  useEffect(() => {
    if (autoQuestion && !autoStarted.current) {
      autoStarted.current = true;
      void askQuestion(automaticQuestion);
    }
  }, [askQuestion, autoQuestion]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => () => controllersRef.current.forEach((controller) => controller.abort()), []);

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input;
    setInput("");
    void askQuestion(question);
  }

  return (
    <main className="route-main page-enter">
      <section className="demo-panel" aria-labelledby="story-title">
        <Link className="back" href={`/culture/${community.slug}`}>← Back to culture profile</Link>
        <div className="panel-card">
          <div className="eyebrow">Live cultural learning guide · {community.name}</div>
          <h1 id="story-title">A story that listens back.</h1>
          <div className="story-intro"><strong>Living Voices AI guide</strong>Ask for context, definitions, and learning ideas.</div>
          <div className="chat-log" aria-live="polite">
            <div className="message">Ask a question about {community.name} culture or language. AI answers live.</div>
            {messages.map((message) => message.role === "user"
              ? <div className="message user" key={message.id}>{message.text}</div>
              : <div className={`message ai-rich${message.state.loading ? " loading" : ""}`} key={message.id}>
                  <AIResultView
                    state={message.state}
                    action="ask"
                    loadingTitle="Listening to your question"
                    loadingDetail="AI is composing a structured answer"
                  />
                </div>)}
            <div ref={endRef} />
          </div>
          <div className="quick-questions">
            <button type="button" onClick={() => void askQuestion("What languages are connected to this community?")}>What languages are connected?</button>
            <button type="button" onClick={() => void askQuestion("What should a first-time learner understand?")}>What should I understand first?</button>
            <button type="button" onClick={() => void askQuestion("How can I learn more about this community?")}>How can I learn more?</button>
          </div>
          <form className="chat-row" onSubmit={submitQuestion}>
            <input className="chat-input" value={input} onChange={(event) => setInput(event.target.value)} type="text" placeholder="Ask a simple question…" aria-label="Ask the cultural learning guide" />
            <button className="primary" type="submit">Ask</button>
          </form>
        </div>
      </section>
    </main>
  );
}
