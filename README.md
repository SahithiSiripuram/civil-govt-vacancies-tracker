# B.Tech Civil Government Job Vacancies Tracker

A single-page tracker of **currently open Indian government job vacancies that a B.E./B.Tech Civil
Engineering fresher can apply to** — Central Government, Public Sector Undertakings, and Karnataka
state government and PSUs.

**Live site:** <https://civil-govt-vacancies-tracker.vercel.app>

## What it shows

A sortable, searchable table of open notifications ordered by application deadline (earliest first),
with the qualification, seat count, location, pay level, and official apply / notification links for
each. Four summary cards sit above it:

| Card | Meaning |
|---|---|
| **Open notifications** | Number of rows in the table — distinct recruitment notifications |
| **Total seats** | Vacancies summed across those notifications |
| **Closing in 7 days** | Notifications whose deadline falls within a week |
| **Organizations** | Distinct recruiting bodies |

## Two eligibility categories

Rows are tagged in the **Open to** column, and the filter buttons switch between them:

- **Civil-specific** — the notification explicitly requires Civil Engineering.
- **Any branch** — no particular branch is required, so a Civil graduate qualifies. Covers defence
  officer entries (Army SSC(T)/TGC/TES, Navy SSC, Air Force AFCAT, Coast Guard CGCAT, UPSC CDS),
  any-engineering-discipline posts, and any-graduate posts such as UPSC CSE/ESE, SSC CGL, RRB NTPC
  and KPSC/KEA recruitments.

## Inclusion rules

A vacancy appears only if all three hold:

1. A B.E./B.Tech Civil graduate is eligible (either category above).
2. **Freshers are eligible** — no mandatory post-qualification work experience. Where experience is
   optional or unstated, the row is marked `Yes`.
3. **Applications are currently open** — the closing date has not passed.

Excluded: posts requiring mandatory experience, posts restricted to other engineering branches,
Diploma-only or ITI-only posts, and closed notifications. Rows drop off automatically once their
closing date passes.

## Tracking your applications

The **Status** column lets you mark each row `Applied`, `Not eligible`, or `Not interested`.
`Expired` is applied automatically once a deadline passes and cannot be set by hand. Marks are
stored in the browser's `localStorage` under `civilTrackerStatus.v1`, keyed by organization + post —
so they survive daily data refreshes, but stay on the device where they were made.

The status filter row switches between **All**, **To act on** (open and not yet dealt with),
**Applied**, and **Dismissed**.

## Data

All data lives in one JSON block inside `index.html`:

```html
<script id="tracker-data" type="application/json"> ... </script>
```

Shape:

```json
{
  "asOf": "YYYY-MM-DD",
  "vacancies": [
    {
      "lastDate": "YYYY-MM-DD",
      "organization": "",
      "post": "",
      "eligibility": "Civil-specific | Any branch",
      "qualification": "",
      "freshers": "Yes",
      "vacancies": "",
      "location": "",
      "salary": "",
      "applyLink": "",
      "notificationLink": "",
      "dateAdded": "YYYY-MM-DD"
    }
  ],
  "log": [
    { "date": "", "added": 0, "total": 0, "orgs": "", "timestamp": "" }
  ]
}
```

Dates are stored ISO (`YYYY-MM-DD`) and rendered as `DD-MMM-YYYY`. Only official government and PSU
domains (`*.gov.in`, `*.nic.in`, or the organization's own site) are used for links — never
aggregator sites. Where sources conflict, the official recruitment notification is treated as the
source of truth.

## Updates

The tracker is refreshed daily at 12:00 AM IST by a scheduled Claude task, which searches official
recruitment portals, appends newly opened vacancies, drops expired ones, re-sorts by deadline, and
records a line in the daily update log at the bottom of the page.

## Responsive layout

Above 820px the page renders a sortable, searchable Grid.js table. Below that the table is swapped
for stacked cards — deadline, status control, organization, post, eligibility tags and details —
so the page never needs horizontal scrolling on a phone. Both views share one render path and one
delegated change handler, so status marks and filters behave identically in either.

## Running locally

No build step and no dependencies to install — it's one self-contained HTML file.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Grid.js is loaded from a CDN with subresource-integrity hashes; everything else is inline.

## Deploying

The repo is a static site. On Vercel, import it at [vercel.com/new](https://vercel.com/new) with
**no framework preset** and no build command — pushes to `main` then redeploy automatically.

## Disclaimer

Compiled from public recruitment notifications and provided for convenience only. Always confirm
eligibility, dates, and fees on the official portal before applying.
