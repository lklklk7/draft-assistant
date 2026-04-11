# League Draft Assistant

A full-stack League of Legends draft assistant and performance analytics platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon), Prisma ORM |
| Auth | JWT, bcrypt |
| Deployment | Vercel (client), Render (server), Neon (database) |

## Project Structure

```
league-draft-assistant/
├── apps/
│   ├── client/   # React frontend
│   └── server/   # Express API
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- A Riot Games developer API key from https://developer.riotgames.com

### Development

Install dependencies from the root:

```bash
# Install root dependencies
npm install

# Install all app dependencies
npm --prefix apps/client install
npm --prefix apps/server install
```

Copy the environment file and fill in your values:

```bash
cp apps/server/.env.example apps/server/.env
```

Start both apps simultaneously:

```bash
npm run dev
```

| App | URL |
|---|---|
| Client | http://localhost:5173 |
| Server | http://localhost:3001 |
| Health check | http://localhost:3001/health |

## Environment Variables

See [apps/server/.env.example](apps/server/.env.example) for all required server variables.

## API Documentation

### Health

`GET /health` — Returns server status. Used by deployment platforms to verify the service is running.

## Development Roadmap

- [x] Milestone 1: Project foundation
- [x] Milestone 2: Database schema and Prisma
- [x] Milestone 3: Authentication backend
- [x] Milestone 4: Authentication frontend
- [x] Milestone 5: Riot API integration
- [ ] Milestone 6: Riot account UI and match sync frontend
- [ ] Milestone 7: Analytics backend
- [ ] Milestone 8: Analytics dashboard
- [ ] Milestone 9: Draft assistant
- [ ] Milestone 10: Deployment
