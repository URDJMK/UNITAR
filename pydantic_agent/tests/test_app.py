from dataclasses import asdict
from decimal import Decimal
import json

from fastapi.testclient import TestClient
from pydantic import ValidationError
from pydantic_ai import PromptedOutput
from pydantic_ai.usage import RunUsage
import pytest

from app import (
    AgentRequest,
    PhraseLearningResponse,
    WordLearningResponse,
    app,
    output_type_for,
    packet,
    partial_learning_snapshot,
    partial_word_snapshot,
    prompt_for,
    streaming_output_type_for,
)


client = TestClient(app)


def test_health_identifies_pydantic_runtime() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["runtime"] == "pydantic-ai"


def test_stream_validates_required_question() -> None:
    response = client.post("/stream", json={"action": "ask", "culture": "Ainu"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Please enter a question."


def test_usage_serialization_matches_pydantic_ai_v2() -> None:
    usage = RunUsage(input_tokens=12, output_tokens=7, requests=1)
    assert asdict(usage)["input_tokens"] == 12
    assert asdict(usage)["output_tokens"] == 7
    assert asdict(usage)["requests"] == 1


def test_packet_serializes_decimal_usage_cost() -> None:
    payload = json.loads(packet("done", usage={"cost": Decimal("0.0042")}))
    assert payload["type"] == "done"
    assert payload["usage"]["cost"] == "0.0042"


def test_phrase_schema_rejects_an_empty_structured_response() -> None:
    with pytest.raises(ValidationError):
        PhraseLearningResponse.model_validate({})


def test_phrase_schema_requires_exactly_ten_items() -> None:
    phrase = {
        "original": "Hello",
        "pronunciation": "heh-LOH",
        "meaning": "A greeting",
        "usage": "Use when greeting someone.",
        "confidence": "high",
    }
    with pytest.raises(ValidationError):
        PhraseLearningResponse.model_validate(
            {
                "title": "Nine phrases",
                "summary": "This set is incomplete.",
                "language": "English",
                "phrases": [phrase] * 9,
            }
        )

    result = PhraseLearningResponse.model_validate(
        {
            "title": "Ten phrases",
            "summary": "This set is complete.",
            "language": "English",
            "phrases": [phrase] * 10,
        }
    )
    assert len(result.phrases) == 10


def test_word_schema_requires_a_featured_word() -> None:
    with pytest.raises(ValidationError):
        WordLearningResponse.model_validate(
            {"language": "Ainu", "cultural_habit": "People greet visitors warmly."}
        )


def test_word_schema_accepts_one_habit_and_one_phrase() -> None:
    result = WordLearningResponse.model_validate(
        {
            "language": "Ainu",
            "variant": "Saru Ainu",
            "cultural_habit": "Guests are welcomed with attentive conversation.",
            "featured_word": {
                "original": "Irankarapte",
                "meaning": "Hello",
                "usage": "A respectful greeting.",
            },
        }
    )
    assert result.cultural_habit
    assert result.featured_word.original == "Irankarapte"
    assert result.sections == []


def test_word_prompt_includes_format_and_sample_answer() -> None:
    prompt = prompt_for(AgentRequest(action="word", culture="Māori"))
    assert "Create a compact Living Word card for Māori" in prompt
    assert "RESPONSE FORMAT (required)" in prompt
    assert '"featured_word": {' in prompt
    assert '"cultural_habit":' in prompt
    assert "SAMPLE ANSWER" in prompt
    assert "never copy this content for another culture" in prompt


@pytest.mark.parametrize(
    "agent_request",
    [
        AgentRequest(action="ask", culture="Māori", question="How is the language learned today?"),
        AgentRequest(action="word", culture="Māori"),
        AgentRequest(action="phrases", culture="Māori"),
        AgentRequest(action="lesson", culture="Māori", grade="Grade 7"),
        AgentRequest(action="compare", culture="Māori", compareCulture="Ainu"),
        AgentRequest(
            action="translate",
            culture="Māori",
            text="Welcome, friends.",
            targetLanguage="te reo Māori",
        ),
        AgentRequest(action="timeline", culture="Māori", year="1950"),
        AgentRequest(action="museum", culture="Māori"),
        AgentRequest(action="archive", culture="Māori"),
    ],
    ids=[
        "ask",
        "word",
        "phrases",
        "lesson",
        "compare",
        "translate",
        "timeline",
        "museum",
        "archive",
    ],
)
def test_every_action_prompt_includes_a_format_and_sample(
    agent_request: AgentRequest,
) -> None:
    prompt = prompt_for(agent_request)
    assert "RESPONSE FORMAT (required)" in prompt
    assert "SAMPLE ANSWER" in prompt


def test_phrase_prompt_contains_a_complete_ten_item_sample() -> None:
    prompt = prompt_for(AgentRequest(action="phrases", culture="Ainu"))
    assert "Create exactly 10 compact beginner items" in prompt
    assert '"original": "Hello"' in prompt
    assert '"original": "See you again"' in prompt
    assert prompt.count('"original":') == 20


@pytest.mark.parametrize(
    "action",
    ["ask", "word", "phrases", "lesson", "compare", "translate", "timeline", "museum", "archive"],
)
def test_every_action_stream_uses_prompted_output_for_incremental_json(action) -> None:
    output = streaming_output_type_for(action)
    assert isinstance(output, PromptedOutput)
    assert output.outputs is output_type_for(action)
    assert output.template is False


def test_partial_word_snapshot_keeps_in_progress_text() -> None:
    snapshot = partial_word_snapshot(
        '{"title":"","summary":"","language":"Māori","variant":"Northern",'
        '"featured_word":{"original":"Kia o'
    )
    assert snapshot is not None
    assert snapshot["language"] == "Māori"
    assert snapshot["featured_word"]["original"] == "Kia o"
    assert snapshot["cultural_habit"] == ""


def test_partial_word_snapshot_ignores_non_json_text() -> None:
    assert partial_word_snapshot("Here is the response:") is None


def test_partial_word_snapshot_streams_through_a_json_code_fence() -> None:
    snapshot = partial_word_snapshot(
        '```json\n{"language":"Ainu","featured_word":{"original":"Iyayra'
    )
    assert snapshot is not None
    assert snapshot["featured_word"]["original"] == "Iyayra"


def test_partial_question_snapshot_streams_an_in_progress_summary() -> None:
    snapshot = partial_learning_snapshot(
        '{"title":"Ainu today","summary":"A living commu',
        "ask",
    )
    assert snapshot is not None
    assert snapshot["title"] == "Ainu today"
    assert snapshot["summary"] == "A living commu"


def test_partial_phrase_snapshot_streams_cards_before_completion() -> None:
    snapshot = partial_learning_snapshot(
        '{"title":"10 Ainu phrases","language":"Ainu","phrases":['
        '{"original":"Irankarapte","meaning":"Hello"},'
        '{"original":"Iyairay',
        "phrases",
    )
    assert snapshot is not None
    assert len(snapshot["phrases"]) == 2
    assert snapshot["phrases"][1]["original"] == "Iyairay"
