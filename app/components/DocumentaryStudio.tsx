"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Community } from "../data/communities";

const productionChecks = ["Narration", "Music", "Historical context", "AI animation", "Subtitles"];

export function DocumentaryStudio({ community, initialMode }: { community: Community; initialMode: "watch" | "generate" }) {
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const [completedChecks, setCompletedChecks] = useState(0);
  const [running, setRunning] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(initialMode === "watch");
  const [buttonLabel, setButtonLabel] = useState(initialMode === "watch" ? "Create another cultural video" : "Replay film demo");

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const runDocumentaryDemo = useCallback(() => {
    clearTimers();
    setStatusVisible(true);
    setVideoVisible(false);
    setRunning(true);
    setButtonLabel("Preparing film demo…");
    setCompletedChecks(0);
    productionChecks.forEach((_, index) => {
      timersRef.current.push(setTimeout(() => {
        setCompletedChecks(index + 1);
        if (index === productionChecks.length - 1) {
          setVideoVisible(true);
          setRunning(false);
          setButtonLabel("Replay film demo");
        }
      }, 520 * (index + 1)));
    });
  }, [clearTimers]);

  const showDocumentaryPreview = useCallback(() => {
    clearTimers();
    setStatusVisible(false);
    setVideoVisible(true);
    setRunning(false);
    setButtonLabel("Create another cultural video");
  }, [clearTimers]);

  useEffect(() => {
    const starter = setTimeout(() => {
      if (initialMode === "watch") showDocumentaryPreview();
      else runDocumentaryDemo();
    }, 0);
    return () => {
      clearTimeout(starter);
      clearTimers();
    };
  }, [clearTimers, initialMode, runDocumentaryDemo, showDocumentaryPreview]);

  function submitDocumentary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runDocumentaryDemo();
  }

  return (
    <main className="route-main page-enter">
      <section className="demo-panel" aria-labelledby="documentary-title">
        <Link className="back" href={`/culture/${community.slug}`}>← Back to culture profile</Link>
        <div className="panel-card">
          <div className="eyebrow">AI documentary studio · {community.name}</div>
          <h1 id="documentary-title">Turn a story into a doorway.</h1>
          <p className="muted">Choose an audience, length, and language to preview a cultural film concept.</p>
          <form onSubmit={submitDocumentary}>
            <div className="form-grid">
              <label>Audience
                <select defaultValue="Children (8–12)"><option>Children (8–12)</option><option>High School</option><option>University</option><option>Museum Visitors</option></select>
              </label>
              <label>Length
                <select defaultValue="2 minutes"><option>30 seconds</option><option>2 minutes</option><option>5 minutes</option></select>
              </label>
              <label>Language
                <select defaultValue="English"><option>English</option><option>Chinese</option><option>Korean</option><option>Spanish</option><option>Arabic</option></select>
              </label>
            </div>
            <button className="primary" type="submit" disabled={running}>{buttonLabel}</button>
          </form>

          <div className={`generator-status${statusVisible ? " visible" : ""}`} aria-live="polite">
            <div className="progress-track"><div className="progress-bar" style={{ width: `${(completedChecks / productionChecks.length) * 100}%` }} /></div>
            <div className="checks">
              {productionChecks.map((check, index) => <span className={`check${index < completedChecks ? " done" : ""}`} key={check}>{index < completedChecks ? "✓" : "○"} {check}</span>)}
            </div>
          </div>

          <div className={`video-mock${videoVisible ? " visible" : ""}`} role="img" aria-label={`Simulated ${community.name} documentary preview`}>
            <div className="play" aria-hidden="true">▶</div>
            <div className="video-caption"><strong>The Bear Spirit</strong><span>AI-generated concept · 2:00</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
