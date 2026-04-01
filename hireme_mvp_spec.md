# HireMe | MVP Web App + View Tracking Spec
> Spec for Cursor — V1 MVP

---

## Strategic Decision

V1 drops AI generation entirely. The core value of HireMe is not the AI summary — it's the signal that **someone saw your application**. AI generation is a quality risk that slows down launch. A resume rendered as a clean, job-specific web page + view tracking delivers the same core promise in a fraction of the time.

**V1 = Resume + Job Context → Custom URL per Application + View Tracking. Ship it.**

Each page is scoped to a specific application: `hireme.page/slavik-stripe`, `hireme.page/slavik-openai`. This is the core URL pattern — not a generic resume page.

AI-generated content ("why I fit this role" narrative) moves to V2 once real recruiter behavior data exists.

---

## What This Is

The actual HireMe.page V1 MVP. A web app where a candidate can:

1. Upload their resume (PDF)
2. Get a clean, professional public page rendered from it
3. Receive a shareable link (`hireme.page/yourname`)
4. See who viewed their page and when

This is the smallest possible version that delivers real value and can be built in days, not weeks.

---

## Tech Stack

- **Next.js 14+ (App Router)** — app UI + public candidate pages as dynamic routes
- **TypeScript**
- **Tailwind CSS** — styling
- **Supabase** — Postgres database, auth, file storage (resumes)
- **Vercel** — hosting and deployment
- **No Anthropic SDK in V1** — AI generation is out of scope

---

## Project Structure

```
hireme-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                  # Page list + analytics summary
│   │   └── new/page.tsx              # Upload resume + create page
│   ├── [slug]/
│   │   └── page.tsx                  # PUBLIC candidate page
│   └── api/
│       ├── track/route.ts            # View tracking endpoint
│       └── upload/route.ts           # Resume upload + parse endpoint
├── components/
│   ├── ResumeUploader.tsx
│   ├── CandidatePage.tsx
│   ├── AnalyticsSummary.tsx
│   ├── PageCard.tsx
│   └── CopyLinkButton.tsx
├── lib/
│   ├── supabase.ts
│   ├── parse-resume.ts               # PDF → structured text
│   └── slug.ts
├── supabase/
│   └── migrations/
└── .env.local
```

---

## Database Schema (Supabase / Postgres)

### pages

```sql
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  candidate_name TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  resume_file_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_user_id ON pages(user_id);
```

> Note: `target_company` and `target_role` are removed from V1. Pages are candidate-level, not job-specific. Job-specific pages (`hireme.page/jane-stripe`) move to V2.

### page_views

```sql
CREATE TABLE page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  duration_seconds INTEGER,
  is_resume_download BOOLEAN DEFAULT false
);

CREATE INDEX idx_page_views_page_id ON page_views(page_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
```

---

## Core User Flows

### Flow 1: Create a Page

**Route:** `/dashboard/new`

1. User uploads resume PDF
2. Server parses PDF → extracts raw text
3. Page is created and published immediately — no AI generation, no preview step
4. **Success screen** with:
   - Shareable link prominently displayed
   - Large "Copy Link" button
   - Sharing message templates with copy buttons:
     - Email: `"Hi [name], I applied for [role] at [company]. Here's a quick overview of my background: [link]"`
     - LinkedIn DM: `"Hi [name], here's a quick summary of my background relevant to this role: [link]"`

> **The success screen is the most important screen in the entire app.** If users don't copy the link and share it, the product doesn't work.

### Flow 2: View Dashboard

**Route:** `/dashboard`

- List of all created pages as cards
- Each card: company + role, date created, view count, last viewed
- Click card for detailed analytics
- "Create New Page" button prominently placed
- Per-page actions: copy link, unpublish, delete

### Flow 3: Public Page (what recruiters see)

**Route:** `/[slug]`

Requirements:
- Load fast (< 2 seconds)
- Look professional and clean — like a polished resume, not a tech tool
- Header: candidate name + "Application for [Role] at [Company]"
- Render resume content in clean sections: summary/objective, experience, skills, education
- "Download Resume" button (serves the original PDF)
- Small footer: `"Made with HireMe.page — know when they see your application"` (viral loop)
- Fire tracking on page load
- Track resume download clicks

**Design direction:** Clean white background, professional typography (clean sans-serif), generous whitespace, no sidebar/nav/distractions. Must look equally good on mobile. Think: a resume that lives on the web.

### Flow 4: Authentication

- Magic link email auth OR Google OAuth via Supabase
- No username/password
- After signup → `/dashboard/new`
- After login → `/dashboard`

---

## Resume Parsing — How It Works

1. User uploads PDF
2. Server extracts raw text (use `pdf-parse` or similar)
3. Structure into sections heuristically: name (first line), summary, experience, skills, education
4. Store raw text + structured JSON in DB
5. Render structured JSON on public page

Keep parsing simple. If structure inference fails, fall back to rendering plain text cleanly. Don't over-engineer — it just needs to be readable.

---

## View Tracking — How It Works

### On Page Load

When `/[slug]` loads:

1. Client `POST` to `/api/track` with `page_id` and `event_type: "view"`
2. API records: `page_id`, `viewed_at`, `ip_address` (from `x-forwarded-for`), `user_agent`, `referrer`, `country` and `city` (from Vercel geo headers: `x-vercel-ip-country`, `x-vercel-ip-city`)
3. Return 200

### On Resume Download

1. `POST` to `/api/track` with `page_id` and `event_type: "resume_download"`
2. Record in `page_views` with `is_resume_download = true`
3. Then serve the file

### Time on Page (stretch goal)

- JavaScript heartbeat every 15 seconds
- `POST` to `/api/track` with `event_type: "heartbeat"`
- Update `duration_seconds` on most recent page_view
- Pause on `visibilitychange` when tab not active
- Nice-to-have, not required for launch

### Privacy

- Do NOT attempt reverse IP lookup for company names in V1
- Do NOT use third-party tracking scripts
- Add small note at bottom of public pages: `"This page records anonymous view analytics."`

---

## Slug System

Rules:
- Auto-generated from `{firstname}-{company}` lowercase, stripped of special chars
- User can edit before publishing
- Must be unique (check on save)
- Allowed: lowercase a-z, 0-9, hyphens
- Min 3, max 60 characters
- If taken, suggest: `slavik-stripe-2`, `slavik-stripe-sde`

Reserved slugs (block these):
```
dashboard, login, signup, api, admin, settings, about, pricing,
blog, help, support, terms, privacy
```

---

## Analytics Display

### Summary Card (dashboard list)

- Total views
- Last viewed (relative time)
- Resume downloads count

### Detail View (click into page)

- Total views
- Unique visitors (deduplicate by IP + user_agent per day)
- Resume downloads
- Views over time (bar chart — last 7 or 30 days)
- Recent views list: date/time, country/city, referrer
- Do NOT show IP addresses to users — country/city only

---

## Landing Page

**Route:** `/`

1. **Headline:** "Stop wondering if they saw your application."
2. **Subheadline:** "Turn your resume into a shareable page. Track when employers open it."
3. **Screenshot/mockup** of a public candidate page
4. **CTA:** "Create Your Page — Free" → `/signup`
5. **How it works:** 3 steps (upload resume, get your link, share + track)
6. **Social proof section** (placeholder for now)
7. **Footer** with logo and minimal links

No pricing page. No feature comparison. No blog.

---

## What NOT to Build in V1

- AI-generated content (moves to V2)
- Job-specific pages (`hireme.page/jane-stripe` — moves to V2)
- Pricing / payments / subscriptions
- Custom domains
- Page templates or themes
- Rich text editor
- Portfolio sections or image galleries
- Email notifications ("someone viewed your page")
- Team or company accounts
- API access
- A/B testing
- External integrations

---

## V2 Preview (don't build yet)

Once V1 is live and real recruiter behavior is observed:

- **Job posting ingestion**: user pastes job URL, system reads the JD and tailors the page further
- **AI summary**: "Why I'm a fit for this role" — now we have real recruiter behavior data to evaluate quality against
- **Email notifications**: ping user when someone views their page

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=https://hireme.page
```

---

## Order of Implementation

1. **Project scaffolding** — Next.js + Tailwind + Supabase, migrations, env config
2. **Auth** — Magic link or Google OAuth, login/signup, middleware protecting `/dashboard`
3. **Resume upload + parse** — PDF upload, text extraction, store in DB
4. **Public page rendering** — `/[slug]` route, fetch from DB, render cleanly
5. **Slug system** — Validation, uniqueness, protected slugs
6. **Copy link + sharing UX** — Success screen, copy buttons, message templates
7. **View tracking** — `/api/track` endpoint, record views and downloads
8. **Dashboard + analytics** — Page list, view counts, detail view with chart
9. **Landing page** — Marketing homepage
10. **Polish** — Mobile responsiveness, error states, loading states, edge cases

---

## Success Criteria

The V1 MVP is "done" when:

1. User can upload a resume and get a shareable link in under 2 minutes
2. Public page looks professional enough to include in a job application email
3. When a recruiter opens the link, a view is recorded and visible on dashboard within 60 seconds
4. Copy link button and sharing templates make it effortless to share
5. HireMe.page footer on public pages creates a discovery path for recruiters
6. Landing page clearly communicates value and converts visitors to signups

---

## The One Metric That Matters

**Share rate = pages where the link was clicked at least once by someone other than the creator / total pages created**

If people create pages but nobody views them, users aren't sharing. Every design decision should optimize for making the share behavior feel natural and rewarding.
