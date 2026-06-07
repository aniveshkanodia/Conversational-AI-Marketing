# Project Notes

## Deployment plan

- **Phase 1 (local):** Run with `npm run dev`. LLM calls go through **Ollama** (`LLM_PROVIDER=ollama`). Requires Ollama installed and running (`ollama serve`). Default model: `llama3.2` (override via `OLLAMA_MODEL`).
- **Phase 2 (Vercel):** Set `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` in Vercel environment variables. Ollama is not available on Vercel.

## UX decisions

- **Recommendations:** Show results dashboard after query analysis (+ optional GEO audit). Fetch `/api/recommendations` in the background; section 5 shows a loading skeleton until ready.
- **BriefForm:** Pre-filled with Hoka / running shoes / SEO·GEO Manager example. User can edit before submit.

## LLM architecture

All LLM calls go through `lib/llm.ts` (server-side only, from API routes). Prompts live in `lib/prompts.ts`. Provider is selected via `LLM_PROVIDER` env var — never exposed to the client.
