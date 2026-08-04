import json
import os
from collections.abc import AsyncIterator
from dataclasses import asdict
from typing import Literal

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.usage import UsageLimits


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
    title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    language: str = Field(min_length=1)
    featured_word: PhraseCard


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


model_name = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
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

app = FastAPI(title="Living Voices PydanticAI Agent", version="0.1.0")


def prompt_for(request: AgentRequest) -> str:
    culture = request.culture
    if request.action == "ask":
        if not request.question.strip():
            raise HTTPException(400, "Please enter a question.")
        return f"Culture or community: {culture}\nQuestion: {request.question}\nAnswer with a summary, two to four clear sections, and verification guidance."
    if request.action == "word":
        return f"Offer one well-attested everyday word or short expression connected to {culture}. Put it in featured_word. Name the specific language and variant. If no single language represents the community or you cannot choose confidently, explain that in the summary instead of guessing."
    if request.action == "phrases":
        return f"Create up to 10 beginner everyday phrases connected to {culture}. Put each in phrases with original writing, pronunciation, meaning, usage, and confidence. Name the language and variant. Do not fabricate to reach ten."
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
            async with agent.run_stream(
                prompt,
                output_type=output_type_for(request.action),
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
