# AGENTS.md

Instructions for any AI agent working on this codebase.

---

## What This Project Is

A Next.js web app that audits how well a brand's online content is structured for AI discovery and citation. Users submit a brief — brand, category, competitors (auto-detected if blank), and pasted product/brand copy — and receive a GEO readiness score grounded in the Princeton GEO paper (KDD '24), criterion-level breakdown, content fixes, and role-aware recommendations.

This is the **content optimisation layer**, not AI visibility monitoring. Competitor auto-detect provides competitive context for the audit; there is no synthetic query loop or visibility metrics.

**Source of truth for all feature decisions:** `docs/spec.md`  
**Track all work in:** `docs/progress.md` (format defined below)

---

## Critical Rules — Never Violate These

**1. API key never reaches the client.**  
`ANTHROPIC_API_KEY` lives in `.env.local` only. All Claude calls go through Next.js API routes in `app/api/`. Never import the Anthropic SDK or reference the key in any component or `lib/` file.

**2. All state in React useState. No persistence.**  
No localStorage, no sessionStorage, no database, no cookies. This is a stateless demo. If the page refreshes, state resets. That is intentional.

**3. Tailwind only for styling.**  
No shadcn, no MUI, no Radix, no Chakra, no other component libraries. Tailwind utility classes only. If a UI pattern is complex, build it manually.

**4. TypeScript throughout.**  
No `any` types. All shared types live in `lib/types.ts`. API routes and components import from there — no inline type definitions for shared shapes.

**5. All prompts in `lib/prompts.ts`.**  
No prompt strings hardcoded inside route files. Every system prompt and user prompt is an exported function in `lib/prompts.ts`. Route files call the function and pass the result to the API. This makes prompt iteration fast without touching route logic.

**6. Follow the file structure in `docs/spec.md` exactly.**  
Do not invent new directories or move files to different locations than specified. The structure exists for a reason and the spec is the contract.

**7. Product content is required.**  
The GEO audit is the core product. `productContent` must be provided in the brief — do not make it optional or add visibility/query features as a substitute.

---

## Build Order

Work in this sequence. Do not skip ahead — later components depend on earlier ones.

```
1.  Project scaffold         next.js init, tailwind, tsconfig
2.  lib/types.ts             all shared interfaces
3.  lib/prompts.ts           all prompt template functions
4.  lib/utils.ts             safeParseJSON, GEO score helpers
5.  /api/competitors         auto-detect competitors
6.  /api/geo-audit           GEO content audit → score + recommendations
7.  /api/recommendations     role-specific recommendations
8.  BriefForm.tsx            step 1 UI
9.  LoadingScreen.tsx        step 2 UI with stage messages
10. GeoAuditSection.tsx      results section 1 — the differentiator
11. RecommendationsSection.tsx results section 2
12. ResultsDashboard.tsx     wrapper + metric cards + brief bar
13. app/page.tsx             main state orchestration, view switching
14. README.md                product brief, setup, deploy, architecture
```

Update `docs/progress.md` after completing each numbered item.

---

## Progress Tracking

Maintain `docs/progress.md` throughout the build. Update it whenever you complete a task, start a task, or hit a blocker. Do not wait until the end of a session to update it.

### Format

```markdown
# Progress

Last updated: [date and time]

## Completed
- [x] 1. Project scaffold — Next.js 14, Tailwind, TypeScript configured
- [x] 2. lib/types.ts — all interfaces defined

## In Progress
- [ ] 3. lib/prompts.ts — writing prompt templates for competitors and geo-audit routes

## Blocked
- [ ] 6. /api/geo-audit — BLOCKED: need to confirm JSON parsing strategy for malformed Claude responses before implementing

## Next Up
- [ ] 4. lib/utils.ts
- [ ] 5. /api/competitors
```

### Rules for progress.md

- **Completed** means the code is written, TypeScript compiles, and the feature works locally. Not "mostly done."
- **In Progress** means you are actively working on it right now. There should be at most one or two items here at a time.
- **Blocked** means you cannot proceed without a decision or information from outside the codebase. State the blocker clearly in one sentence. Do not leave items blocked without explaining why.
- **Next Up** is the ordered queue of what comes after the current in-progress item.
- Always write the date and time at the top when you update the file.
- Do not delete completed items. The log is cumulative.

---

## Code Conventions

**API routes**

- All routes use `NextRequest` and return `NextResponse.json()`
- Wrap the entire handler in try/catch — return `{ error: string }` with status 500 on failure, never let routes throw unhandled
- Parse and validate input at the top of the handler before calling Claude
- JSON.parse all Claude responses inside try/catch — never assume the response is valid JSON

**Components**

- All components are functional with typed props interfaces defined at the top of the file
- Props interfaces are local to the component file (not in types.ts) unless shared across multiple components
- No default exports from `lib/` files — named exports only
- Components in `sections/` receive fully computed data as props — no API calls inside section components

**Prompts**

- Each prompt function takes typed parameters and returns `{ system: string, user: string }`
- Function names match the route: `competitorsPrompt()`, `geoAuditPrompt()`, `recommendationsPrompt()`

**Error handling**

- Every Claude response that should be JSON must go through a `safeParseJSON<T>()` helper in `lib/utils.ts`
- `safeParseJSON` strips markdown fences, trims whitespace, attempts JSON.parse, and returns `T | null`
- If null is returned from any Claude call, the route returns a 500 with a clear error message — never silently return partial data

---

## Environment

```
ANTHROPIC_API_KEY=sk-ant-...   # required for production — get from Anthropic console
LLM_PROVIDER=anthropic         # or ollama for local dev
```

For local dev: copy `.env.example` to `.env.local` and add the key.  
For Vercel: add via the Vercel dashboard under Settings → Environment Variables.

---

## What Not to Build

Do not implement any of the following — they are explicitly out of scope:

- User authentication or sessions
- Report saving, history, or sharing links
- AI visibility monitoring or synthetic query probes (Profound's domain)
- GPT-4 or Gemini API calls
- PDF or CSV export
- Social media or SEO channel analysis (show as "coming soon" in UI only)
- Any database or persistent storage
- URL crawling (paste content only)
- GEO-bench HuggingFace dataset integration (noted in spec as a future improvement — defer)

If anything in these categories seems necessary to make a feature work, stop and flag it rather than implementing a workaround.
