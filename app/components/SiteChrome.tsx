"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AIStatus = {
  configured: boolean;
  runtime?: string;
};

export function SiteHeader() {
  const [status, setStatus] = useState({ full: "Checking AI…", short: "AI…", live: false });

  useEffect(() => {
    let active = true;
    fetch("/api/ai", { cache: "no-store" })
      .then((response) => response.json() as Promise<AIStatus>)
      .then((data) => {
        if (!active) return;
        if (data.configured) {
          setStatus({
            full: data.runtime === "pydantic-ai" ? "PydanticAI · AI live" : "AI stream live",
            short: "AI live",
            live: true,
          });
        } else {
          setStatus({ full: "AI key needed", short: "AI setup", live: false });
        }
      })
      .catch(() => {
        if (active) setStatus({ full: "AI unavailable", short: "AI offline", live: false });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Go to Living Voices home">
        <span className="brand-mark" aria-hidden="true">◉</span>
        <span>Living Voices</span>
      </Link>
      <nav aria-label="Prototype sections">
        <Link href="/culture/ainu#features">Experiences</Link>
        <Link href="/culture/ainu#learn">Education</Link>
        <Link href="/culture/ainu#community">Community</Link>
      </nav>
      <span className={`pill ai-status${status.live ? " live" : ""}`}>
        <span className="ai-status-full">{status.full}</span>
        <span className="ai-status-short">{status.short}</span>
      </span>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="eyebrow">Humanity · 7,000+ languages</div>
      <h2>Every language contains a different way of understanding the world.</h2>
      <p>Preservation begins by listening—and by letting communities lead.</p>
      <Link className="primary footer-primary" href="/">Preserve another story</Link>
    </footer>
  );
}
