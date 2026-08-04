from dataclasses import asdict
from decimal import Decimal
import json

from fastapi.testclient import TestClient
from pydantic import ValidationError
from pydantic_ai.usage import RunUsage
import pytest

from app import PhraseLearningResponse, WordLearningResponse, app, packet


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
