# AI Brand Positioning

A web tool that shows marketing professionals how their brand is positioned inside AI chatbots — visibility, associations, competitive gaps, and GEO content recommendations grounded in the Princeton GEO paper (KDD '24).

Built as a Profound AI Strategist application demo.

## What it does

1. **Brief** — Enter brand, category, role, optional competitors and product content
2. **Analysis** — Generates 10 consumer queries, runs them through an LLM, detects brand mentions
3. **Results** — Visibility table, associations, competitive gaps, optional GEO audit, role-specific recommendations

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Phase 1: Local development (Ollama)

Default provider is **Ollama**. Install [Ollama](https://ollama.com), pull a model, and start the server:

```bash
ollama pull llama3.2
ollama serve
```

`.env.local`:

```
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
```

### Phase 2: Production (Anthropic / Vercel)

Set in Vercel environment variables:

```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

## Deploy

1. Push to GitHub
2. Import to Vercel
3. Add environment variables (anthropic provider)
4. Deploy

## Architecture

- **Next.js 14** App Router — single page, React `useState` only (no persistence)
- **API routes** — all LLM calls server-side via `lib/llm.ts`
- **Prompts** — centralised in `lib/prompts.ts`
- **Query loop** — client calls `/api/query` once per query (Vercel 10s timeout safe)
- **Recommendations** — fetched after results display (non-blocking)

See `project-notes.md` for deployment and UX decisions.

## Research grounding

- Princeton GEO paper (KDD '24) — content optimisation criteria for AI visibility
- References in `/references/`
