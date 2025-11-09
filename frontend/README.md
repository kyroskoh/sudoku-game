# Sudoku Mastery Frontend

React + TypeScript + Vite frontend for Sudoku Mastery.

## Features

- Modern React 18 with TypeScript
- Zustand for state management
- React Router for navigation
- CSS Modules for styling
- Multiple themes (Classic, Dark, Ocean, Forest)
- Responsive design
- Offline-first with LocalStorage
- Background sync to backend
- Keyboard shortcuts
- Accessibility features

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

App will run on `http://localhost:3010`

The Vite dev server proxies `/api` to `http://localhost:3011` (backend).

## Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Grid.tsx          # Sudoku grid
│   │   ├── NumberPad.tsx     # Number input
│   │   ├── Controls.tsx      # Game controls
│   │   └── Header.tsx        # App header
│   ├── pages/
│   │   ├── Home.tsx          # Landing page
│   │   ├── CasualGame.tsx    # Casual mode
│   │   ├── DailyGame.tsx     # Daily puzzle
│   │   └── ChallengeGame.tsx # Challenge mode
│   ├── store/
│   │   └── gameStore.ts      # Zustand store
│   ├── utils/
│   │   ├── api.ts            # API client
│   │   ├── localStorage.ts   # Storage utilities
│   │   └── syncService.ts    # Background sync
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── styles/
│   │   └── globals.css       # Global styles & themes
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

## Game Modes

### Casual Mode
- Practice with 5 difficulty levels
- No time pressure
- Unlimited hints
- Progress saved locally

### Daily Puzzle
- One puzzle per day
- Streak tracking
- Daily leaderboard
- Difficulty varies by day of week

### Challenge Mode
- Timed gameplay
- Special constraints
- Achievement badges
- Competitive leaderboards

## Themes

Switch themes by clicking the "🎨 Theme" button in the header.

Available themes:
- Classic (default light)
- Dark (dark mode)
- Ocean (blue-green)
- Forest (green)

Themes use CSS custom properties for easy customization.

## Keyboard Shortcuts

- **1-9**: Enter number or toggle note
- **0 / Backspace / Delete**: Clear cell
- **Arrow Keys**: Navigate cells
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo

## State Management

Zustand store manages:
- Current puzzle
- Board state (numbers and notes)
- Selected cell
- Input mode (pen/pencil)
- History (undo/redo)
- Game statistics
- Settings

## Offline Support

- Game state stored in LocalStorage
- Attempts queued for sync when offline
- Background sync when online
- Graceful degradation

## Building for Production

```bash
npm run build
```

Output in `dist/` folder can be deployed to:
- Vercel
- Netlify
- Any static hosting
- CDN

Configure API endpoint for production:
```typescript
// In production, update API_BASE in src/utils/api.ts
const API_BASE = process.env.VITE_API_URL || '/api';
```

## Customization

### Add New Theme

Edit `src/styles/globals.css`:

```css
[data-theme="mytheme"] {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  /* ... more variables */
}
```

Update theme list in `src/components/Header.tsx`.

### Modify Grid Size

The grid is responsive and uses CSS Grid. Adjust in `src/components/Grid.module.css`.

## License

MIT

