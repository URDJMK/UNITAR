"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Community } from "../data/communities";
import { AIExperienceDialog, type AIExperienceHandle } from "./AIExperienceDialog";
import { AIResultView, emptyAIStream, streamAI, type AIStreamState } from "./AIRenderer";

const timelineYears = ["1800", "1900", "1950", "2025"];

function VillageTestimonyDialog({ community, dialogRef }: { community: Community; dialogRef: React.RefObject<HTMLDialogElement | null> }) {
  const testimony = community.vignette;
  return (
    <dialog className="ai-dialog voice-dialog" ref={dialogRef} aria-labelledby="voice-dialog-title">
      <div className="ai-dialog-inner">
        <div className="dialog-top">
          <span className="pill">testimony</span>
          <form method="dialog"><button className="dialog-close" type="submit" aria-label="Close testimony">×</button></form>
        </div>
        <h2 id="voice-dialog-title">Village testimony</h2>
        <div className="voice-attribution"><strong>{testimony.speaker}</strong><span>{testimony.role} · {community.region}</span></div>
        <div className="voice-quote">
          <div className="eyebrow">{testimony.language}</div>
          <div className="voice-original"><p>{testimony.localFirst}</p><p>{testimony.localSecond}</p></div>
          <div className="voice-translation">
            <div className="eyebrow">English translation</div>
            <p>{testimony.first}</p><p>{testimony.second}</p>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function StoryVideoDialog({
  community,
  dialogRef,
  videoRef,
}: {
  community: Community;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <dialog
      className="story-video-dialog"
      ref={dialogRef}
      aria-label={`${community.name} featured story`}
      onClose={() => {
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;
      }}
    >
      <div className="story-video-frame">
        <form method="dialog" className="story-video-close-form">
          <button className="story-video-close" type="submit" aria-label="Close featured story">×</button>
        </form>
        <video
          ref={videoRef}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          poster="/og.png"
          aria-label={`${community.name} featured film demo`}
        >
          <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
          Your browser does not support embedded video.
        </video>
      </div>
    </dialog>
  );
}

export function CultureProfile({ community }: { community: Community }) {
  const router = useRouter();
  const aiDialogRef = useRef<AIExperienceHandle>(null);
  const voiceDialogRef = useRef<HTMLDialogElement>(null);
  const storyVideoDialogRef = useRef<HTMLDialogElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const [currentYear, setCurrentYear] = useState("1900");
  const [wordState, setWordState] = useState<AIStreamState>({ ...emptyAIStream, loading: true, streaming: true });

  useEffect(() => {
    const controller = new AbortController();
    streamAI({ action: "word" }, community.name, setWordState, {
      cacheScope: community.slug,
      endpoint: "/api/living-word",
      signal: controller.signal,
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setWordState({
        ...emptyAIStream,
        error: error instanceof Error ? error.message : "The live guide could not answer this request.",
      });
    });
    return () => controller.abort();
  }, [community.name, community.slug]);

  const openTool = (action: Parameters<AIExperienceHandle["open"]>[0]) => aiDialogRef.current?.open(action);

  function openStoryVideo() {
    storyVideoDialogRef.current?.showModal();
    if (storyVideoRef.current) void storyVideoRef.current.play().catch(() => undefined);
  }

  return (
    <main className="route-main page-enter">
      <section className="section" aria-labelledby="culture-title">
        <div className="profile-hero">
          <Link className="back" href="/">← Back to discover</Link>
          <div className="profile-title">
            <div>
              <div className="eyebrow">Living culture profile</div>
              <h1 id="culture-title">{community.name}</h1>
              <div className="profile-meta">
                <span className="pill">{community.region}</span>
                <span className="pill warning">{community.focus}</span>
              </div>
            </div>
            <div className="placeholder-note">AI-powered cultural learning tools</div>
          </div>
        </div>

        <p className="quote">Language carries memory, place, and ways of understanding the world.</p>

        <div className="living-word">
          <div>
            <div className="eyebrow">Living word · Culture · AI</div>
            <div className={`living-word-copy${wordState.loading ? " loading" : ""}`} aria-live="polite">
              <AIResultView
                state={wordState}
                action="word"
                compact
                loadingTitle={`Finding one ${community.name} word and culture detail`}
                loadingDetail="AI is keeping both short"
                onExplorePhrases={() => openTool("phrases")}
                onAskMore={() => router.push(`/culture/${community.slug}/ask`)}
              />
            </div>
          </div>
        </div>

        <div id="features" className="feature-grid">
          <button className="feature-button" type="button" onClick={openStoryVideo}><span className="feature-icon">▶</span><strong>Watch Story</strong><small>Play the featured film</small></button>
          <button className="feature-button" type="button" onClick={() => voiceDialogRef.current?.showModal()}><span className="feature-icon">“</span><strong>Village Testimony</strong><small>A life in two paragraphs</small></button>
          <button className="feature-button" type="button" onClick={() => openTool("phrases")}><span className="feature-icon">Aa</span><strong>Learn 10 Phrases</strong><small>Generated live by AI</small></button>
          <button className="feature-button" type="button" onClick={() => openTool("translate")}><span className="feature-icon">文</span><strong>Translate Text</strong><small>AI translation</small></button>
          <Link className="feature-button" href={`/culture/${community.slug}/documentary?mode=generate`}><span className="feature-icon">▣</span><strong>Documentary</strong><small>Create a cultural video</small></Link>
          <Link className="feature-button" href={`/culture/${community.slug}/ask?auto=1`}><span className="feature-icon">◌</span><strong>Ask a Question</strong><small>Starts with an answer</small></Link>
        </div>

        <div id="learn" className="module-grid">
          <article className="module">
            <div className="eyebrow">Teacher mode</div><h3>Create a lesson kit</h3>
            <p className="muted">Choose a grade level and create a reviewable classroom bundle.</p>
            <div className="mini-row"><span className="chip">Slides</span><span className="chip">Quiz</span><span className="chip">Worksheet</span><span className="chip">Discussion</span></div>
            <button className="secondary" type="button" onClick={() => openTool("lesson")}>Open lesson kit</button>
          </article>

          <article className="module dark">
            <div className="eyebrow">Language lab</div><h3>Start with everyday phrases</h3>
            <p className="muted">AI creates a clear phrase list with pronunciation, meaning, and everyday usage.</p>
            <div className="mini-row"><span className="chip">10 phrases</span><span className="chip">Pronunciation</span><span className="chip">Usage</span></div>
            <button className="secondary" type="button" onClick={() => openTool("phrases")}>Learn 10 phrases</button>
          </article>

          <article className="module">
            <div className="eyebrow">Timeline</div><h3>See history in context</h3>
            <div className="timeline" aria-label="Historical timeline">
              {timelineYears.map((year) => <button
                className={`year${year === currentYear ? " active" : ""}`}
                type="button"
                key={year}
                aria-pressed={year === currentYear}
                onClick={() => setCurrentYear(year)}
              >{year}</button>)}
            </div>
            <button className="secondary timeline-explore-button" type="button" onClick={() => aiDialogRef.current?.open("timeline", { year: currentYear })}>Explore {currentYear} in context →</button>
          </article>

          <article id="museum" className="module dark">
            <div className="eyebrow">Museum mode</div><h3>Walk through a reconstruction</h3>
            <p className="muted">An AI guide explains objects and spaces using approved museum and community sources.</p>
            <button className="secondary" type="button" onClick={() => openTool("museum")}>Open visitor guide</button>
          </article>

          <article id="community" className="module">
            <div className="eyebrow">Community archive</div><h3>Contribute on your terms</h3>
            <p className="muted">Communities choose what is public, what AI may use, and what must remain restricted.</p>
            <div className="mini-row"><span className="chip">Story</span><span className="chip">Song</span><span className="chip">Recipe</span><span className="chip">Photo</span><span className="chip">Dance</span><span className="chip">Oral history</span></div>
            <button className="secondary" type="button" onClick={() => openTool("archive")}>Review contribution flow</button>
          </article>

          <article className="module">
            <div className="eyebrow">Compare cultures</div><h3>{community.name} + another culture</h3>
            <p className="muted">Explore shared themes and distinct traditions without ranking or flattening either culture.</p>
            <div className="mini-row"><span className="chip">Language</span><span className="chip">Food</span><span className="chip">Music</span><span className="chip">Worldviews</span></div>
            <button className="secondary" type="button" onClick={() => openTool("compare")}>Compare now</button>
          </article>
        </div>
      </section>

      <AIExperienceDialog ref={aiDialogRef} community={community} />
      <VillageTestimonyDialog community={community} dialogRef={voiceDialogRef} />
      <StoryVideoDialog community={community} dialogRef={storyVideoDialogRef} videoRef={storyVideoRef} />
    </main>
  );
}
