"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { communities } from "../data/communities";
import { clearAIResponseCache } from "../lib/ai-cache";
import { VoiceSignalGraphic } from "./VoiceSignalGraphic";

export function DiscoverPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    clearAIResponseCache();
  }, []);

  const visibleCommunities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return communities;
    return communities.filter((community) =>
      `${community.keywords} ${community.name} ${community.region} ${community.focus}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (visibleCommunities.length === 1) router.push(`/culture/${visibleCommunities[0].slug}`);
  }

  return (
    <main className="route-main page-enter">
      <section className="hero home-hero" aria-labelledby="home-title">
        <div className="hero-inner home-hero-inner">
          <div className="home-hero-copy">
            <div className="eyebrow">Community-led cultural heritage</div>
            <h1 id="home-title"><span>Living</span> <span>Voices</span></h1>
            <p className="hero-copy">Not a museum of the past. A conversation with humanity.</p>
            <form className="search" role="search" onSubmit={submitSearch}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search a culture, language, or community…"
                aria-label="Search cultures"
              />
              <button type="submit">Search</button>
            </form>
          </div>
          <VoiceSignalGraphic />
        </div>
      </section>

      <section className="section community-index-section" aria-labelledby="featured-title">
        <div className="section-head">
          <div>
            <div className="eyebrow">Field index · {communities.length} communities</div>
            <h2 id="featured-title">Featured voices</h2>
            <p className="muted">A living index of language, memory, place, and community-led knowledge.</p>
          </div>
          <div className="archive-status" role="status" aria-live="polite">
            <strong>{String(visibleCommunities.length).padStart(2, "0")}</strong>
            <span>records shown<small>{query.trim() ? "Filtered index" : "Complete index"}</small></span>
          </div>
        </div>
        {visibleCommunities.length ? (
          <div className="culture-grid">
            {visibleCommunities.map((community) => (
              <Link
                className="culture-card"
                href={`/culture/${community.slug}`}
                key={community.slug}
              >
                <span className="community-card-head">
                  <span className="community-index">LV–{String(communities.indexOf(community) + 1).padStart(2, "0")}</span>
                  <span className="culture-symbol" aria-hidden="true">{community.symbol}</span>
                </span>
                <span className="community-card-body">
                  <span className="culture-name">{community.name}</span>
                  <span className="culture-meta">{community.region}</span>
                  <span className="community-focus">{community.focus}</span>
                </span>
                <span className="community-open" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty visible-empty">No featured result yet. Try “Maasai,” “Nubian,” “Ainu,” or “language.”</div>
        )}
      </section>
    </main>
  );
}
