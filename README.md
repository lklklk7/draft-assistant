# League Draft Assistant

A full-stack League of Legends draft assistant and performance analytics platform built with React, Node.js, PostgreSQL, and the Riot Games API.

**Live demo:** https://game-draft-assistant.vercel.app

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white&style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white&style=flat-square)

---

## What It Does

League Draft Assistant connects to your Riot Games account, imports your match history, and uses your personal performance data to recommend champions during the draft phase — the most strategic moment of every game.

Unlike generic tier lists that recommend the same champions to everyone, this tool learns from **your** games. A champion with a 70% win rate in your hands is a better pick than an S-tier champion you rarely play.

---

## Features

**Authentication**
- Secure registration and login with bcrypt password hashing
- JWT-based session management with 7-day token expiry
- Protected routes — unauthenticated users are redirected automatically

**Riot Account Integration**
- Connect any Riot account by Riot ID (Name#TAG)
- Import your last 20 matches via the Riot Match v5 API
- Incremental sync — only fetches matches you haven't imported yet

**Performance Analytics**
- Overall win rate and total games played
- Per-champion breakdown: win rate, KDA, average CS
- Recent match history with results and game details
- Champion data synced from Riot Data Dragon on server startup

**Draft Assistant**
- Select your role and pick allied and enemy champions
- Receive 5 personalized champion recommendations ranked by score
- Every draft simulation saved to your history

---

## Recommendation Algorithm

The draft engine scores every champion you have played using three signals:

```
score = (win_rate × 0.5) + (kda_score × 0.3) + (experience_score × 0.2)
```

| Signal | Weight | Formula |
|---|---|---|
| Win rate | 50% | `wins / games_played` |
| KDA score | 30% | `min((kills + assists) / max(deaths, 1) / 5.0, 1.0)` |
| Experience | 20% | `min(games_played / 20, 1.0)` |

**Why these weights?**
- Win rate is the strongest signal — it directly measures success
- KDA rewards consistent, low-death play even when wins are close
- Experience penalizes recommending a champion you have only played once, where the win rate is unreliable

Champions already picked by allies or enemies are automatically excluded. Each recommendation includes a plain-English reasoning string: `"68% win rate over 12 games."` so you understand exactly why it was suggested.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript, Vite | UI framework and build tool |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Server state | TanStack Query | Caching, loading states, refetching |
| HTTP client | Axios | JWT interceptors for authenticated requests |
| Routing | React Router v7 | Client-side navigation and protected routes |
| Backend | Node.js, Express, TypeScript | REST API server |
| Database | PostgreSQL (Neon) | Relational data storage |
| ORM | Prisma 7 | Type-safe database queries and migrations |
| Auth | JWT, bcrypt | Token-based auth, password hashing |
| External API | Riot Games API, Data Dragon | Match history, champion data |
| Deployment | Vercel + Render + Neon | Frontend, backend, database |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  TanStack Query  ·  React Router  ·  Tailwind CSS   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS (JWT in Authorization header)
┌───────────────────────▼─────────────────────────────┐
│                  Express API Server                  │
│    Auth  ·  Riot Integration  ·  Analytics  ·  Draft │
└───────────┬────────────────────────┬────────────────┘
            │                        │
┌───────────▼──────────┐  ┌─────────▼───────────────┐
│  PostgreSQL (Neon)   │  │   Riot Games API         │
│  Prisma ORM          │  │   Data Dragon CDN        │
└──────────────────────┘  └─────────────────────────┘
```

**Database schema:** 8 tables — `users`, `riot_accounts`, `matches`, `champions`, `champion_stats`, `draft_simulations`, `draft_recommendations`, `match_notes`. Pre-computed aggregates in `champion_stats` mean the analytics dashboard never runs expensive COUNT/AVG queries at request time.

---

## Project Structure

```
league-draft-assistant/
├── apps/
│   ├── client/                  # React + Vite frontend
│   │   └── src/
│   │       ├── components/      # Reusable UI components
│   │       ├── context/         # Auth context and session management
│   │       ├── hooks/           # TanStack Query hooks
│   │       ├── pages/           # Route-level page components
│   │       ├── services/        # API call functions
│   │       └── utils/           # Formatting helpers
│   └── server/                  # Express API
│       └── src/
│           ├── controllers/     # Request handlers
│           ├── middleware/       # JWT authentication
│           ├── routes/          # Express routers
│           ├── schemas/         # Zod validation schemas
│           └── services/        # Business logic
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/riot/accounts` | Yes | List connected Riot accounts |
| POST | `/api/riot/accounts` | Yes | Connect a Riot account |
| POST | `/api/riot/accounts/:id/sync` | Yes | Import match history |
| GET | `/api/analytics/overview` | Yes | Win rate and top champions |
| GET | `/api/analytics/champions` | Yes | Full champion stats |
| GET | `/api/analytics/matches` | Yes | Recent match history |
| GET | `/api/champions` | Yes | All champions from Data Dragon |
| POST | `/api/draft/recommend` | Yes | Generate draft recommendations |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Riot Games developer API key from [developer.riotgames.com](https://developer.riotgames.com)
- A PostgreSQL database (free at [neon.tech](https://neon.tech))

### Installation

```bash
npm install
npm --prefix apps/client install
npm --prefix apps/server install
```

### Configuration

```bash
cp apps/server/.env.example apps/server/.env
```

Fill in `apps/server/.env`:

```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=a_long_random_string
RIOT_API_KEY=RGAPI-your-key-here
```

### Running locally

```bash
# Terminal 1 — backend (http://localhost:3001)
npm --prefix apps/server run dev

# Terminal 2 — frontend (http://localhost:5173)
npm --prefix apps/client run dev
```

---

## Development Roadmap

- [x] Milestone 1: Project foundation — monorepo, React, Express
- [x] Milestone 2: Database schema — 8-table PostgreSQL design with Prisma
- [x] Milestone 3: Authentication backend — JWT, bcrypt, Zod validation
- [x] Milestone 4: Authentication frontend — auth context, protected routes
- [x] Milestone 5: Riot API integration — account lookup, match import pipeline
- [x] Milestone 6: Riot account UI — connect form, sync button, match import
- [x] Milestone 7: Analytics backend — pre-computed champion stats, match history
- [x] Milestone 8: Analytics dashboard — stat cards, champion table, match list
- [x] Milestone 9: Draft assistant — recommendation engine, champion picker
- [x] Milestone 10: Deployment — Vercel, Render, Neon
