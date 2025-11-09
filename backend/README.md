# Sudoku Mastery Backend

Node.js + Express + Prisma + SQLite backend for Sudoku Mastery.

## Features

- RESTful API for puzzle management
- Sudoku puzzle generator with difficulty calibration
- Daily puzzle service with streak tracking
- Attempt tracking and leaderboards
- Offline-first sync support
- SQLite database (migration-ready to PostgreSQL/MySQL)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
# .env file
PORT=3011
DATABASE_URL="file:./data/app.sqlite"
NODE_ENV=development
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Start development server:
```bash
npm run dev
```

Server will run on `http://localhost:3011`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

## API Documentation

### Health Check
```
GET /api/health
```

### Puzzles
```
GET /api/puzzles?mode=casual&difficulty=easy
POST /api/puzzles/:id/validate
```

### Daily Puzzle
```
GET /api/daily?deviceId=xxx
```

### Attempts
```
POST /api/attempts
PATCH /api/attempts/:id
GET /api/attempts/:id
```

### Sync
```
POST /api/sync
```

### Stats & Leaderboard
```
GET /api/stats?deviceId=xxx
GET /api/leaderboard?puzzleId=xxx
```

## Database Schema

See `prisma/schema.prisma` for the complete schema.

Key models:
- Puzzle
- Attempt
- Leaderboard
- User
- Device

## Migration to PostgreSQL/MySQL

1. Update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/sudoku"
```

2. Update `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npm run prisma:migrate
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── routes/
│   │   ├── puzzles.ts
│   │   ├── attempts.ts
│   │   ├── daily.ts
│   │   ├── leaderboard.ts
│   │   ├── sync.ts
│   │   └── stats.ts
│   ├── services/
│   │   ├── sudoku-generator.ts
│   │   ├── daily-puzzle.ts
│   │   ├── puzzle-service.ts
│   │   └── attempt-service.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## License

MIT

