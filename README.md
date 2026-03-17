# RentBuddy 🏠

> Smart housing for students · HackRent 2026 · Systems track
>
> **Submission pitch:** `/pitch` &nbsp;·&nbsp; **Live demo:** `/demo` &nbsp;·&nbsp; **Checklist:** `/checklist`
> 
> Demo login: `demo@iitb.ac.in` (magic link)

---

## Quick start (3 commands)

```bash
npm install
cp .env.example .env.local     # fill MONGODB_URI + NEXTAUTH_SECRET + NEXTAUTH_URL
npm run seed && npm run dev     # → http://localhost:3000
```

---

## Complete file map (76 files across 5 phases)

### Pages
| Route | What it does |
|---|---|
| `/` | Landing page |
| `/demo` | Public judge showcase — no login needed |
| `/pitch` | Live submission deck — auto-pulls real stats |
| `/checklist` | Submission checklist with countdown timer |
| `/onboarding` | 4-step wizard for new users |
| `/dashboard` | Overview — live stats + getting-started |
| `/match` | AI roommate matching (Meta Llama 3) |
| `/splits` | Rent splits + Coinbase crypto payments |
| `/lease` | AI lease red-flag scanner |
| `/rentals` | RentIts item catalogue + signup (+40 pts) |
| `/map` | Mapbox housing + flatmate map |
| `/notifications` | Notification inbox |
| `/research` | In-app survey + live results dashboard |
| `/profile` | Full profile editor |
| `/auth/signin` | Google + magic link |
| `/auth/verify` | Magic link sent |
| `/auth/error` | Auth error |

### API routes
| Route | Purpose |
|---|---|
| `POST /api/auth/[...nextauth]` | NextAuth |
| `GET/PATCH /api/profile` | User profile |
| `POST /api/match` | Llama 3 matching |
| `POST /api/match/respond` | Accept / decline |
| `GET/POST /api/splits` | Split groups |
| `GET/PATCH/DELETE /api/splits/[id]` | Expenses + balances |
| `POST /api/lease` | Llama 3 lease scan |
| `POST /api/reminders` | Twilio SMS |
| `POST /api/payments` | Coinbase charge |
| `POST /api/payments/webhook` | Payment confirm |
| `GET/PATCH /api/notifications` | Inbox |
| `POST /api/rentits/signup` | +40 pts signup |
| `GET/POST /api/research` | Survey data |
| `GET /api/stats` | Live metrics |
| `POST /api/onboarding` | Save wizard data |
| `GET /api/map/listings` | Map listings |
| `GET /api/og` | Dynamic OG images |

---

## Environment variables

| Variable | Where | Required |
|---|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) free M0 | ✅ |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | Your deployed URL | ✅ |
| `GOOGLE_CLIENT_ID/SECRET` | Google Cloud Console | Optional |
| `EMAIL_SERVER` | Resend SMTP | Magic links |
| `TOGETHER_API_KEY` | [together.ai](https://api.together.xyz) | AI features |
| `TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE` | Twilio Console | SMS |
| `COINBASE_COMMERCE_API_KEY` | Coinbase Commerce | Crypto pay |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | Coinbase dashboard | Webhooks |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | mapbox.com | Map |
| `RENTITS_API_KEY` | RentIts team | +40 pts |

All features work in **demo mode** without paid keys.

---

## Sponsor integrations (9 of 9)

| Sponsor | How used |
|---|---|
| **Meta** | Llama 3 — roommate summaries + lease analysis |
| **MongoDB** | Atlas — users, splits, matches, notifications, surveys |
| **Twilio** | SMS rent payment reminders |
| **RentIts** | Item rentals + +40 bonus points per signup |
| **Coinbase** | Crypto rent payments + webhook settlement |
| **Netlify** | CI/CD hosting + preview URLs |
| **Okta** | University email student verification |
| **GitHub Education** | Version control + Copilot |
| **Mapbox** | Interactive housing + flatmate map |

---

## Deploy to Netlify

```bash
# Option 1 — connect GitHub repo at netlify.com (recommended)
# Set env vars in Netlify dashboard → auto-deploys on every push

# Option 2 — CLI
npx netlify-cli deploy --prod
```

After deploying, register the Coinbase webhook:
`https://yourapp.netlify.app/api/payments/webhook`

---

## Phase summary

| Phase | What was built |
|---|---|
| 1 — Foundation | Scaffold, auth, DB, all 5 core pages in demo mode |
| 2 — Live APIs | Real backend, profile page, splits CRUD, Twilio, RentIts |
| 3 — Power features | Coinbase payments, Mapbox map, notifications, mobile sidebar |
| 4 — Research | Survey + results dashboard, /demo showcase, /api/stats |
| 5 — Submission polish | Onboarding wizard, /pitch deck, /checklist, OG images, SEO, PWA, error boundary |

---

Built for HackRent 2026 · [hackrent.devfolio.co](https://hackrent.devfolio.co)
