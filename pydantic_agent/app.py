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
    phrases: list[PhraseCard] = Field(min_length=1, max_length=10)


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
- For language examples, name the language or variant and provide fewer items if you cannot give ten confidently.
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
    if action == "word":
        # PromptedOutput makes Claude stream JSON text instead of waiting for a
        # completed Anthropic output-tool call. The text is parsed into display
        # snapshots below and PydanticAI performs full validation at completion.
        return PromptedOutput(WordLearningResponse, template=False)
    return output_type_for(action)


def partial_word_snapshot(text: str) -> dict[str, object] | None:
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
    if not isinstance(data, dict):
        return None

    featured = data.get("featured_word")
    featured_data: dict[str, str] | None = None
    if isinstance(featured, dict) and str(featured.get("original", "")):
        confidence = str(featured.get("confidence", "verify"))
        if confidence not in {"high", "medium", "verify"}:
            confidence = "verify"
        featured_data = {
            "original": str(featured.get("original", ""))[:80],
            "pronunciation": str(featured.get("pronunciation", ""))[:100],
            "meaning": str(featured.get("meaning", ""))[:120],
            "usage": str(featured.get("usage", ""))[:160],
            "confidence": confidence,
        }

    cultural_habit = str(data.get("cultural_habit", ""))[:180]
    if featured_data is None and not cultural_habit:
        return None

    return {
        "title": "",
        "summary": "",
        "language": str(data.get("language", ""))[:80],
        "variant": str(data.get("variant", ""))[:60],
        "featured_word": featured_data,
        "phrases": [],
        "sections": [],
        "verification": [],
        "disclaimer": "AI-generated learning aid — verify with community-led and primary sources.",
        "cultural_habit": cultural_habit,
    }


async def stream_word_response(prompt: str) -> AsyncIterator[bytes]:
    text_buffer = ""
    last_snapshot = ""
    completed = False

    async with agent.run_stream_events(
        prompt,
        output_type=streaming_output_type_for("word"),
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
                snapshot = partial_word_snapshot(text_buffer)
                if snapshot is not None:
                    serialized = json.dumps(snapshot, ensure_ascii=False, sort_keys=True)
                    if serialized != last_snapshot:
                        last_snapshot = serialized
                        yield packet("snapshot", data=snapshot)

            if isinstance(event, AgentRunResultEvent):
                output = event.result.output
                if not isinstance(output, WordLearningResponse):
                    output = WordLearningResponse.model_validate(output)
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
        return f"Culture or community: {culture}\nQuestion: {request.question}\nAnswer with a summary, two to four clear sections, and verification guidance."
    if request.action == "word":
        return f"""Create a compact Living Word card for {culture}.

Put exactly one public, everyday, non-sacred cultural habit in cultural_habit and exactly one well-attested useful phrase in featured_word. Name the language and keep variant under five words. Keep the habit to one sentence and every phrase field to one short line. Leave title, summary, phrases, sections, and verification empty. Do not add history, explanation, sources, or extra context. If the phrase is uncertain, write "Community verification needed" rather than guessing.

{WORD_RESPONSE_GUIDE}"""
    if request.action == "phrases":
        return f"Create up to 10 beginner everyday phrases connected to {culture}. Put each in phrases with original writing, pronunciation, meaning, usage, and confidence. Name the language and variant. Do not fabricate to reach ten. MUST PROVIDE TEN PHRASES."
    if request.action == "lesson":
        return f"Create a 35-minute lesson kit about {culture} for {request.grade}. Use sections for objectives, opening, key ideas, source evaluation, five quiz questions with answers, and reflection. Avoid role-playing sacred practices."
    if request.action == "compare":
        if not request.compareCulture.strip():
            raise HTTPException(400, "Choose a second culture to compare.")
        return f"Compare {culture} and {request.compareCulture} respectfully. Use sections for living context, language, relationships to place, arts or storytelling, shared themes, important differences, and verification. Avoid unsupported claims of equivalence, ancestry, or borrowing."
    if request.action == "translate":
        if not request.text.strip():
            raise HTTPException(400, "Enter text to translate.")
        return f"Translate this text into {request.targetLanguage}:\n\n{request.text}\n\nUse cultural context related to {culture} only when relevant. Put the translation in summary and ambiguity or variant notes in sections."
    if request.action == "timeline":
        if not request.year.strip():
            raise HTTPException(400, "Choose a timeline year.")
        return f"Give historical context for {culture} around {request.year}. Use sections for broader context, community continuity, what changed, and what needs verification."
    if request.action == "museum":
        return f"Create a responsible museum audio-guide introduction to {culture}. Use sections for how to approach objects, community knowledge versus museum interpretation, provenance, consent, and present-day community life."
    return f"Create a practical contribution and consent checklist for a community archive connected to {culture}. Cover contributor authority, attribution, visibility, restricted access, AI-training permission as a separate choice, reuse, review, withdrawal, and governance."


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
            if request.action == "word":
                async for event in stream_word_response(prompt):
                    yield event
                return

            async with agent.run_stream(
                prompt,
                output_type=streaming_output_type_for(request.action),
                usage_limits=UsageLimits(request_limit=3),
            ) as result:
                latest: LearningResponse | None = None
                async for snapshot in result.stream_output(debounce_by=0.06):
                    latest = snapshot
                    yield packet("snapshot", data=snapshot.model_dump(mode="json"))

                if latest is not None:
                    yield packet(
                        "done",
                        data=latest.model_dump(mode="json"),
                        usage=asdict(result.usage),
                    )
                else:
                    yield packet("error", error="The agent returned no validated output.")
        except Exception as error:
            yield packet("error", error=str(error))

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"cache-control": "no-store", "x-accel-buffering": "no"},
    )
