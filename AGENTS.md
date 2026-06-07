# AGENTS.md

Instructions for any AI agent working on this codebase.

---

## What This Project Is

A Next.js web app that analyses how a brand is positioned inside AI chatbots. It runs a brief-driven analysis — brand, category, competitors, role — fires 10 consumer queries at Claude, and returns a four-section results dashboard: visibility, associations, competitive gaps, and a GEO content audit. The GEO audit is the core differentiator: it scores the brand's product content against the Princeton GEO paper criteria (KDD '24) and outputs specific content recommendations.

**Source of truth for all feature decisions:** `spec.md`  
**Track all work in:** `progress.md` (format defined below)

---

## Critical Rules — Never Violate These

**1. API key never reaches the client.**  
`ANTHROPIC_API_KEY` lives in `.env.local` only. All Claude calls go through Next.js API routes in `app/api/`. Never import the Anthropic SDK or reference the key in any component or `lib/` file.

**2. One query per API route call.**  
`/api/query` handles a single consumer query and returns a single response. The client loops 10 times and calls it once per query. Do not batch all 10 into one API route — Vercel free tier has a 10s function timeout and batching will break it.

**3. All state in React useState. No persistence.**  
No localStorage, no sessionStorage, no database, no cookies. This is a stateless demo. If the page refreshes, state resets. That is intentional.

**4. Tailwind only for styling.**  
No shadcn, no MUI, no Radix, no Chakra, no other component libraries. Tailwind utility classes only. If a UI pattern is complex, build it manually.

**5. TypeScript throughout.**  
No `any` types. All shared types live in `lib/types.ts`. API routes and components import from there — no inline type definitions for shared shapes.

**6. All prompts in `lib/prompts.ts`.**  
No prompt strings hardcoded inside route files. Every system prompt and user prompt is an exported function in `lib/prompts.ts`. Route files call the function and pass the result to the API. This makes prompt iteration fast without touching route logic.

**7. Follow the file structure in spec.md exactly.**  
Do not invent new directories or move files to different locations than specified. The structure exists for a reason and the spec is the contract.

---

## Build Order

Work in this sequence. Do not skip ahead — later components depend on earlier ones.

```
1.  Project scaffold         next.js init, tailwind, tsconfig
2.  lib/types.ts             all shared interfaces
3.  lib/prompts.ts           all prompt template functions (can be stubs initially)
4.  lib/utils.ts             detectBrands, extractSnippet, computeMetrics
5.  /api/competitors         auto-detect competitors
6.  /api/queries             generate 10 consumer queries
7.  /api/query               single query → LLM response
8.  /api/geo-audit           GEO content audit → score + recommendations
9.  /api/recommendations     role-specific recommendations
10. BriefForm.tsx            step 1 UI
11. LoadingScreen.tsx        step 2 UI with stage messages and query list
12. VisibilitySection.tsx    results section 1
13. AssociationsSection.tsx  results section 2
14. GapsSection.tsx          results section 3
15. GeoAuditSection.tsx      results section 4 — the differentiator
16. RecommendationsSection.tsx results section 5
17. ResultsDashboard.tsx     wraps all sections + metric cards + brief bar
18. app/page.tsx             main state orchestration, view switching
19. README.md                product brief, setup, deploy, architecture
```

Update `progress.md` after completing each numbered item.

---

## Progress Tracking

Maintain `progress.md` in the project root throughout the build. Update it whenever you complete a task, start a task, or hit a blocker. Do not wait until the end of a session to update it.

### Format

```markdown
# Progress

Last updated: [date and time]

## Completed
- [x] 1. Project scaffold — Next.js 14, Tailwind, TypeScript configured
- [x] 2. lib/types.ts — all interfaces defined

## In Progress
- [ ] 3. lib/prompts.ts — writing prompt templates for competitors and queries routes

## Blocked
- [ ] 8. /api/geo-audit — BLOCKED: need to confirm JSON parsing strategy for malformed Claude responses before implementing

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
- Function names match the route: `competitorsPrompt()`, `queriesPrompt()`, `queryPrompt()`, `geoAuditPrompt()`, `recommendationsPrompt()`

**Error handling**

- Every Claude response that should be JSON must go through a `safeParseJSON<T>()` helper in `lib/utils.ts`
- `safeParseJSON` strips markdown fences, trims whitespace, attempts JSON.parse, and returns `T | null`
- If null is returned from any Claude call, the route returns a 500 with a clear error message — never silently return partial data

---

## Environment

```
ANTHROPIC_API_KEY=sk-ant-...   # required — get from Anthropic console
```

For local dev: copy `.env.example` to `.env.local` and add the key.  
For Vercel: add via the Vercel dashboard under Settings → Environment Variables.

---

## What Not to Build

Do not implement any of the following — they are explicitly out of scope:

- User authentication or sessions
- Report saving, history, or sharing links
- GPT-4 or Gemini API calls (design the UI slots but leave them unpowered)
- PDF or CSV export
- Social media or SEO channel analysis (show as "coming soon" in UI only)
- Any database or persistent storage
- GEO-bench HuggingFace dataset integration (noted in spec as a future improvement — defer)

If anything in these categories seems necessary to make a feature work, stop and flag it rather than implementing a workaround.
