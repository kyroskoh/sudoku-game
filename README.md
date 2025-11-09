# 🧩 Sudoku Mastery

A modern, feature-rich Sudoku game built with React, TypeScript, Node.js, and SQLite. Play classic Sudoku with multiple game modes, difficulty levels, and a beautiful user interface.

![Sudoku Mastery](https://via.placeholder.com/800x400/2196F3/ffffff?text=Sudoku+Mastery)

## ✨ Features

### 🎮 Game Modes
- **Casual Mode**: Practice with progressive difficulty levels (Easy → Extreme)
- **Daily Puzzle**: One puzzle per day with streak tracking
- **Challenge Mode**: Test your skills with special constraints

### 🎯 Core Features
- ✏️ **Pen & Pencil Modes**: Switch between number entry and candidate notes
- ↶ **Undo/Redo**: Full history support for your moves
- 💡 **Smart Hints**: Get help when you're stuck
- ⏱️ **Timer & Stats**: Track your progress and best times
- 🎨 **Multiple Themes**: Classic, Dark, Ocean, Forest
- 📱 **Responsive Design**: Play on desktop, tablet, or mobile
- 💾 **Auto-Save**: Progress is automatically saved locally
- 🌐 **Offline Support**: Play without an internet connection
- 🔄 **Background Sync**: Automatically sync your progress when online

### ♿ Accessibility
- Keyboard-first navigation
- ARIA labels and roles
- High-contrast themes
- Screen reader friendly

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Storage**: LocalStorage with background sync
- **Styling**: CSS Modules with custom properties

### Backend
- **Runtime**: Node.js with Express
- **Database**: SQLite (migration-ready to MySQL/PostgreSQL)
- **ORM**: Prisma
- **API**: RESTful API with JSON

### Key Services
- **Puzzle Generator**: Creates unique-solution puzzles with difficulty calibration
- **Daily Puzzle Service**: Deterministic daily puzzles with streak tracking
- **Sync Engine**: Handles offline-first data synchronization
- **Validation**: Server-side puzzle validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game
```

2. **Setup Backend**
```bash
cd backend
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:3011`

3. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install

# Start the frontend dev server
npm run dev
```

The frontend will start on `http://localhost:3010`

4. **Open your browser**
Navigate to `http://localhost:3010` and start playing!

## 📁 Project Structure

```
sudoku-game/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   │   ├── sudoku-generator.ts
│   │   │   ├── daily-puzzle.ts
│   │   │   ├── puzzle-service.ts
│   │   │   └── attempt-service.ts
│   │   └── index.ts               # Express app
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Grid.tsx
│   │   │   ├── NumberPad.tsx
│   │   │   ├── Controls.tsx
│   │   │   └── Header.tsx
│   │   ├── pages/                # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── CasualGame.tsx
│   │   │   ├── DailyGame.tsx
│   │   │   └── ChallengeGame.tsx
│   │   ├── store/                # State management
│   │   │   └── gameStore.ts
│   │   ├── utils/                # Utilities
│   │   │   ├── api.ts
│   │   │   ├── localStorage.ts
│   │   │   └── syncService.ts
│   │   ├── types/                # TypeScript types
│   │   ├── styles/               # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🎮 How to Play

1. **Select a Game Mode**: Choose from Casual, Daily, or Challenge
2. **Pick Your Difficulty**: Easy, Medium, Hard, Expert, or Extreme
3. **Start Playing**: 
   - Click a cell to select it
   - Use the number pad or keyboard (1-9) to enter numbers
   - Toggle between Pen ✏️ (permanent) and Pencil ✎ (notes) modes
   - Press Backspace or ✕ to erase
4. **Use Controls**:
   - Undo/Redo your moves
   - Pause the game
   - Track your time and mistakes
5. **Complete the Puzzle**: Fill all cells correctly to win!

### Keyboard Shortcuts
- **1-9**: Enter number (Pen mode) or toggle note (Pencil mode)
- **0 / Backspace / Delete**: Clear cell
- **Arrow Keys**: Navigate cells
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo

## 🎨 Themes

Sudoku Mastery includes 4 beautiful themes:
- **Classic**: Traditional light theme
- **Dark**: Easy on the eyes for night play
- **Ocean**: Calming blue-green tones
- **Forest**: Natural green palette

Click the "🎨 Theme" button in the header to cycle through themes.

## 🔧 API Endpoints

### Puzzles
- `GET /api/puzzles?mode={mode}&difficulty={difficulty}` - Get a puzzle
- `GET /api/puzzles/:id` - Get puzzle by ID
- `POST /api/puzzles/:id/validate` - Validate solution

### Daily
- `GET /api/daily?userId={id}&deviceId={id}` - Get today's daily puzzle with streak

### Attempts
- `POST /api/attempts` - Create attempt
- `PATCH /api/attempts/:id` - Update attempt
- `GET /api/attempts/:id` - Get attempt by ID

### Sync & Stats
- `POST /api/sync` - Sync local attempts to server
- `GET /api/stats?userId={id}&deviceId={id}` - Get user stats
- `GET /api/leaderboard?puzzleId={id}` - Get leaderboard

### Health
- `GET /api/health` - Health check

## 🗄️ Database Schema

The app uses SQLite with Prisma ORM. Key models:
- **Puzzle**: Stores puzzle data (givens, solution, difficulty)
- **Attempt**: Tracks user game sessions
- **Leaderboard**: Competition rankings
- **User** & **Device**: User/device management

Migration to PostgreSQL/MySQL is straightforward via Prisma configuration.

## 🔄 Offline-First Architecture

1. **LocalStorage**: Stores settings, progress, and pending attempts locally
2. **Background Sync**: Automatically syncs to server when online
3. **Conflict Resolution**: Server-authoritative with "newest-wins" strategy
4. **Device Linking**: Anonymous device IDs can be linked to user accounts later

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

The frontend build will be in `frontend/dist/` and can be served statically or via a CDN.

## 🚢 Deployment

### Backend
- Deploy to any Node.js hosting (Heroku, Railway, Render, etc.)
- Set `DATABASE_URL` for production database
- Set `PORT` and `NODE_ENV` environment variables

### Frontend
- Deploy to Vercel, Netlify, or any static hosting
- Configure API proxy in production
- Set environment variables for API endpoint

### Database Migration
To migrate from SQLite to PostgreSQL/MySQL:
1. Update `DATABASE_URL` in `.env`
2. Update Prisma provider in `schema.prisma`
3. Run `npx prisma migrate dev`
4. ETL existing data if needed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Sudoku puzzle generation algorithm inspired by classic backtracking techniques
- UI/UX design principles from modern web applications
- Built with love for puzzle enthusiasts worldwide

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Enjoy playing Sudoku Mastery! 🎉**

