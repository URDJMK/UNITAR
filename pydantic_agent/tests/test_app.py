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
    packet,
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


def test_word_stream_uses_prompted_output_for_incremental_json() -> None:
    output = streaming_output_type_for("word")
    assert isinstance(output, PromptedOutput)
    assert output.outputs is WordLearningResponse
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
