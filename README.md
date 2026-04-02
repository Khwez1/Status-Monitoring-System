# Downtime — Uptime Monitoring & Status Page

A production-ready status page that monitors uptime, logs incidents, and notifies subscribers of outages in real time.

Live URL: [status-monitoring-system.vercel.app](https://status-monitoring-system.vercel.app/)

---

## Features

- Real-time uptime monitoring via scheduled pings every minute
- Status banner showing current system state (Operational, Degraded, Down)
- 48-block visual uptime history over the last 24 hours with uptime percentage
- Incident lifecycle tracking (Investigating → Resolved)
- Smart resolution hints based on HTTP status codes and incident duration
- Email alerts to subscribers on site down, degraded, and recovery events
- Subscribe/unsubscribe flow directly from the status page
- Auto-refreshing UI every 30 seconds without a full page reload
- Protected cron endpoint via secret header validation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Neon (Serverless Postgres) |
| ORM | Prisma v7 |
| Email | Resend |
| Scheduler | cron-job.org |
| Deployment | Vercel |

---

## Architecture

```
cron-job.org (every 1 min)
  → GET /api/monitor (protected by x-cron-secret header)
    → fetch target URL + measure latency
    → save Check record (status code, latency, ok, timestamp)
    → compare result against active incident
      ├── no active incident + site not operational → create Incident + send emails
      ├── active incident + site operational → resolve Incident + send emails
      └── no change → do nothing
  → all subscribers notified via Resend
  → status page auto refreshes every 30s via router.refresh()
```

### Key Design Decisions

**Check vs Incident distinction**
Every ping saves a `Check` record regardless of outcome. This raw data powers the uptime history bar and latency display independently from the incident list. Incidents are only created on state *change*, not on every failed check.

**Incident lifecycle statuses**
Incidents use response-process statuses (`INVESTIGATING` → `RESOLVED`) rather than technical ones (`DOWN` → `UP`). This mirrors how real status pages communicate with users — it describes what is being done about the problem, not just the technical state.

**Degraded vs Down**
Slow responses (>1000ms) are treated differently from unreachable sites. A degraded incident is opened with separate messaging and a yellow UI state, while a completely unreachable site opens a down incident with a red UI state.

**Smart resolution hints**
When an incident is created, a resolution hint is auto-generated based on the HTTP status code (503, 502, 504 etc.). When the incident resolves, the hint is updated with the actual duration. This gives meaningful context on incident detail pages without manual input.

---

## Data Models

```prisma
model Check {
  id        String   @id @default(cuid())
  url       String
  status    Int      // HTTP status code
  latencyMs Int      // response time in ms
  ok        Boolean  // true if 2xx response
  checkedAt DateTime @default(now())
}

model Incident {
  id         String    @id @default(cuid())
  status     String    // INVESTIGATING | RESOLVED
  startTime  DateTime
  endTime    DateTime?
  message    String
  resolution String?
  createdAt  DateTime  @default(now())
}

model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database
- A [Resend](https://resend.com) account
- A [cron-job.org](https://cron-job.org) account

### Installation

1. Clone the repository

```bash
git clone https://github.com/Khwez1/Status-Monitoring-System.git
cd Status-Monitoring-System
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables — create a `.env` file in the root:

```bash
DATABASE_URL=your_neon_pooled_connection_string
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
CRON_SECRET=your_random_secret
```

4. Generate the Prisma client and push the schema

```bash
npx prisma generate
npx prisma db push
```

5. Start the development server

```bash
npm run dev
```

### Setting up cron-job.org

1. Create a free account at [cron-job.org](https://cron-job.org)
2. Create a new cron job with the following settings:
   - URL: `https://Status-Monitoring-System.vercel.app/api/monitor`
   - Schedule: every 1 minute
   - Add a request header: `x-cron-secret` → your `CRON_SECRET` value

---

## Deployment

The project is deployed on Vercel. The build command runs `prisma generate` before `next build` to ensure the generated client is available at build time.

```json
"scripts": {
  "build": "prisma generate && next build"
}
```

Make sure to add all environment variables in Vercel under Project → Settings → Environment Variables:

```
DATABASE_URL
RESEND_API_KEY
EMAIL_FROM
CRON_SECRET
```

Use the **pooled** Neon connection string for `DATABASE_URL` to handle Vercel's serverless connection limits.

---

## Testing Incidents

To simulate a failure and trigger alerts:

**Simulate a down incident** — temporarily change `MONITOR_URL` in `service/statusService.ts`:
```typescript
const MONITOR_URL = "https://httpstat.us/503";
```

**Simulate a degraded incident** — use a delayed response and lower the threshold:
```typescript
const MONITOR_URL = "https://httpbin.org/delay/2";
const DEGRADED_THRESHOLD_MS = 100;
```

Then hit the monitor endpoint manually:
```bash
curl -H "x-cron-secret: your_secret" https://status-monitoring-system.vercel.app/api/monitor
```

Revert the URL and hit the endpoint again to trigger the recovery email.

> **Note:** When using `onboarding@resend.dev` as the sender, emails can only be delivered to the email address registered with your Resend account. This is a Resend limitation on their shared sending domain.

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── monitor/route.ts      # Cron endpoint
│   │   ├── subscribe/route.ts    # Subscribe endpoint
│   │   └── unsubscribe/route.ts  # Unsubscribe endpoint
│   ├── incident/[id]/page.tsx    # Incident detail page
│   └── page.tsx                  # Main status page
├── components/
│   ├── AutoRefresh.tsx           # Client-side 30s refresh
│   ├── IncidentsList.tsx         # Incidents list
│   ├── StatusBanner.tsx          # Current status banner
│   ├── StatusHeader.tsx          # Header with subscribe button
│   ├── SubscribeModal.tsx        # Subscribe modal
│   └── UptimeHistory.tsx         # 48-block uptime history bar
├── service/
│   ├── emailService.ts           # Resend email alerts
│   ├── incidentService.ts        # Incident CRUD + resolution hints
│   └── statusService.ts          # Core monitoring logic
├── utils/
│   ├── date.ts                   # Date formatting utilities
│   └── ui.ts                     # Status color utilities
└── prisma/
    └── schema.prisma
```