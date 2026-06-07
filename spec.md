# AI Brand Positioning — MVP Spec

**For:** Profound AI Strategist application demo  
**Deploy target:** Vercel free tier  
**Build environment:** Cursor  
**Last updated:** June 2026

---

## 1. What This Is

A web tool that shows marketing professionals how their brand is positioned inside AI chatbots — not just whether they appear (that's what Profound does) but what concepts they own, where competitors are taking territory, and specifically what content changes would improve their AI visibility.

The GEO Content Audit section is the core differentiator: grounded in the Princeton GEO paper (KDD '24), it scores a brand's content against the criteria that actually move LLM recommendations and outputs three specific changes to make.

Princeton GEO paper (KDD '24) paper is in "/references/Generative Engine Optimization.pdf"

**Primary user:** Marketing professional (GEO Manager, CMO, Brand Manager) applying for a brand.  
**Demo context:** Profound AI Strategist application — shows applied AI analysis capability beyond Profound's current monitoring-only product.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Vercel-native, API routes, TypeScript |
| Styling | Tailwind CSS | Fast, no config overhead |
| LLM | Anthropic Claude (claude-sonnet-4-20250514) | Only key available |
| API | Next.js API Routes | Server-side key, no exposure |
| State | React useState | Stateless demo, no DB needed |
| Deploy | Vercel free tier | One command deploy |
| Package manager | npm | Standard |

**No database. No auth. Stateless demo.**

---

## 3. Project Structure

```
ai-brand-positioning/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main app — all state lives here
│   └── globals.css
├── app/api/
│   ├── competitors/route.ts        # Auto-detect competitors for a brand/category
│   ├── queries/route.ts            # Generate 10 consumer queries for a category
│   ├── query/route.ts              # Single consumer query → LLM response
│   ├── geo-audit/route.ts          # GEO content audit → score + recommendations
│   └── recommendations/route.ts    # Role-specific action recommendations
├── components/
│   ├── BriefForm.tsx               # Step 1: input
│   ├── LoadingScreen.tsx           # Step 2: progress
│   ├── ResultsDashboard.tsx        # Step 3: wrapper + tabs
│   └── sections/
│       ├── VisibilitySection.tsx
│       ├── AssociationsSection.tsx
│       ├── GapsSection.tsx
│       ├── GeoAuditSection.tsx     # New — the differentiator
│       └── RecommendationsSection.tsx
├── lib/
│   ├── types.ts                    # All shared types
│   ├── prompts.ts                  # All LLM prompt templates
│   └── utils.ts                    # Brand detection, snippet extraction
├── .env.local                      # ANTHROPIC_API_KEY only
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. App Flow & State

Single page (`app/page.tsx`) manages three views via `AppState`:

```typescript
type AppView = 'brief' | 'loading' | 'results'

interface AppState {
  view: AppView
  brief: Brief | null
  analysisState: AnalysisState | null
  results: AnalysisResults | null
}
```

**Flow:**
```
BriefForm (view: 'brief')
  → submit → validate → set view: 'loading'
  → LoadingScreen runs analysis sequence
  → on complete → set view: 'results'
  → ResultsDashboard renders
  → "New report" button → reset → view: 'brief'
```

---

## 5. Types (`lib/types.ts`)

```typescript
export interface Brief {
  brand: string
  role: string
  category: string
  competitors: string[]           // empty = auto-detect
  channel: 'ai' | 'social' | 'search'
  productContent?: string         // optional paste for GEO audit
}

export interface QueryResult {
  query: string
  response: string
  brandMentions: BrandMention[]   // sorted by position in response
}

export interface BrandMention {
  brand: string
  position: number                // 1 = first mention
  charIndex: number
}

export interface GeoScore {
  overall: number                 // 0–100
  criteria: GeoCriterion[]
  topRecommendations: string[]    // 3 specific actions
  optimizedExample: string        // rewritten paragraph
}

export interface GeoCriterion {
  name: string
  score: number                   // 0–20
  issue: string                   // what's missing
  fix: string                     // specific action
}

export interface AnalysisResults {
  brief: Brief
  queries: QueryResult[]
  competitors: string[]           // final list (user-provided or auto-detected)
  geoAudit: GeoScore | null       // null if no productContent provided
  recommendations: Recommendation[]
  runAt: string                   // ISO timestamp
}

export interface Recommendation {
  title: string
  action: string
}

export interface AnalysisState {
  stage: 'competitors' | 'queries' | 'analyzing' | 'geo' | 'recommendations' | 'done'
  currentQuery: string
  completedQueries: number
  totalQueries: number
}
```

---

## 6. Feature Specs

### 6.1 Brief Form (`components/BriefForm.tsx`)

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Brand name | text input | yes | e.g. "Hoka" |
| Your role | select | yes | Social Media Manager, SEO/GEO Manager, CMO, Brand Manager, Digital Marketing Manager, Head of Growth |
| Product category | text input | yes | e.g. "running shoes" |
| Competitors | text input | no | Comma-separated. Placeholder: "Leave blank to auto-detect" |
| Discovery channel | card select | yes | AI Chatbots (active), Social Media (disabled/soon), Search/SEO (disabled/soon) |
| Product content | textarea | no | Label: "Paste product page or brand description for GEO audit (optional)" |

**Channel cards:**
- AI Chatbots: active, green "LIVE" badge
- Social Media: disabled, grey "SOON" badge
- Search / SEO: disabled, grey "SOON" badge

**Validation:** brand, role, category required. Show inline error message. No submit until valid.

**Submit button text:** "Generate positioning report →"

---

### 6.2 Loading Screen (`components/LoadingScreen.tsx`)

Shows eyebrow: "[Brand] · [Category]", title: "Analysing AI discovery landscape"

**Stages with status messages:**

1. `competitors` → "Identifying key competitors..."
2. `queries` → "Generating consumer discovery queries..."
3. `analyzing` → "Querying AI: '[current query]'" + query list below (done/active/pending states)
4. `geo` → "Running GEO content audit..." (only if productContent provided)
5. `recommendations` → "Generating recommendations..."

Progress bar fills linearly across stages.

Query list shows up to 10 items as they complete — each line shows query text, green checkmark when done, blue dot when active.

---

### 6.3 Results Dashboard (`components/ResultsDashboard.tsx`)

**Top bar (brief summary):** Brand | Category | Channel | Role | Competitors tracked | Queries run | Date

**Three metric cards:**

- AI Visibility Rate (%)
- Average Position (when mentioned)
- Competitive Gaps (count)

Color logic: good (green) / mid (amber) / bad (red) thresholds per metric.

**Sections — in order:**

1. Visibility (🔍)
2. Associations (💬)
3. Competitive Gaps (⚠️)
4. GEO Content Audit (📊) — only renders if productContent was provided
5. Recommendations (🎯)

**Multi-LLM indicator** — shown in section 1 header area:

```
Running on: [Claude ✓ live] [GPT-4 · coming soon] [Gemini · coming soon]
```

Claude column populated. GPT-4 and Gemini columns show "—" cells with a subtle grey tone. Small footnote: "Multi-model comparison shows how brands perform differently across AI systems. GPT-4 and Gemini powered in full version."

This demonstrates architectural intent without requiring those keys.

---

### 6.4 Visibility Section (`sections/VisibilitySection.tsx`)

Table: Consumer query | Your position | What AI said | Other brands mentioned

- Position badge: 1st (green), 2nd (amber), 3rd (red), Not mentioned (grey)
- "What AI said" column: 80-char snippet from LLM response with brand name highlighted
- "Other brands" column: competitor name + their position in brackets

---

### 6.5 Associations Section (`sections/AssociationsSection.tsx`)

For each query where the brand appeared: show query as label + the AI snippet in italic. Groups what the LLM says about the brand across all appearances. This answers "what do AI chatbots think we stand for?"

---

### 6.6 Competitive Gaps Section (`sections/GapsSection.tsx`)

List of queries where the brand did NOT appear but at least one competitor did. Each row: query text + "Competitors that appeared: X, Y" + "Gap" red badge.

Empty state: green tick "No gaps — you appeared in all queries where competitors were mentioned."

---

### 6.7 GEO Content Audit Section (`sections/GeoAuditSection.tsx`)

**Only renders if `brief.productContent` is non-empty.**

If empty, shows a CTA: "Paste your product content in a new report to unlock GEO audit — the content optimisation layer that Profound doesn't offer."

**When populated:**

Left: GEO Score — large number (0–100), colour-coded, label "GEO Readiness Score"

Below score: five criteria rows:

| Criterion | Score /20 | Issue | Fix |
|---|---|---|---|
| Statistics & Data | score | what's missing | specific action |
| Citations & Sources | score | what's missing | specific action |
| Attribute Clarity | score | what's missing | specific action |
| Fluency & Structure | score | what's missing | specific action |
| Query Alignment | score | what's missing | specific action |

Small info note on section header: "Based on Princeton GEO research (KDD '24) — content optimised with these signals shows up to 40% higher visibility in AI-generated responses."

Below criteria: **Top 3 recommendations** — numbered cards with specific action text.

Below recommendations: **Optimised example** — collapsible block showing a rewritten paragraph applying the GEO fixes. Label: "Example of optimised content."

---

### 6.8 Recommendations Section (`sections/RecommendationsSection.tsx`)

Five numbered recommendations, each with bold title + 2-sentence action text. Generated by Claude, role-aware, informed by both the visibility gaps and GEO audit results.

Loading state shown while generating (runs after results display, non-blocking).

---

## 7. API Routes

### `POST /api/competitors`

**Input:**

```json
{ "brand": "Hoka", "category": "running shoes" }
```

**System:** You are a market research analyst. Return ONLY a JSON array of the 5 most prominent competitor brands to {brand} in the {category} category. No markdown.

**Output:** `string[]`

---

### `POST /api/queries`

**Input:**

```json
{ "brand": "Hoka", "category": "running shoes" }
```

**System:** Return ONLY a JSON array of 10 strings. No markdown.

**User:**
```
Generate 10 realistic, varied consumer queries someone would type into an AI chatbot
to discover {category}. Cover: general recommendations, specific needs (budget, use case),
comparisons, expert-level, beginner-level. Return a JSON array of 10 query strings.
```

**Fallback:** If parsing fails, use category-interpolated defaults:
```
["best {category}", "top rated {category}", "most popular {category} brands",
"{category} comparison", "best value {category}", "{category} for beginners",
"premium {category}", "{category} recommendations", "which {category} should I buy",
"{category} pros and cons"]
```

**Output:** `string[]`

> **Future improvement (deferred):** Replace with real consumer queries from the GEO-bench
> dataset (GEO-Optim/geo-bench on HuggingFace). Fetch 100 rows, filter to category via Claude.
> Adds authenticity — same benchmark as the Princeton paper the GEO audit cites.

---

### `POST /api/query`

**Input:**
```json
{ "query": "best running shoes for marathon", "category": "running shoes" }
```

**System:** You are a helpful assistant answering consumer questions about {category}. Give natural, practical recommendations and mention specific brands where relevant.

**Output:** `{ "response": string }`

Called once per consumer query. Client calls this 10 times sequentially and updates state after each.

---

### `POST /api/geo-audit`

**Input:**
```json
{
  "brand": "Hoka",
  "category": "running shoes",
  "content": "[pasted product page text]"
}
```

**System:** You are a GEO (Generative Engine Optimization) analyst. You score brand content against criteria proven to improve visibility in AI-generated recommendations, based on academic research (Princeton GEO paper, KDD 2024). Return ONLY valid JSON, no markdown.

**User:**
```
Analyse this content for the brand "{brand}" in the "{category}" category.

Score it on five criteria (0–20 each):
1. Statistics & Data — specific numbers, percentages, quantitative claims
2. Citations & Sources — references to third-party sources, reviews, studies, endorsements
3. Attribute Clarity — explicit differentiators, price positioning, use cases, target customer
4. Fluency & Structure — clear, well-structured, easy for AI systems to parse
5. Query Alignment — directly answers common consumer questions about {category}

Return this exact JSON:
{
  "overall_score": <number 0-100>,
  "criteria": [
    {
      "name": "Statistics & Data",
      "score": <0-20>,
      "issue": "<one sentence: what is missing>",
      "fix": "<one sentence: specific action to take>"
    },
    ... (all 5 criteria)
  ],
  "top_recommendations": [
    "<specific action 1>",
    "<specific action 2>",
    "<specific action 3>"
  ],
  "optimized_example": "<rewritten paragraph of their content applying the top fixes>"
}

Content to analyse:
{content}
```

**Output:** `GeoScore`

---

### `POST /api/recommendations`

**Input:**
```json
{
  "brand": "Hoka",
  "role": "SEO / GEO Manager",
  "category": "running shoes",
  "visibilityRate": 70,
  "gapQueries": ["running shoes for nurses", "recovery footwear"],
  "geoScore": 45,
  "geoTopIssues": ["Missing statistics", "No third-party citations"]
}
```

**System:** You are a senior digital marketing strategist specialising in AI/GEO optimisation. Return ONLY a JSON array, no markdown.

**User:** Generate 5 specific, actionable recommendations for a {role} at {brand} to improve their AI chatbot visibility in the {category} category. AI visibility is currently {visibilityRate}%. Missing from {gapQueries.length} queries. GEO content score is {geoScore}/100 with issues: {geoTopIssues}. Each recommendation needs a short title and 2 concrete sentences. Return: `[{"title": string, "action": string}]`

**Output:** `Recommendation[]`

---

## 8. Utility Functions (`lib/utils.ts`)

```typescript
// Extract brand mentions from LLM response text
function detectBrands(text: string, brands: string[]): BrandMention[]

// Extract a readable snippet around first brand mention
function extractSnippet(text: string, brand: string, charsBefore: number, charsAfter: number): string

// Compute visibility rate, average position, gap count from QueryResult[]
function computeMetrics(results: QueryResult[], brand: string): {
  visibilityRate: number
  averagePosition: number | null
  gapCount: number
}
```

---

## 9. Prompts File (`lib/prompts.ts`)

Centralise all prompt templates here as exported functions. API routes import from prompts.ts rather than hardcoding strings. Makes it easy to iterate prompt quality in one place.

---

## 10. Environment Variables

`.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env.example`:
```
ANTHROPIC_API_KEY=your_key_here
```

Only one variable needed. Never expose to client. All API calls go through Next.js API routes.

---

## 11. Vercel Deployment

**Steps:**
1. Push repo to GitHub
2. Import to Vercel — auto-detects Next.js
3. Add `ANTHROPIC_API_KEY` in Vercel environment variables
4. Deploy

**Free tier constraints to respect:**
- API route timeout: 10s. Each `/api/query` call is a single LLM request — stays well within 10s.
- Do NOT batch all 10 queries into one API route call. Client calls `/api/query` once per query and loops.
- No background jobs, no streaming.

---

## 12. Design Principles

- Clean, data-forward, professional — not a toy
- Dark section headers, light content areas
- Colour accent on key metrics (position badges, score colours)
- No animations beyond the progress bar
- Mobile-readable (overflow-x scroll on tables)
- Tailwind only — no external component libraries

---

## 13. README (to include in repo)

Should cover:
- What it does and why it's differentiated (visibility + GEO audit)
- The research it's grounded in (GEO paper, HBR, Puntoni)
- Setup: clone → npm install → add .env.local → npm run dev
- Deploy: Vercel one-click
- Architecture decisions (stateless, single LLM with multi-LLM slots, client-side query loop)

The README is part of the demo artefact — Profound will see it.

---

## 14. Out of Scope (for this build)

- User authentication
- Report saving / history
- Real GPT-4 / Gemini API calls
- GEO-bench dataset integration (deferred — see /api/queries note)
- PDF export
- Social media or SEO channel analysis
- Database of any kind
- Payment / subscription

These are all noted in the UI as "coming soon" or "full version" where relevant.
