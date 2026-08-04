# BEHIND THE PROMPT — Static HTML Demo

Four independent, presentation-ready HTML scenes for demonstrating an easy AI film-editing workflow. The package is intentionally separate from the Next.js application and has no framework, build step, backend, API, CDN, remote font, or remote asset.

## Run locally

From this folder:

```bash
python3 -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/index.html
```

Every scene can also be opened directly:

- `index.html` — Opening
- `01-decisions.html` — The Decisions
- `02-digital-actor.html` — Automatic Scene Scan
- `04-ending.html` — Final Trigger

The files also work through `file://`, but localhost is recommended for a consistent presentation setup.

## Presentation setup

1. Start the local server before opening the PowerPoint.
2. Link the relevant slide or presentation button to `http://127.0.0.1:8765/index.html`.
3. Keep the browser at 100% zoom and use full screen or presentation mode.
4. Use the low-emphasis Scene Menu at the bottom right to recover directly to any scene.
5. Each scene includes Restart and Previous controls; progression remains locked until the interaction is complete.

Every landscape page uses a fixed PowerPoint add-in canvas capped at 960 × 540. Larger webviews center the canvas instead of enlarging it, while smaller landscape webviews shrink it to the available space. It is verified at both 960 × 540 and 800 × 450 without horizontal or vertical scrolling.

The complete route is designed for roughly 35–50 seconds when narrated. For rehearsal, append `?reduced-motion=1` to any scene URL to skip timed transitions. The normal experience also honors the operating system's `prefers-reduced-motion` setting.

## Keyboard and offline use

- All interactions use native buttons and links.
- `Tab` moves through controls; `Enter` or `Space` activates them.
- Focus is clearly visible.
- Generated results are announced through an ARIA live region.
- Missing raster assets are replaced by labeled visual fallbacks.
- All files and visuals are local, so the experience works without internet access.

## File structure

```text
behind-the-prompt/
├── index.html
├── 01-decisions.html
├── 02-digital-actor.html
├── 04-ending.html
├── css/shared.css
├── js/
│   ├── shared.js
│   ├── opening.js
│   ├── decisions.js
│   ├── digital-actor.js
│   └── ending.js
└── assets/
    ├── images/
    └── CREDITS.md
```
