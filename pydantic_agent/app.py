import json
import os
from collections.abc import AsyncIterator
from dataclasses import asdict
from typing import Literal

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pydantic_ai import (
    Agent,
    AgentRunResultEvent,
    PartDeltaEvent,
    PartStartEvent,
    PromptedOutput,
    TextPart,
    TextPartDelta,
)
from pydantic_ai.usage import UsageLimits
from pydantic_core import from_json


Action = Literal[
    "ask",
    "word",
    "phrases",
    "lesson",
    "compare",
    "translate",
    "timeline",
    "museum",
    "archive",
]


class AgentRequest(BaseModel):
    action: Action
    culture: str = Field(min_length=1, max_length=80)
    question: str = Field(default="", max_length=1200)
    grade: str = Field(default="Middle school", max_length=40)
    compareCulture: str = Field(default="", max_length=80)
    text: str = Field(default="", max_length=3000)
    targetLanguage: str = Field(default="English", max_length=60)
    year: str = Field(default="", max_length=12)


class PhraseCard(BaseModel):
    original: str = ""
    pronunciation: str = ""
    meaning: str = ""
    usage: str = ""
    confidence: Literal["high", "medium", "verify"] = "verify"


class CompactPhraseCard(PhraseCard):
    original: str = Field(min_length=1, max_length=80)
    pronunciation: str = Field(default="", max_length=100)
    meaning: str = Field(min_length=1, max_length=120)
    usage: str = Field(default="", max_length=160)


class ContentSection(BaseModel):
    heading: str = ""
    body: str = ""
    bullets: list[str] = Field(default_factory=list)


class LearningResponse(BaseModel):
    title: str = ""
    summary: str = ""
    language: str = ""
    variant: str = ""
    featured_word: PhraseCard | None = None
    phrases: list[PhraseCard] = Field(default_factory=list, max_length=10)
    sections: list[ContentSection] = Field(default_factory=list, max_length=10)
    verification: list[str] = Field(default_factory=list, max_length=6)
    disclaimer: str = "AI-generated learning aid — verify with community-led and primary sources."


class WordLearningResponse(LearningResponse):
    language: str = Field(min_length=1)
    variant: str = Field(default="", max_length=60)
    featured_word: CompactPhraseCard
    cultural_habit: str = Field(min_length=1, max_length=180)


class PhraseLearningResponse(LearningResponse):
    title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    language: str = Field(min_length=1)
    phrases: list[PhraseCard] = Field(min_length=10, max_length=10)


class SectionLearningResponse(LearningResponse):
    title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    sections: list[ContentSection] = Field(min_length=1, max_length=10)


class NarrativeLearningResponse(LearningResponse):
    title: str = Field(min_length=1)
    summary: str = Field(min_length=1)


INSTRUCTIONS = """You are the Living Voices learning guide. You help people approach living cultures and languages with curiosity, humility, and respect.

Return a useful, visually scannable LearningResponse that fits the requested experience.

Rules:
- You are an AI learning aid, not a community member, elder, cultural authority, or primary source.
- Never invent quotations, ceremonies, sacred knowledge, private practices, or claims of community consensus.
- Say clearly when facts, spellings, pronunciation, translations, or language status may vary or need verification.
- Use the community's preferred name when known. Do not call every Indigenous people a tribe.
- Do not rank cultures or flatten meaningful differences.
- For the phrases experience, return exactly ten compact, public, everyday items. Prefer short phrases; when a full phrase is uncertain, use a well-attested useful word and mark confidence as verify rather than inventing.
- Put major content in sections and bullets, not one long paragraph.
- Put concrete verification advice in the verification list.
- Keep the disclaimer intact.
"""


WORD_RESPONSE_GUIDE = """RESPONSE FORMAT (required)
Populate exactly one structured response with this shape. Return raw JSON, not Markdown or a code fence. Use empty arrays and empty strings exactly where shown; do not add fields or prose outside the response.

{
  "title": "",
  "summary": "",
  "language": "Specific language name",
  "variant": "Specific variant or Varies by community",
  "featured_word": {
    "original": "One phrase in its original writing",
    "pronunciation": "One short pronunciation hint",
    "meaning": "One short English meaning",
    "usage": "One short usage note",
    "confidence": "high, medium, or verify"
  },
  "phrases": [],
  "sections": [],
  "verification": [],
  "disclaimer": "AI-generated learning aid — verify with community-led and primary sources.",
  "cultural_habit": "One public, everyday, non-sacred cultural habit in one sentence"
}

SAMPLE ANSWER (Ainu example; copy the format, never copy this content for another culture)
{
  "title": "",
  "summary": "",
  "language": "Ainu",
  "variant": "Varies by community",
  "featured_word": {
    "original": "Iyairaykere",
    "pronunciation": "ee-yai-rai-keh-reh",
    "meaning": "Thank you",
    "usage": "Used to express sincere gratitude.",
    "confidence": "verify"
  },
  "phrases": [],
  "sections": [],
  "verification": [],
  "disclaimer": "AI-generated learning aid — verify with community-led and primary sources.",
  "cultural_habit": "Traditional embroidery is practiced as a living art in many Ainu communities."
}
"""


DISCLAIMER = "AI-generated learning aid — verify with community-led and primary sources."


def phrase_item(
    original: str,
    pronunciation: str,
    meaning: str,
    usage: str,
    confidence: Literal["high", "medium", "verify"] = "high",
) -> dict[str, str]:
    return {
        "original": original,
        "pronunciation": pronunciation,
        "meaning": meaning,
        "usage": usage,
        "confidence": confidence,
    }


PHRASE_RESPONSE_SHAPE = [
    phrase_item(
        f"Phrase {index} in original writing",
        f"Short pronunciation {index}",
        f"Short English meaning {index}",
        f"One-line everyday context {index}",
        "verify",
    )
    for index in range(1, 11)
]


ENGLISH_PHRASE_SAMPLE = [
    phrase_item("Hello", "heh-LOH", "A greeting", "Use when greeting someone."),
    phrase_item("Good morning", "good MOR-ning", "A morning greeting", "Use earlier in the day."),
    phrase_item("Thank you", "thank yoo", "An expression of gratitude", "Use after receiving help."),
    phrase_item("Please", "pleez", "A polite request marker", "Use when making a request."),
    phrase_item("Excuse me", "ik-SKYOOZ mee", "A polite way to get attention", "Use before interrupting."),
    phrase_item("How are you?", "how ar yoo", "A wellbeing question", "Use in a friendly greeting."),
    phrase_item("I am well", "eye am well", "A positive reply", "Use when answering a wellbeing question."),
    phrase_item("What is your name?", "what iz yor naym", "A question about someone's name", "Use during an introduction."),
    phrase_item("Goodbye", "good-BYE", "A farewell", "Use when leaving."),
    phrase_item("See you again", "see yoo uh-GEN", "A future-facing farewell", "Use when you expect to meet again."),
]


def response_guide(
    response_shape: dict[str, object],
    sample_label: str,
    sample_answer: dict[str, object],
) -> str:
    return f"""RESPONSE FORMAT (required)
Return raw JSON matching this shape, not Markdown or a code fence. Replace the descriptive values with the answer. Do not add prose outside the JSON.

{json.dumps(response_shape, ensure_ascii=False, indent=2)}

SAMPLE ANSWER ({sample_label}; copy the format, never copy the content into another answer)
{json.dumps(sample_answer, ensure_ascii=False, indent=2)}
"""


ACTION_RESPONSE_GUIDES: dict[Action, str] = {
    "ask": response_guide(
        {
            "title": "Short answer title",
            "summary": "Direct answer in one or two sentences",
            "sections": [
                {
                    "heading": "Clear section heading",
                    "body": "Short explanation",
                    "bullets": ["Concrete supporting point"],
                }
            ],
            "verification": ["Specific way to verify this answer"],
            "disclaimer": DISCLAIMER,
        },
        "format-only example about language learning",
        {
            "title": "How language learning continues",
            "summary": "Language learning can continue through families, schools, and community-led programs.",
            "sections": [
                {
                    "heading": "Learning today",
                    "body": "Methods differ by community and should be described using current community sources.",
                    "bullets": ["Look for classes or resources led by speakers and educators."],
                }
            ],
            "verification": ["Check a current community language-program website."],
            "disclaimer": DISCLAIMER,
        },
    ),
    "phrases": response_guide(
        {
            "title": "10 useful phrases",
            "summary": "One useful learning note of no more than 24 words",
            "language": "Specific language name",
            "variant": "Specific variant in no more than 12 words, or Varies by community",
            "phrases": PHRASE_RESPONSE_SHAPE,
            "verification": ["One specific language source or community review step"],
            "disclaimer": DISCLAIMER,
        },
        "complete English format example; copy all ten slots, never copy its content",
        {
            "title": "10 useful English phrases",
            "summary": "Ten compact everyday examples in the required card format.",
            "language": "English",
            "variant": "General international English",
            "phrases": ENGLISH_PHRASE_SAMPLE,
            "verification": ["Confirm local pronunciation and usage with a fluent speaker."],
            "disclaimer": DISCLAIMER,
        },
    ),
    "lesson": response_guide(
        {
            "title": "35-minute lesson title",
            "summary": "Age-appropriate lesson overview",
            "sections": [
                {
                    "heading": "Objectives, activity, key ideas, quiz, or reflection",
                    "body": "Short teaching guidance",
                    "bullets": ["Classroom-ready item"],
                }
            ],
            "verification": ["Source teachers and learners should review"],
            "disclaimer": DISCLAIMER,
        },
        "format-only lesson excerpt",
        {
            "title": "Learning from living voices",
            "summary": "Students practice distinguishing community sources from outside interpretation.",
            "sections": [
                {
                    "heading": "Learning objective",
                    "body": "Students identify who created a source and whose perspective it represents.",
                    "bullets": ["Compare one community-led source with one museum description."],
                },
                {
                    "heading": "Reflection",
                    "body": "Invite students to name one question that still needs verification.",
                    "bullets": [],
                },
            ],
            "verification": ["Use a current source published or reviewed by the community."],
            "disclaimer": DISCLAIMER,
        },
    ),
    "compare": response_guide(
        {
            "title": "Respectful comparison title",
            "summary": "Shared theme plus an important limit on comparison",
            "sections": [
                {
                    "heading": "Living context, language, place, arts, similarities, or differences",
                    "body": "Balanced comparison",
                    "bullets": ["Specific point for each community"],
                }
            ],
            "verification": ["Community-led source for each community"],
            "disclaimer": DISCLAIMER,
        },
        "format-only comparison excerpt",
        {
            "title": "Two distinct living communities",
            "summary": "A shared theme can support learning, but it does not make two cultures equivalent.",
            "sections": [
                {
                    "heading": "Important differences",
                    "body": "Describe each community on its own terms before drawing a comparison.",
                    "bullets": ["Name the specific place, language, and source behind each point."],
                }
            ],
            "verification": ["Check one current community-led source for each side of the comparison."],
            "disclaimer": DISCLAIMER,
        },
    ),
    "translate": response_guide(
        {
            "title": "Translation into the requested language",
            "summary": "The translation itself",
            "language": "Target language",
            "variant": "Variant or Varies by community",
            "sections": [
                {
                    "heading": "Tone or ambiguity",
                    "body": "Short note about choices or uncertainty",
                    "bullets": [],
                }
            ],
            "verification": ["Specific reason or source for speaker review"],
            "disclaimer": DISCLAIMER,
        },
        "format-only translation example",
        {
            "title": "Translation into the requested language",
            "summary": "[Translated text appears here first.]",
            "language": "Requested language",
            "variant": "Varies by community",
            "sections": [
                {
                    "heading": "Tone and ambiguity",
                    "body": "This wording aims for a warm, everyday tone; a fluent speaker should confirm the local variant.",
                    "bullets": [],
                }
            ],
            "verification": ["Ask a fluent speaker to review meaning, tone, and variant."],
            "disclaimer": DISCLAIMER,
        },
    ),
    "timeline": response_guide(
        {
            "title": "Community around the requested year",
            "summary": "Two-sentence historical context",
            "sections": [
                {
                    "heading": "Broader context, continuity, change, or verification",
                    "body": "Short, dated context",
                    "bullets": ["Specific fact with a cautious scope"],
                }
            ],
            "verification": ["Archive or community history source to consult"],
            "disclaimer": DISCLAIMER,
        },
        "format-only timeline excerpt",
        {
            "title": "A community in historical context",
            "summary": "A date is one viewpoint into a continuing community, not a complete portrait.",
            "sections": [
                {
                    "heading": "Community continuity",
                    "body": "Explain what people maintained and adapted, while noting regional differences.",
                    "bullets": ["Connect the historical moment to present-day community life."],
                }
            ],
            "verification": ["Compare community histories with the relevant archival record."],
            "disclaimer": DISCLAIMER,
        },
    ),
    "museum": response_guide(
        {
            "title": "Audio-guide introduction",
            "summary": "A short invitation to listen and look responsibly",
            "sections": [
                {
                    "heading": "Objects, interpretation, provenance, consent, or living community",
                    "body": "Visitor-facing guidance",
                    "bullets": ["Question visitors can ask"],
                }
            ],
            "verification": ["Museum or community information to verify"],
            "disclaimer": DISCLAIMER,
        },
        "format-only audio-guide excerpt",
        {
            "title": "Begin with the people, not the object",
            "summary": "Treat the display as one interpretation and look for the community voices connected to it.",
            "sections": [
                {
                    "heading": "Questions to carry",
                    "body": "Provenance and consent shape how an object should be understood and shown.",
                    "bullets": ["Who authorized its collection and display?", "How does the community describe it today?"],
                }
            ],
            "verification": ["Read the museum's provenance record alongside a community-led source."],
            "disclaimer": DISCLAIMER,
        },
    ),
    "archive": response_guide(
        {
            "title": "Contribution and consent checklist",
            "summary": "Purpose and review status of this draft",
            "sections": [
                {
                    "heading": "Authority, attribution, access, reuse, review, or governance",
                    "body": "Short explanation",
                    "bullets": ["Actionable checkbox item"],
                }
            ],
            "verification": ["Community and legal review step"],
            "disclaimer": DISCLAIMER,
        },
        "format-only archive checklist excerpt",
        {
            "title": "Community archive consent checklist",
            "summary": "This draft separates public access, reuse, and AI-training permission for community and legal review.",
            "sections": [
                {
                    "heading": "Contributor authority",
                    "body": "Confirm that the contributor has the right to share the material.",
                    "bullets": ["☐ Record who owns or stewards the item.", "☐ Record any culturally restricted access."],
                },
                {
                    "heading": "AI-training permission",
                    "body": "Treat AI training as a separate, optional decision.",
                    "bullets": ["☐ Yes", "☐ No", "☐ Revisit later"],
                },
            ],
            "verification": ["Have community governance and legal reviewers approve the final form."],
            "disclaimer": DISCLAIMER,
        },
    ),
}


model_name = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")
agent = Agent(
    f"anthropic:{model_name}",
    output_type=LearningResponse,
    instructions=INSTRUCTIONS,
    retries={"output": 2},
    defer_model_check=True,
)


def output_type_for(action: Action) -> type[LearningResponse]:
    if action == "word":
        return WordLearningResponse
    if action == "phrases":
        return PhraseLearningResponse
    if action in {"lesson", "compare", "timeline", "museum", "archive"}:
        return SectionLearningResponse
    return NarrativeLearningResponse


def streaming_output_type_for(action: Action):
    # PromptedOutput makes Claude stream JSON text instead of waiting for a
    # completed Anthropic output-tool call. The text is parsed into display
    # snapshots below and PydanticAI performs full validation at completion.
    return PromptedOutput(output_type_for(action), template=False)


def partial_json_object(text: str) -> dict[str, object] | None:
    json_text = text.lstrip()
    if json_text.startswith("```"):
        first_line_end = json_text.find("\n")
        if first_line_end < 0:
            return None
        json_text = json_text[first_line_end + 1 :]
    if "\n```" in json_text:
        json_text = json_text.split("\n```", 1)[0]

    try:
        data = from_json(json_text, allow_partial="trailing-strings")
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def partial_text(value: object, max_length: int) -> str:
    return value[:max_length] if isinstance(value, str) else ""


def partial_phrase(value: object) -> dict[str, str] | None:
    if not isinstance(value, dict):
        return None
    confidence = partial_text(value.get("confidence"), 12)
    if confidence not in {"high", "medium", "verify"}:
        confidence = "verify"
    phrase = {
        "original": partial_text(value.get("original"), 120),
        "pronunciation": partial_text(value.get("pronunciation"), 140),
        "meaning": partial_text(value.get("meaning"), 180),
        "usage": partial_text(value.get("usage"), 240),
        "confidence": confidence,
    }
    return phrase if any(phrase[key] for key in ("original", "pronunciation", "meaning", "usage")) else None


def partial_section(value: object) -> dict[str, object] | None:
    if not isinstance(value, dict):
        return None
    bullets = value.get("bullets")
    section = {
        "heading": partial_text(value.get("heading"), 160),
        "body": partial_text(value.get("body"), 2000),
        "bullets": [partial_text(item, 500) for item in bullets[:20] if isinstance(item, str)]
        if isinstance(bullets, list)
        else [],
    }
    return section if section["heading"] or section["body"] or section["bullets"] else None


def partial_word_snapshot(text: str) -> dict[str, object] | None:
    data = partial_json_object(text)
    if data is None:
        return None

    featured_data = partial_phrase(data.get("featured_word"))

    cultural_habit = partial_text(data.get("cultural_habit"), 180)
    if featured_data is None and not cultural_habit:
        return None

    return {
        "title": "",
        "summary": "",
        "language": partial_text(data.get("language"), 80),
        "variant": partial_text(data.get("variant"), 60),
        "featured_word": featured_data,
        "phrases": [],
        "sections": [],
        "verification": [],
        "disclaimer": "AI-generated learning aid — verify with community-led and primary sources.",
        "cultural_habit": cultural_habit,
    }


def partial_learning_snapshot(text: str, action: Action) -> dict[str, object] | None:
    if action == "word":
        return partial_word_snapshot(text)

    data = partial_json_object(text)
    if data is None:
        return None

    phrases_value = data.get("phrases")
    phrases = (
        [phrase for item in phrases_value[:10] if (phrase := partial_phrase(item)) is not None]
        if isinstance(phrases_value, list)
        else []
    )
    sections_value = data.get("sections")
    sections = (
        [section for item in sections_value[:10] if (section := partial_section(item)) is not None]
        if isinstance(sections_value, list)
        else []
    )
    verification_value = data.get("verification")
    verification = (
        [partial_text(item, 500) for item in verification_value[:6] if isinstance(item, str)]
        if isinstance(verification_value, list)
        else []
    )
    snapshot: dict[str, object] = {
        "title": partial_text(data.get("title"), 200),
        "summary": partial_text(data.get("summary"), 2400),
        "language": partial_text(data.get("language"), 80),
        "variant": partial_text(data.get("variant"), 100),
        "featured_word": partial_phrase(data.get("featured_word")),
        "phrases": phrases,
        "sections": sections,
        "verification": verification,
        "disclaimer": partial_text(data.get("disclaimer"), 240) or DISCLAIMER,
    }
    visible = any(
        (
            snapshot["title"],
            snapshot["summary"],
            snapshot["language"],
            snapshot["variant"],
            snapshot["featured_word"],
            phrases,
            sections,
            verification,
        )
    )
    return snapshot if visible else None


async def stream_learning_response(prompt: str, action: Action) -> AsyncIterator[bytes]:
    text_buffer = ""
    last_snapshot = ""
    completed = False

    async with agent.run_stream_events(
        prompt,
        output_type=streaming_output_type_for(action),
        usage_limits=UsageLimits(request_limit=3),
    ) as stream_events:
        async for event in stream_events:
            text_changed = False
            if isinstance(event, PartStartEvent) and isinstance(event.part, TextPart):
                text_buffer = event.part.content
                text_changed = True
            elif isinstance(event, PartDeltaEvent) and isinstance(
                event.delta, TextPartDelta
            ):
                text_buffer += event.delta.content_delta
                text_changed = True

            if text_changed:
                snapshot = partial_learning_snapshot(text_buffer, action)
                if snapshot is not None:
                    serialized = json.dumps(snapshot, ensure_ascii=False, sort_keys=True)
                    if serialized != last_snapshot:
                        last_snapshot = serialized
                        yield packet("snapshot", data=snapshot)

            if isinstance(event, AgentRunResultEvent):
                output = event.result.output
                expected_output = output_type_for(action)
                if not isinstance(output, expected_output):
                    output = expected_output.model_validate(output)
                final_data = output.model_dump(mode="json")
                yield packet(
                    "done",
                    data=final_data,
                    usage=asdict(event.result.usage),
                )
                completed = True

    if not completed:
        yield packet("error", error="The agent returned no validated output.")

app = FastAPI(title="Living Voices PydanticAI Agent", version="0.1.0")


def prompt_for(request: AgentRequest) -> str:
    culture = request.culture
    if request.action == "ask":
        if not request.question.strip():
            raise HTTPException(400, "Please enter a question.")
        return f"""Culture or community: {culture}
Question: {request.question}
Answer with a summary, two to four clear sections, and verification guidance.

{ACTION_RESPONSE_GUIDES["ask"]}"""
    if request.action == "word":
        return f"""Create a compact Living Word card for {culture}.

Put exactly one public, everyday, non-sacred cultural habit in cultural_habit and exactly one well-attested useful phrase in featured_word. Name the language and keep variant under five words. Keep the habit to one sentence and every phrase field to one short line. Leave title, summary, phrases, sections, and verification empty. Do not add history, explanation, sources, or extra context. If the phrase is uncertain, write "Community verification needed" rather than guessing.

{WORD_RESPONSE_GUIDE}"""
    if request.action == "phrases":
        return f"""Create exactly 10 compact beginner items connected to {culture}. Prefer public, everyday phrases; if a full phrase is uncertain, use a well-attested useful word instead of stopping early or inventing. Put exactly ten objects in phrases, numbered by array order. Keep summary under 24 words, variant under 12 words, and each phrase field to one short line. Do not put confidence levels or disclaimers in the title, summary, or phrase text. Do not add a history lesson or a long introduction.

{ACTION_RESPONSE_GUIDES["phrases"]}"""
    if request.action == "lesson":
        return f"""Create a 35-minute lesson kit about {culture} for {request.grade}. Use sections for objectives, opening, key ideas, source evaluation, five quiz questions with answers, and reflection. Avoid role-playing sacred practices.

{ACTION_RESPONSE_GUIDES["lesson"]}"""
    if request.action == "compare":
        if not request.compareCulture.strip():
            raise HTTPException(400, "Choose a second culture to compare.")
        return f"""Compare {culture} and {request.compareCulture} respectfully. Use sections for living context, language, relationships to place, arts or storytelling, shared themes, important differences, and verification. Avoid unsupported claims of equivalence, ancestry, or borrowing.

{ACTION_RESPONSE_GUIDES["compare"]}"""
    if request.action == "translate":
        if not request.text.strip():
            raise HTTPException(400, "Enter text to translate.")
        return f"""Translate this text into {request.targetLanguage}:

{request.text}

Use cultural context related to {culture} only when relevant. Put the translation in summary and ambiguity or variant notes in sections.

{ACTION_RESPONSE_GUIDES["translate"]}"""
    if request.action == "timeline":
        if not request.year.strip():
            raise HTTPException(400, "Choose a timeline year.")
        return f"""Give historical context for {culture} around {request.year}. Use sections for broader context, community continuity, what changed, and what needs verification.

{ACTION_RESPONSE_GUIDES["timeline"]}"""
    if request.action == "museum":
        return f"""Create a responsible museum audio-guide introduction to {culture}. Use sections for how to approach objects, community knowledge versus museum interpretation, provenance, consent, and present-day community life.

{ACTION_RESPONSE_GUIDES["museum"]}"""
    return f"""Create a practical contribution and consent checklist for a community archive connected to {culture}. Cover contributor authority, attribution, visibility, restricted access, AI-training permission as a separate choice, reuse, review, withdrawal, and governance.

{ACTION_RESPONSE_GUIDES["archive"]}"""


def packet(kind: str, **payload: object) -> bytes:
    return (
        json.dumps({"type": kind, **payload}, ensure_ascii=False, default=str) + "\n"
    ).encode()


def require_shared_secret(value: str | None) -> None:
    expected = os.getenv("PYDANTIC_AGENT_SECRET", "")
    if expected and value != expected:
        raise HTTPException(401, "Invalid agent secret.")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "runtime": "pydantic-ai", "model": model_name}


@app.post("/stream")
async def stream(
    request: AgentRequest,
    x_agent_secret: str | None = Header(default=None),
) -> StreamingResponse:
    require_shared_secret(x_agent_secret)
    prompt = prompt_for(request)

    async def events() -> AsyncIterator[bytes]:
        yield packet("meta", action=request.action, runtime="pydantic-ai", model=model_name)
        try:
            async for event in stream_learning_response(prompt, request.action):
                yield event
        except Exception as error:
            yield packet("error", error=str(error))

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"cache-control": "no-store", "x-accel-buffering": "no"},
    )
