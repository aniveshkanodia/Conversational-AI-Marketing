# GEO Brand Positioning Audit

A web tool that audits how well a brand's online content is structured for AI discovery and citation — scored against Princeton GEO research (KDD '24).

Built as a Profound AI Strategist application demo.

## What it does

1. **Brief** — Enter brand, brand URL, optional competitors, and pasted product/brand content
2. **Analysis** — Auto-detects competitors (if needed), runs GEO content audit against five Princeton criteria
3. **Results** — GEO readiness score, criterion breakdown, top fixes, optimised example, and role-aware recommendations

This is the **content optimisation layer** — not AI visibility monitoring. Competitor auto-detect provides context; visibility tracking requires products like Profound.

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
- **Analysis flow** — competitors → GEO audit → async recommendations
- **Competitors** — auto-detected via `/api/competitors` when not provided

See [docs/](./docs/) for the full spec, progress log, and deployment notes.

## Research grounding

- Princeton GEO paper (KDD '24) — content optimisation criteria for AI visibility
- References in `/references/`
