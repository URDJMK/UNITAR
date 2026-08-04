# Behind the Prompt v2 — AI in Film Editing

Three standalone HTML scenes showing how AI collapses a traditional editing workflow. Built for a PowerPoint demo: each file is opened on its own, in any order, and nothing links to anything else.

| File | Scene | Beat |
|------|-------|------|
| `01-select-scene.html` | **Pick the scene** | Three takes of the same moment. AI recommends the close-up and the shot is locked to the edit. |
| `02-scan-actor.html` | **Scan the actor, erase the set** | One frame is scanned, the person is matted, the background is deleted, and the actor is dropped onto a new plate — no rotoscoping, no green screen. |
| `03-final-cut.html` | **One prompt. Full cut.** | A single edit prompt trims and orders the clips, matches color, mixes audio, burns subtitles — 2 days 6 hrs of finishing vs 3 min 12 s. |

## Using them

Double-click a file, or drag it into a browser. Then press <kbd>F11</kbd> (Windows) / <kbd>⌃⌘F</kbd> (Mac) for full screen.

- **Every file is fully self-contained** — HTML, CSS, JavaScript and images are all embedded in the one file. No server, no internet, no shared folder, no assets directory. Copy a single file to a USB stick and it still works.
- **Fixed 960 × 540 frame** that scales to fit whatever window it lands in, from a small PowerPoint web-view pane up to a projector. It never scrolls and never reflows.
- **Click or clicker.** Click the buttons, or use a presentation remote: <kbd>→</kbd> / <kbd>Space</kbd> / <kbd>Page Down</kbd> advances the step. In scene 01, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> pick a take.
- **Reset** with a browser refresh (<kbd>F5</kbd>).

Timings: scene 01 is instant, scene 02 runs about 4 s across its three steps, scene 03 runs about 8 s end to end. Each honors the OS "reduce motion" setting by skipping the animation.

### Linking from PowerPoint

Insert → Link → *Place in this document* won't do it; use **Insert → Link → Existing File**, point at the `.html`, and click it in slideshow mode. Keep the three files next to the `.pptx` so the relative link survives being moved.

## Theme

The three pages are styled to match `UNITAR_film.pptx`, pulled from that deck's own `slideMaster1.xml` and `theme1.xml`. The deck is 13.333 × 7.5 in = 960 × 540 pt and these pages are a fixed 960 × 540 px frame, so every value transfers 1 : 1 with no scaling.

- **Ground** — the master's 45° gradient, `#1B1E24` → `#101216`. Flat surfaces above it: `#23272E` cards, `#1E2228` rows, one hairline at `#3A3F47`. No drop shadows, no film grain, no vignettes — the deck has none of them either.
- **Ink** — warm, never cool: `#E6E1D8` body, `#CFC3AE` labels and asides, `#FFFFFF` reserved for titles.
- **Accents in the deck's order** — amber `#E8A33D` always leads, teal `#3FA6A0` is reserved for the takeaway line (bold italic, exactly as on the deck's slides), then terracotta, steel and violet for category rails. Green `#4CAF7D` is the one semantic colour, as on the deck's job-task slide.
- **Chrome** — the amber `AccentBar` (120 × 6 px at x 0, y 531) and the full-width `Hairline` (y 537) sit on every page, at the same coordinates as on all 14 slides.
- **Type** — Franklin Gothic Medium for the kicker and title, Segoe UI for body copy, at the deck's own sizes (15 px letterspaced amber kicker, 34 px white title, 17 px body). Monospace survives only inside the diegetic readouts — timecode, engine telemetry, timeline ruler — because a video-editing UI needs it and the deck never shows one.

On Windows with Office both deck fonts are installed, so the pages and the slides render identically. Elsewhere both fall back the same way PowerPoint does, to Helvetica Neue / Arial.

## Visuals

The images are the same fictional, AI-generated stills used in the first version of this deck (embedded here as base64). They depict invented characters in an invented scene — no real actors, no real production footage. The scan overlays, mattes, layer panels, timeline and readouts are drawn locally in HTML and CSS.

The silhouette used for the background removal in scene 02 was traced from the actual pixels of the source frame, so the cutout lines up with the person exactly.

## Video versions

`video/` holds a screen recording of each scene, captured from the real page — 1920 × 1080, H.264, silent, under 1 MB each. They are not animations of a mock-up; each one is the actual page being driven through its interaction.

Taken together the three clips make one argument: **choosing the shot, isolating the subject and assembling the cut are the three stages of a traditional edit, and each one collapses to a single click.** Every number and label on screen is fictional, written for the talk.

### `video/01-pick-the-scene.mp4` — 7.3 s
An editor is looking at one moment of a film, covered three ways: a wide, a medium and a close-up. The clip opens on the wide, framed in a program monitor with a running timecode. A beat later an **AI pick** badge appears beside the close-up and the assistant explains itself in one line — it watched all three takes and rates the close-up the strongest emotional read at 00:14. The monitor cuts to the close-up and the shot is locked and sent to the edit.

The point: the first pass of an edit — sifting coverage and choosing a take — arrives as a recommendation with a reason attached, and the human's job becomes accepting or overruling it.

### `video/02-scan-and-erase.mp4` — 7.2 s
A single frame of an actor standing on a studio set. A scan sweeps down the frame, tracking points settle onto the figure and an outline traces his silhouette; the readout reports a person and a background found as two separate things, at 99.2% matte confidence. The set then dissolves into a transparency checkerboard, leaving a clean cutout, and the layer list flips from *Found* to *Removed*. In the last beat the actor is dropped into a completely different location — a rain-lit house at night — with the colour grade matched to the new plate.

The point is the line running under it: roughly **six hours of hand rotoscoping** for one shot, against **4.1 seconds**. No green screen, no reshoot, and the actor is now somewhere he never stood.

### `video/03-one-prompt-full-cut.mp4` — 11.4 s
Opens on an empty timeline and one written instruction: *"Cut this scene for tension. Match the grade, mix the rain under the dialogue, and burn in subtitles."* On **Generate**, the three clips drop onto the video track already trimmed and ordered; a colour-match pass grades the monitor; an audio bed and a subtitle track appear beneath. The playhead then sweeps the timeline and the cut plays back — the monitor cutting wide → medium → close-up with the subtitle burned in.

It ends on the scoreboard, which is the whole reason the clip exists: **2 days 6 hours** of traditional finishing against **3 minutes 12 seconds**, 98% less time, one person instead of a crew.

### Putting one on a slide

**Insert → Video → Video from File**, then in the **Playback** tab set **Start: Automatically** (add **Loop until Stopped** if you want it running while you talk over it). They play from inside the `.pptx` with no browser, no server and no internet — use these when you can't rehearse on the presenting machine, and the live HTML when you can.
