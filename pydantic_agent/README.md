# Living Voices PydanticAI agent

This Python service owns typed Claude interactions for Living Voices. It uses
PydanticAI `Agent.run_stream()` and `stream_output()` to emit validated,
accumulated `LearningResponse` snapshots as newline-delimited JSON.

## Local development

```bash
uv sync
uv run uvicorn app:app --host 127.0.0.1 --port 8100
```

Required environment variables:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (defaults to `claude-sonnet-5`)
- `PYDANTIC_AGENT_SECRET` for a hosted service

The Next.js app proxies `/api/ai` to this service when
`PYDANTIC_AGENT_URL` is configured.
