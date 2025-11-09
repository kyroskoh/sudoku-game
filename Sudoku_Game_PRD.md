# 🧩 Sudoku Game — Product Requirements Document (PRD)

## 1) Overview
**Name:** Sudoku Mastery  
**Platforms:** Web (React SPA), Desktop (optional via Electron)  
**Frontend:** React + Vite (TS recommended)  
**Backend:** Node.js (Express)  
**DB (now):** SQLite (file-based)  
**DB (future):** MySQL or PostgreSQL (via migration-ready ORM)  
**Auth:** Anonymous by default; optional account later

### Goals
- Classic Sudoku with **Pencil (Mark) / Pen (Number)** toggle.
- **Casual Mode** with progressive difficulties (Easy, Medium, Hard, Expert, Extreme).
- **Daily Puzzle** (resets 00:00 local time) with streaks.
- **Challenge Modes** (timed/no-mistake/limited-mark).
- **Local-first progression**: store scores/stats in **LocalStorage**, sync to backend **SQLite** when available.

---

## 2) Core Gameplay
- 9×9 grid; rows, columns, 3×3 boxes must contain 1–9 without repetition.
- **Input modes**:  
  - **Mark (Pencil):** candidate notes (small, light style).  
  - **Number (Pen):** confirmed value (bold).  
- Auto-note cleanup (optional).  
- Undo/Redo, Mistake highlighting (toggle), Hints (configurable).  
- Timer & Stats.

---

## 3) Game Modes
- **Casual:** progressive tiers; optional hints; unlocks by completion.  
- **Daily Puzzle:** one per day; streak, time, mistakes; daily leaderboard (local-first → server when online).  
- **Challenge:** themed rules (speed, no-mistake, limited-mark) with badges.

---

## 4) UX/UI
- Grid centered, number pad bottom (mobile) or right (desktop).
- Top bar: Timer · Hints · Mark/Pen toggle · Undo/Redo · Check/Validate · Settings.
- Themes: Classic, Dark, Ocean, Forest; accessibility-friendly palettes & font scaling.
- Row/column/box highlight; duplicate-number highlight (toggle).

---

## 5) Tech & Architecture

### 5.1 Frontend (React)
- **State:** Redux Toolkit or Zustand.  
- **Routing:** React Router.  
- **Storage Strategy:**  
  - **LocalStorage**: `progress`, `bestTimes`, `streaks`, `settings`, and offline `attempts`.  
  - **Sync Engine**: background task posts deltas to API when online/authenticated.  
  - Conflict: “newest-wins” by `updatedAt`; tie-breaker prefers server.

### 5.2 Backend (Node.js + Express)
- **ORM:** Prisma or Knex (use **Prisma** recommended for migration path).  
- **SQLite** in `data/app.sqlite` (dev/prod); switch via DATABASE_URL for MySQL/Postgres later.  
- **Services:**  
  - Puzzle generator/validator (unique-solution backtracking; difficulty tagging).  
  - Daily seed service (per day per timezone).  
  - Stats aggregation.

### 5.3 API (v1, REST)
- `GET /api/puzzles?mode=[casual|daily|challenge]&difficulty=...` → returns puzzle + id + givens.
- `POST /api/attempts` → { puzzleId, mode, difficulty, startedAt, finishedAt?, mistakes, hintsUsed, timeMs, result }.
- `PATCH /api/attempts/:id` → partial updates (finish, mistakes).  
- `GET /api/daily` → today’s puzzle meta + streak info.  
- `GET /api/leaderboard?mode=daily&date=YYYY-MM-DD` → top N (if user IDs present).  
- `POST /api/sync` → batch upsert of local attempts/scores; returns server-resolved records.  
- `GET /api/health` → ok.

> All endpoints auth-optional; if no user, store under `deviceId` (UUID in LocalStorage). If user adds an account later, server **links deviceId → userId**.

---

## 6) Data Model (SQLite now; migration-ready)

### 6.1 Tables
**users** (optional MVP)  
- id (PK), email (unique, nullable), displayName, createdAt

**devices**  
- id (PK, UUID), userId (FK nullable), createdAt

**puzzles**  
- id (PK)  
- mode ENUM(‘casual’, ‘daily’, ‘challenge’)  
- difficulty ENUM(‘easy’, ‘medium’, ‘hard’, ‘expert’, ‘extreme’)  
- date (for daily; nullable elsewhere)  
- seed (string)  
- givens (TEXT JSON)  // starting board  
- solution (TEXT JSON) // final board (server-side only)  
- createdAt

**attempts**  
- id (PK)  
- puzzleId (FK)  
- userId (FK nullable), deviceId (FK nullable)  
- mode, difficulty  
- startedAt, finishedAt (nullable)  
- timeMs (nullable), mistakes INT DEFAULT 0, hintsUsed INT DEFAULT 0  
- result ENUM(‘in_progress’, ‘completed’, ‘failed’)  
- updatedAt

**leaderboards** (materialized or computed on read)  
- id (PK), puzzleId (FK), userId/deviceId, timeMs, createdAt

**badges** (optional later)  
- id (PK), userId (FK), code, earnedAt

### 6.2 Indexes
- puzzles: (mode, difficulty), (date), (seed)  
- attempts: (puzzleId), (userId), (deviceId), (updatedAt)  
- leaderboards: (puzzleId, timeMs)

---

## 7) LocalStorage Keys (Client)
- `sudoku.settings` → { theme, highlights, showMistakes, autoNoteClear }  
- `sudoku.progress` → { [puzzleId]: { notes, grid, mode, updatedAt } }  
- `sudoku.stats` → { bestTimes: { byModeDifficulty: ms }, streaks: { daily: count, lastDate } }  
- `sudoku.queue` → array of pending `attempts` deltas for `/api/sync`

**Sync Rules**
1. On app start / regain online, POST `/api/sync` with queued deltas.  
2. Server resolves and returns authoritative attempts; client updates LS.  
3. Daily streaks computed on server (date-safe), mirrored in client.

---

## 8) Difficulty Calibration
- **Easy → Extreme** scaled by required strategies:  
  - Singles → Hidden/Naked Pairs/Triples → Pointing/Box-Line → X-Wing → Swordfish.  
- Generator ensures **unique solution**; tag difficulty by solving path.

---

## 9) Non-Functional
- **Performance:** first interaction < 100ms; puzzle fetch < 300ms; generator warmed.  
- **Reliability:** daily seed deterministic; avoid dupes on retries (idempotent `/api/sync`).  
- **Security:** no solution sent to client except via hints; rate-limit write endpoints.  
- **Privacy:** anonymous by default; deviceId only.  
- **Accessibility:** keyboard-first, ARIA roles, high-contrast modes.

---

## 10) Migration Plan (SQLite → MySQL/PostgreSQL)
- Use **Prisma** with provider-agnostic schema.  
- Keep **UUID**s for portability.  
- Avoid SQLite-only types; store JSON as TEXT (Prisma maps to JSON on PG).  
- Migrations:  
  1. Freeze Prisma schema.  
  2. Stand up target DB.  
  3. `prisma migrate deploy` on target.  
  4. ETL from SQLite → target (scripted via Node stream/batch).  
  5. Flip `DATABASE_URL`.  
- Keep `/api/sync` idempotent to absorb migration race conditions.

---

## 11) Analytics (optional)
- Client events: startPuzzle, finishPuzzle, hintUsed, mistakeMade, switchMode(Pen/Pencil).  
- Server aggregates per mode/difficulty; daily retention & streak drop-offs.

---

## 12) Deliverables
- React UI with Mark/Pen toggle, notes, auto-note clear, undo/redo, timer.  
- Node/Express API + Prisma schema (SQLite provider).  
- Puzzle generator/validator with difficulty tagging.  
- LocalStorage sync engine + `/api/sync`.  
- Daily puzzle service & streaks.  
- Leaderboard (local-display, server-backed).  
- Tests (unit for generator; integration for sync & attempts).

---

## 13) Acceptance Criteria (Samples)
- Can switch **Mark ↔ Pen** and visually distinguish entries.  
- Finishing a puzzle in **Casual** records time/mistakes locally and in SQLite when online.  
- **Daily** puzzle rotates at local 00:00; streak increments correctly.  
- **Challenge**: “No-Mistake” ends on first error; result stored.  
- Going offline → play → back online: attempts appear in DB after auto-sync; no duplicates.

---

## 14) Example Prisma Schema Snippet (trimmed)
```prisma
datasource db { provider = "sqlite"; url = env("DATABASE_URL") }

generator client { provider = "prisma-client-js" }

model Puzzle {
  id         String   @id @default(uuid())
  mode       String
  difficulty String
  date       DateTime?
  seed       String
  givens     String   // JSON text
  solution   String   // JSON text (server-only)
  createdAt  DateTime @default(now())
  attempts   Attempt[]
  @@index([mode, difficulty])
  @@index([date])
}

model Attempt {
  id         String   @id @default(uuid())
  puzzleId   String
  userId     String?
  deviceId   String?
  mode       String
  difficulty String
  startedAt  DateTime
  finishedAt DateTime?
  timeMs     Int?
  mistakes   Int       @default(0)
  hintsUsed  Int       @default(0)
  result     String    @default("in_progress")
  updatedAt  DateTime  @updatedAt
  puzzle     Puzzle    @relation(fields: [puzzleId], references: [id])
  @@index([puzzleId])
  @@index([userId])
  @@index([deviceId])
  @@index([updatedAt])
}
```

---

## 15) Minimal REST Flow (Local-first)
1. Client asks `GET /api/daily` → gets today’s `puzzleId` + `givens`.  
2. Player plays offline; LocalStorage records progress & attempt snapshot.  
3. When online, client `POST /api/sync` with pending attempts.  
4. Server upserts into SQLite; responds with authoritatives; client reconciles.
