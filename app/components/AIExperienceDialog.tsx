"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { communities, type Community } from "../data/communities";
import {
  AIResultView,
  emptyAIStream,
  streamAI,
  type AIAction,
  type AIPayload,
  type AIStreamState,
} from "./AIRenderer";

export interface AIExperienceHandle {
  open: (action: Exclude<AIAction, "ask" | "word">, options?: { year?: string }) => void;
}

const timelineYears = ["1800", "1900", "1950", "2025"];
const toolCopy: Record<Exclude<AIAction, "ask" | "word">, [string, string]> = {
  phrases: ["Learn everyday phrases", "AI will name the language or variant and add clear usage notes."],
  lesson: ["Create a lesson kit", "A classroom-ready outline with objectives, activities, questions, and review notes starts immediately."],
  compare: ["Compare cultures respectfully", "Explore living context, language, place, arts, shared themes, and important differences."],
  translate: ["Translate with context", "Paste a short passage. Translation starts automatically after you stop typing."],
  timeline: ["Place a year in context", "Use the timeline or side arrows to continue exploring how context changes over time."],
  museum: ["Create a responsible museum guide", "An introduction centered on provenance, consent, and present-day community life starts now."],
  archive: ["Review a contribution workflow", "AI is preparing a consent-first checklist for a community-led archive."],
};

type DialogAction = keyof typeof toolCopy;

export const AIExperienceDialog = forwardRef<AIExperienceHandle, { community: Community }>(
  function AIExperienceDialog({ community }, forwardedRef) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const translationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [action, setAction] = useState<DialogAction>("phrases");
    const [currentYear, setCurrentYear] = useState("1900");
    const [grade, setGrade] = useState("Middle school");
    const [compareCulture, setCompareCulture] = useState(
      communities.find((item) => item.slug !== community.slug)?.name || "",
    );
    const [translationText, setTranslationText] = useState("");
    const [targetLanguage, setTargetLanguage] = useState("English");
    const [streamState, setStreamState] = useState<AIStreamState>(emptyAIStream);
    const requestId = useRef(0);
    const [pendingRequest, setPendingRequest] = useState<{ id: number; payload: AIPayload } | null>(null);

    const comparisonChoices = useMemo(
      () => communities.filter((item) => item.slug !== community.slug),
      [community.slug],
    );

    function makePayload(nextAction: DialogAction, overrides: Partial<AIPayload> = {}) {
      const payload: AIPayload = { action: nextAction };
      if (nextAction === "lesson") payload.grade = grade;
      if (nextAction === "compare") payload.compareCulture = compareCulture;
      if (nextAction === "translate") {
        payload.text = translationText;
        payload.targetLanguage = targetLanguage;
      }
      if (nextAction === "timeline") payload.year = currentYear;
      return { ...payload, ...overrides };
    }

    function queueRequest(payload: AIPayload) {
      setPendingRequest({ id: ++requestId.current, payload });
    }

    useImperativeHandle(forwardedRef, () => ({
      open(nextAction, options = {}) {
        const nextYear = nextAction === "timeline" && options.year && timelineYears.includes(options.year)
          ? options.year
          : currentYear;
        setAction(nextAction);
        if (nextAction === "timeline") setCurrentYear(nextYear);
        setStreamState(emptyAIStream);
        dialogRef.current?.showModal();
        if (nextAction !== "translate" || translationText.trim()) {
          queueRequest(makePayload(nextAction, nextAction === "timeline" ? { year: nextYear } : {}));
        }
      },
    }));

    useEffect(() => {
      if (!pendingRequest || !dialogRef.current?.open) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      streamAI(pendingRequest.payload, community.name, setStreamState, {
        cacheScope: community.slug,
        signal: controller.signal,
      }).catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setStreamState({
          ...emptyAIStream,
          error: error instanceof Error ? error.message : "The live guide could not answer this request.",
        });
      });
      return () => controller.abort();
    }, [community.name, community.slug, pendingRequest]);

    useEffect(() => () => {
      abortRef.current?.abort();
      if (translationTimer.current) clearTimeout(translationTimer.current);
    }, []);

    function selectTimelineYear(year: string, shouldRun = false) {
      if (!timelineYears.includes(year)) return;
      setCurrentYear(year);
      if (shouldRun) queueRequest(makePayload("timeline", { year }));
    }

    function stepTimeline(direction: number) {
      const nextYear = timelineYears[timelineYears.indexOf(currentYear) + direction];
      if (nextYear) selectTimelineYear(nextYear, true);
    }

    function onTranslationChange(value: string) {
      setTranslationText(value);
      if (translationTimer.current) clearTimeout(translationTimer.current);
      if (!value.trim()) {
        abortRef.current?.abort();
        setStreamState(emptyAIStream);
        return;
      }
      translationTimer.current = setTimeout(
        () => queueRequest(makePayload("translate", { text: value })),
        700,
      );
    }

    const [title, copy] = toolCopy[action];
    const yearIndex = timelineYears.indexOf(currentYear);
    const loadingTitle = action === "timeline" ? `Exploring ${currentYear}` : "Preparing your learning experience";
    const loadingDetail = action === "timeline" ? "Building historical context" : "AI is organizing the answer";

    return (
      <dialog
        className={`ai-dialog${action === "timeline" ? " timeline-mode" : ""}`}
        ref={dialogRef}
        aria-labelledby="ai-dialog-title"
        onClose={() => abortRef.current?.abort()}
      >
        <div className="ai-dialog-inner">
          <div className="dialog-top">
            <span className="pill ai-status live">AI</span>
            <form method="dialog"><button className="dialog-close" type="submit" aria-label="Close">×</button></form>
          </div>

          {action === "timeline" && <div className="dialog-timeline">
            <div className="eyebrow">Explore the timeline</div>
            <div className="dialog-timeline-row">
              <button className="timeline-step" type="button" disabled={yearIndex === 0} onClick={() => stepTimeline(-1)} aria-label="Explore the previous year">←</button>
              <div className="dialog-years" aria-label="Timeline years">
                {timelineYears.map((year) => <button
                  className={`dialog-year${year === currentYear ? " active" : ""}`}
                  type="button"
                  key={year}
                  aria-current={year === currentYear ? "true" : undefined}
                  onClick={() => selectTimelineYear(year, true)}
                >{year}</button>)}
              </div>
              <button className="timeline-step" type="button" disabled={yearIndex === timelineYears.length - 1} onClick={() => stepTimeline(1)} aria-label="Explore the next year">→</button>
            </div>
          </div>}

          <h2 id="ai-dialog-title">{action === "timeline" ? `${currentYear} in context: ${community.name}` : `${title}: ${community.name}`}</h2>
          <p className="muted">{copy}</p>
          <div className="ai-form">
            {action === "lesson" && <label>Grade level
              <select value={grade} onChange={(event) => { const value = event.target.value; setGrade(value); queueRequest(makePayload("lesson", { grade: value })); }}>
                <option>Elementary school</option><option>Middle school</option><option>High school</option><option>University</option><option>Adult learners</option>
              </select>
            </label>}
            {action === "compare" && <label>Compare with
              <select value={compareCulture} onChange={(event) => { const value = event.target.value; setCompareCulture(value); queueRequest(makePayload("compare", { compareCulture: value })); }}>
                {comparisonChoices.map((item) => <option key={item.slug}>{item.name}</option>)}
              </select>
            </label>}
            {action === "translate" && <>
              <label>Text to translate
                <textarea value={translationText} onChange={(event) => onTranslationChange(event.target.value)} placeholder="Paste a short passage here…" autoFocus />
              </label>
              <label>Target language
                <select value={targetLanguage} onChange={(event) => { const value = event.target.value; setTargetLanguage(value); if (translationText.trim()) queueRequest(makePayload("translate", { targetLanguage: value })); }}>
                  <option>English</option><option>Korean</option><option>Japanese</option><option>Spanish</option><option>French</option><option>Arabic</option>
                </select>
              </label>
            </>}
          </div>
          <div className="ai-result visible" aria-live="polite">
            {action === "translate" && !translationText.trim()
              ? "Paste a short passage above. AI will translate it automatically."
              : <AIResultView state={streamState} action={action} loadingTitle={loadingTitle} loadingDetail={loadingDetail} />}
          </div>
          <div className="ai-meta">AI</div>
        </div>
      </dialog>
    );
  },
);
