# Living Voices

Living Voices is a community-led cultural learning prototype. It combines a
Next.js/vinext interface with a streaming PydanticAI service backed by Claude.
Short-film creation remains a clearly labeled demo; phrase learning, questions,
lesson kits, translation, comparison, timeline context, museum guidance, and
archive planning use live LLM responses.

## Local setup

Requirements:

- Node.js 22.13 or newer
- Python 3.11–3.14
- [uv](https://docs.astral.sh/uv/)
- An Anthropic API key

Copy `.env.example` to `.env.local`, set `ANTHROPIC_API_KEY`, and add the local
agent URL:

```dotenv
ANTHROPIC_API_KEY=your-server-only-key
ANTHROPIC_MODEL=claude-sonnet-5
PYDANTIC_AGENT_URL=http://127.0.0.1:8100
```

Start the Python agent:

```bash
cd pydantic_agent
uv sync
uv run uvicorn app:app --host 127.0.0.1 --port 8100
```

In another terminal, start the web app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Streaming architecture

- PydanticAI uses action-specific Pydantic output types so phrase, word, lesson,
  and narrative requests cannot finish with the wrong response shape.
- `Agent.run_stream()` and `stream_output()` emit accumulated, partially
  validated snapshots as NDJSON.
- `/api/ai` proxies the Python stream without exposing credentials or the
  service URL to the browser.
- `/api/living-word` is a separate compact experience that returns one everyday
  cultural habit and one useful phrase without the full lesson explanation.
- The browser safely renders model data into phrase cards, pronunciation and
  usage fields, content sections, confidence labels, and verification callouts.
- If `PYDANTIC_AGENT_URL` is absent, `/api/ai` falls back to Anthropic's native
  text stream and renders safe Markdown-like headings and lists.

## Tests

```bash
npm run lint
npm test
cd pydantic_agent && uv run pytest
```

## Deployment

The web app is configured for OpenAI Sites. `render.yaml` describes the Python
PydanticAI service. After deploying that service, set `PYDANTIC_AGENT_URL` and
the matching `PYDANTIC_AGENT_SECRET` in the web host environment.

See [PRD.md](./PRD.md) for product scope, cultural-safety principles, and
acceptance criteria.
