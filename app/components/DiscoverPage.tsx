"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { communities } from "../data/communities";
import { clearAIResponseCache } from "../lib/ai-cache";

const heroWaveform = [
  5, 7, 5, 10, 8, 13, 9, 17, 12, 21, 14, 28, 18, 36, 24, 48, 31, 67, 42, 88,
  55, 72, 38, 59, 29, 44, 22, 36, 18, 30, 15, 25, 12, 20, 10, 17, 9, 14, 8, 12,
  7, 10, 6, 8, 5, 7, 5, 6, 4, 5, 4, 4, 3, 4, 3, 3, 2, 3, 2, 2,
];

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
        <div className="home-voice-art" aria-hidden="true" />
        <div className="home-voice-wave" aria-hidden="true">
          {heroWaveform.map((height, index) => (
            <span
              key={`${height}-${index}`}
              style={{ height: `${height}%`, animationDelay: `${index * -0.045}s` }}
            />
          ))}
        </div>
        <div className="hero-inner home-hero-inner">
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
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="section-head">
          <div>
            <div className="eyebrow">Start listening</div>
            <h2 id="featured-title">Featured voices</h2>
          </div>
          <p className="muted">50 communities · Every profile opens live learning tools.</p>
        </div>
        {visibleCommunities.length ? (
          <div className="culture-grid">
            {visibleCommunities.map((community) => (
              <Link
                className="culture-card"
                href={`/culture/${community.slug}`}
                key={community.slug}
              >
                <span className="culture-symbol" aria-hidden="true">{community.symbol}</span>
                <span>
                  <span className="culture-name">{community.name}</span><br />
                  <span className="culture-meta">{community.meta}</span>
                </span>
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
