# Living Voices — Product Requirements Document

**Version:** 0.1 concept demo  
**Status:** Teammate review  
**Product type:** Community-led digital heritage and learning platform  
**Tagline:** *Not a museum of the past. A conversation with humanity.*

## 1. Product summary

Living Voices helps people discover endangered languages and living cultural traditions through stories, pronunciation, interactive learning, reconstructed environments, and community-contributed archives. AI is used as an access and education layer—not as the owner, authority, or replacement for a culture.

The initial demo should make teammates immediately understand the product thesis and say: **“I wish this actually existed.”** It is not intended to prove production AI, content ingestion, or backend infrastructure.

## 2. Problem

Many cultural heritage experiences are difficult to access, static, or separated across archives. Younger learners often encounter culture as something to look at rather than something they can listen to, ask questions about, and connect to their own lives.

At the same time, generative AI can misrepresent, flatten, or appropriate cultural knowledge when source communities do not control the data, narrative, or permissions.

## 3. Product goal

Create an emotionally compelling, interactive front door to living heritage that:

- makes endangered languages and traditions approachable for young people, teachers, museum visitors, and the general public;
- turns passive browsing into conversation, listening, practice, and exploration;
- helps educators create age-appropriate learning materials;
- keeps communities in control of what is shared, how it is represented, and how it may be reused;
- makes common ground across cultures visible without erasing meaningful differences.

## 4. Non-goals for the demo

- No production backend, authentication, payments, uploads, or AI model calls.
- No claim that generated media is historically authoritative.
- No unsupervised “digital replica” of a real elder or community member.
- No attempt to cover every culture or fully teach a language.
- No production-ready rights, moderation, or archival workflow.

## 5. Primary users

| User | Need | Core value |
|---|---|---|
| Curious learner | Discover a culture quickly | Story-first, conversational exploration |
| Student | Understand and remember | Short video, questions, pronunciation, timelines |
| Teacher | Prepare culturally responsible materials | Lesson plan, quiz, worksheet, discussion prompts |
| Museum visitor | Experience context beyond labels | Guided reconstruction and interactive narration |
| Community contributor | Preserve and share on their own terms | Consent, attribution, access controls, provenance |
| Cultural institution | Extend access to approved collections | Credible source and rights metadata |

## 6. Experience principles

1. **Living, not frozen.** Present cultures as contemporary and evolving, not only historical.
2. **Community authority.** Clearly distinguish community-approved material, archival records, interpretation, and AI-generated reconstruction.
3. **Conversation over consumption.** Every major experience should invite a question, response, practice, or contribution.
4. **Source before spectacle.** Show provenance and confidence wherever generated content is used.
5. **Accessible by default.** Captions, transcripts, keyboard navigation, clear language, and reduced-motion support are required.
6. **Curiosity without comparison rankings.** Compare connections and differences without scoring or reducing cultures to stereotypes.

## 7. Information architecture

1. **Discover** — search and featured cultures/languages
2. **Culture profile** — status, place, story, language, timeline, and available experiences
3. **Create** — documentary, museum tour, translation, and education materials
4. **Converse** — community-approved AI story companion
5. **Learn** — phrases, listening, speaking practice, lessons, quizzes
6. **Explore** — timeline and reconstructed environments
7. **Contribute** — community archive submission and stewardship settings
8. **Compare** — respectful cross-cultural learning
9. **Humanity** — global call to preserve another story

## 8. MVP demo scope

### P0 — must be interactive

#### Discover home

- Display the Living Voices name and tagline.
- Search placeholder: “Search a culture, language, or community…”
- Show six featured cultures: Jeju, Ainu, Nüshu, Quechua, Amazigh, and Māori.
- Selecting Ainu opens its profile. Other cards may show a “demo focuses on Ainu” message.

#### Ainu profile

- Show location and an endangered-status label as **placeholder content pending community review**.
- Show clear buttons for Story, Pronunciation, Phrases, Storyteller, Translate, Museum Tour, Documentary, and Story Companion.
- Display the emotional anchor: “Our stories live as long as someone is still listening.”

#### Documentary generator

- Inputs: audience, length, and language.
- Generate button starts a fake progress state.
- Sequential checklist: narration, music, historical photos, animation, subtitles.
- Finish with a simulated video preview and a visible “AI-generated concept” label.

#### Interactive storyteller

- Use a fictional, clearly labeled demo persona—not a replica of a real person.
- Present a short invitation to hear a story.
- Offer example child-friendly questions such as “Why?”, “What happened next?”, and “What does that word mean?”
- Return scripted responses and keep a visible note that production answers require community-approved sources.

### P1 — visible concept cards

- Teacher Mode with grade selection and output checklist.
- Language learning phrase with listen/practice controls and simulated feedback.
- Timeline with a 1900 reconstruction concept.
- Museum Mode entrance card.
- Community Archive contribution types.
- Compare Cultures card using Jeju + Māori as the example.

### P2 — future concept

- Real voice conversation and pronunciation scoring.
- Institution and community dashboards.
- Rights-aware archival ingestion and contributor approval workflow.
- Search across transcripts, collections, and oral histories.
- Multilingual generation with human review.
- Immersive 3D museum environments.

## 9. Key user flow

**Discover → Ainu profile → Generate documentary → Watch simulated result → Ask storyteller a question → Explore Education / Language / Timeline / Community / Compare**

The whole P0 flow should be understandable in under three minutes and work without sign-in.

## 10. Functional requirements

### Search and discovery

- Search filters the visible culture cards by name, region, or language keyword.
- Empty results provide a reset action.
- Featured cards are keyboard accessible.

### Generation experiences

- Every generated output is labeled as synthetic or reconstructed.
- The interface must not imply that historical photos, voices, translations, or reconstructions are authentic unless verified.
- A source/provenance entry point is visible on generated results in the production product.

### Community archive

- Contribution types: story, song, recipe, photograph, dance, oral history.
- Production upload flow must collect contributor identity/authority, consent, attribution, permitted uses, audience restrictions, AI-training permission, expiry/revocation conditions, and culturally sensitive access rules.
- Contributors must be able to withdraw or amend material.
- Public visibility and AI reuse are separate permissions.

### Compare Cultures

- Output categories: shared themes, distinct traditions, language connections, food, music, and beliefs/worldviews.
- Avoid “same/different” claims without sources and cultural review.
- Do not rank authenticity, development, complexity, or importance.

## 11. Content and cultural safety requirements

- Demo names, quotations, translations, speaker counts, language status, and pronunciations are placeholders until reviewed by relevant community partners and reliable sources.
- Never generate sacred, private, restricted, or gender/role-specific knowledge without explicit permission.
- A real person’s likeness or voice requires informed, revocable consent and clear compensation/benefit terms.
- The production storyteller should be framed as a **community-approved story companion**, not an “AI elder,” unless a community explicitly chooses that language.
- Every culture profile should show contributors, sources, review date, permitted uses, and a way to report concerns.
- Community reviewers have final editorial authority over their material.

## 12. Accessibility and localization

- Meet WCAG 2.2 AA for the production product.
- Full keyboard navigation and visible focus states.
- Captions and transcripts for all audio/video.
- Text alternatives for images and reconstructions.
- Do not rely on flag emoji as the only cultural identifier.
- Support right-to-left layouts and scripts beyond Latin.
- Respect reduced-motion preferences.

## 13. Success metrics

### Demo success

- A teammate can explain the concept and community-led principle after one walkthrough.
- At least 80% of test users can complete the Ainu → documentary flow without instruction.
- At least one interactive feature creates an emotional “I want this” response in qualitative testing.

### Pilot success

- Community partner approval and satisfaction.
- Percentage of public content with complete provenance and consent records.
- Learning completion and recall, not just time-on-site.
- Teacher reuse of generated materials after review.
- Corrections and withdrawal requests resolved within an agreed service level.

## 14. Technical approach for this demo

- One self-contained HTML file with embedded CSS and JavaScript.
- No backend and no external dependencies.
- Local scripted data for cultures, chat responses, and loading states.
- Fake generation progress; no AI, voice, upload, or video generation API.
- Responsive layout for laptop and mobile sharing.

## 15. Demo acceptance criteria

- Opens locally in a modern browser.
- Search visibly filters culture cards.
- Clicking Ainu opens the profile.
- Documentary generation accepts selections, shows progress, and ends in a mock video state.
- Story Companion accepts at least three suggested questions and returns scripted answers.
- Education, Language, Timeline, Museum, Community, and Compare concepts are visible.
- All simulated or unverified content is labeled clearly.
- No network connection is required.

## 16. Decisions needed after teammate review

1. First community and institutional partner.
2. Preferred term: “story companion,” “storyteller,” or community-selected alternative.
3. Which P1 feature best proves learning impact in a pilot.
4. Rights and consent model, including whether material may ever be used for model training.
5. Source and review standards for generated translations and reconstructions.
