# 🧩 Sudoku Mastery

A modern, feature-rich Sudoku game built with React, TypeScript, Node.js, and SQLite. Play classic Sudoku with multiple game modes, difficulty levels, and a beautiful user interface.

![Sudoku Mastery](https://via.placeholder.com/800x400/2196F3/ffffff?text=Sudoku+Mastery)

## ✨ Features

### 🎮 Game Modes
- **Casual Mode**: Practice with progressive difficulty levels (Easy → Extreme)
- **Daily Puzzle**: One puzzle per day with streak tracking
- **Challenge Mode**: Test your skills with special constraints
- **⚡ Speed Mode** (Coming Soon): Race against the clock with time limits and bonus points

### 🎯 Core Features
- ✏️ **Pen & Pencil Modes**: Switch between number entry and candidate notes
- ↶ **Undo/Redo**: Full history support for your moves (50-step history)
- 💡 **Smart Hints**: Get help when you're stuck
- ⏱️ **Timer & Stats**: Track your progress and best times
- ✅ **Visual Feedback**: Green flash animation when rows, columns, or boxes are correctly completed (validated against solution)
- 🎨 **Multiple Themes**: 4 normal themes + 4 colorblind-friendly themes with smart filtering
- ⚙️ **Settings System**: Customize your experience with accessibility options
- 📱 **Responsive Design**: Play on desktop, tablet, or mobile
- 💾 **Auto-Save**: Progress is automatically saved locally
- 🌐 **Offline Support**: Play without an internet connection
- 🔄 **Background Sync**: Automatically sync your progress when online
- 🏆 **Global Leaderboard**: Top 10 rankings per mode and difficulty with YYYY-MM-DD date format
- 👤 **Name Entry**: Submit your name to appear on leaderboards
- 🌏 **Daily Puzzles**: One puzzle per day (per difficulty) with streak tracking
- 🔐 **Secure Puzzles**: Salted seed generation prevents cheating
- 🎯 **Difficulty Selection**: Choose from Easy, Medium, Hard, Expert, Extreme
- 🚀 **Ready to Start**: Blur overlay with "I'm Ready" button before timer starts
- ⏸️ **Pause/Resume**: Pause the game anytime with timer freeze

### ♿ Accessibility
- Keyboard-first navigation
- ARIA labels and roles
- High-contrast themes
- **Colorblind Mode**: Toggle to enable 4 colorblind-optimized themes
  - **Blue-Orange**: Blue-orange-purple palette for most colorblind types
  - **High Contrast**: Maximum contrast black/white for severe colorblindness
  - **Blue-Yellow**: Blue-yellow palette optimized for red-green colorblind users
  - **Monochrome**: Grayscale theme with contrast-based indicators
- Smart theme filtering: Only shows relevant themes based on colorblind mode setting
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
git clone https://github.com/kyroskoh/sudoku-game.git
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

1. **Select a Game Mode**: Choose from Casual, Daily, Challenge, or Speed (coming soon)
2. **Customize Settings** (Optional): Visit ⚙️ Settings to enable Colorblind Mode or adjust preferences
3. **Pick Your Difficulty**: Easy, Medium, Hard, Expert, or Extreme
4. **Start Playing**: 
   - Click a cell to select it
   - Use the number pad or keyboard (1-9) to enter numbers
   - Toggle between Pen ✏️ (permanent) and Pencil ✎ (notes) modes
   - Press Backspace or ✕ to erase
5. **Use Controls**:
   - Undo/Redo your moves
   - Pause the game (timer freezes, no input allowed)
   - Track your time and mistakes
6. **Visual Feedback**: 
   - Rows, columns, and 3x3 boxes flash green when correctly completed
   - Validation checks against the actual solution (not just completeness)
   - Green highlight persists until the line/box becomes incorrect
6. **Complete the Puzzle**: Fill all cells correctly to win!

### Keyboard Shortcuts
- **1-9**: Enter number (Pen mode) or toggle note (Pencil mode)
- **0 / Backspace / Delete**: Clear cell
- **Arrow Keys**: Navigate cells
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo

## 🎨 Themes

Sudoku Mastery includes 8 beautiful themes organized into two categories:

### Normal Themes (4)
- **Classic**: Traditional light theme
- **Dark**: Easy on the eyes for night play
- **Ocean**: Calming blue-green tones
- **Forest**: Natural green palette

### Colorblind-Friendly Themes (4)
Enable Colorblind Mode in Settings to access these accessibility-optimized themes:
- **Blue-Orange**: Blue-orange-purple palette that works well for most colorblind types
- **High Contrast**: Maximum contrast black/white theme for severe colorblindness and low vision
- **Blue-Yellow**: Blue-yellow palette optimized for red-green colorblind users
- **Monochrome**: Grayscale theme that relies on contrast rather than color

**How it works:**
- Click the "🎨 Theme" button in the header to cycle through themes
- Themes shown depend on your Colorblind Mode setting (toggle in ⚙️ Settings)
- When Colorblind Mode is enabled, only colorblind-friendly themes are available
- When Colorblind Mode is disabled, only normal themes are available
- This smart filtering ensures you only see themes appropriate for your needs

## 🔧 API Endpoints

### Puzzles
- `GET /api/puzzles?mode={mode}&difficulty={difficulty}` - Get a puzzle
- `GET /api/puzzles/:id` - Get puzzle by ID
- `POST /api/puzzles/:id/validate` - Validate solution

### Daily
- `GET /api/daily?difficulty={difficulty}&userId={id}&deviceId={id}` - Get today's daily puzzle with streak

### Attempts
- `POST /api/attempts` - Create attempt
- `PATCH /api/attempts/:id` - Update attempt
- `GET /api/attempts/:id` - Get attempt by ID

### Sync & Stats
- `POST /api/sync` - Sync local attempts to server
- `GET /api/stats?userId={id}&deviceId={id}` - Get user stats
- `GET /api/leaderboard?puzzleId={id}` - Get leaderboard for specific puzzle
- `GET /api/leaderboard/global?mode={mode}&difficulty={difficulty}&limit={limit}` - Get global leaderboard (dates in YYYY-MM-DD format)

### Devices
- `PUT /api/devices/:id` - Update device (e.g., display name)

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

## 🚀 Future Enhancements & Improvements

We're constantly working to improve Sudoku Mastery! Here are some planned features and enhancements:

### 🎮 New Game Modes
- **⚡ Speed Mode**: Race against the clock with time limits per puzzle
  - Time limits: Easy (5 min), Medium (10 min), Hard (15 min), Expert (20 min), Extreme (30 min)
  - Bonus points for finishing early (e.g., 2x points if finished in half the time)
  - Progressive difficulty: Start with Easy, unlock harder difficulties as you progress
  - Speed streaks: Track consecutive speed solves completed within time limit
  - Dedicated speed leaderboards: Ranked by fastest completion times
  - Visual countdown timer with color-coded warnings (green → yellow → red)
  - Time bonus multipliers: Faster completion = higher score multiplier
  - Speed achievements: Unlock badges for speed milestones (e.g., "Lightning Fast", "Speed Demon")
  - No pause option: Adds to the challenge and ensures fair competition
  - Auto-submit on time expiry: Puzzle automatically submitted when time runs out

### 🎮 Gameplay Enhancements
- **Advanced Solving Techniques**: Visual hints for advanced techniques (X-Wing, Swordfish, etc.)
- **Auto-Fill Candidates**: Automatically fill in all possible candidates for empty cells
- ✅ **Real-time Validation**: Visual feedback when rows, columns, or boxes are correctly completed (implemented)
- **Mistake Detection**: Real-time validation with visual feedback for incorrect entries
- **Color Coding**: Color-code candidates for advanced solving strategies
- **Multiple Solutions**: Support for puzzles with multiple valid solutions
- **Custom Puzzles**: Allow users to create and share their own puzzles
- **Puzzle Import/Export**: Import puzzles from other formats (CSV, text, etc.)
- **Hint System Enhancement**: Contextual hints based on current board state
- **Tutorial Mode**: Interactive tutorial for beginners
- **Practice Mode**: Focus on specific solving techniques

### 🏆 Social & Competition Features
- **Friends System**: Add friends and compete with them
- **Private Leaderboards**: Create custom leaderboards for groups
- **Achievements & Badges**: Unlock achievements for various milestones
- **Daily Challenges**: Special themed challenges with unique rewards
- **Tournaments**: Scheduled tournaments with brackets
- **Replay System**: Watch replays of top players' solutions
- **Sharing**: Share completion times and achievements on social media
- **Comments**: Comment on puzzles and discuss strategies
- **Follow Players**: Follow top players and see their progress

### 📊 Analytics & Statistics
- **Detailed Analytics**: Comprehensive stats dashboard
- **Progress Tracking**: Visual progress charts over time
- **Performance Metrics**: Average solve time, accuracy, improvement trends
- **Difficulty Analysis**: Track performance by difficulty level
- **Time Analysis**: Breakdown of time spent per puzzle section
- **Mistake Patterns**: Identify common mistake patterns
- **Personal Records**: Track all-time bests and recent improvements
- **Heatmaps**: Visual representation of where you spend most time

### 🎨 UI/UX Improvements
- ✅ **Animations**: Smooth transitions and animations for better feedback (implemented: green flash for correct lines/boxes)
- **Sound Effects**: Optional sound effects for actions (cell fill, error, completion)
- **Haptic Feedback**: Vibration feedback on mobile devices
- **Custom Themes**: User-created themes and theme marketplace
- **Grid Customization**: Adjustable grid size, colors, and styles
- **Dark Mode Auto-Switch**: Automatically switch based on system preferences
- **Compact Mode**: Condensed UI for smaller screens
- **Gesture Support**: Swipe gestures for mobile navigation
- **Accessibility Improvements**: Enhanced screen reader support, keyboard navigation
- **Multi-Language Support**: Internationalization (i18n) for multiple languages

### 🔧 Technical Improvements
- **Progressive Web App (PWA)**: Install as a native app
- **Service Workers**: Enhanced offline capabilities and caching
- **WebSocket Support**: Real-time leaderboard updates
- **GraphQL API**: More efficient data fetching
- **Database Optimization**: Query optimization and indexing improvements
- **Caching Strategy**: Improved caching for puzzles and leaderboards
- **CDN Integration**: Faster asset delivery worldwide
- **Load Balancing**: Handle increased traffic with load balancing
- **Monitoring & Analytics**: Application performance monitoring (APM)
- **Error Tracking**: Comprehensive error tracking and reporting
- **A/B Testing**: Test new features with A/B testing framework

### 📱 Platform Expansion
- **Mobile Apps**: Native iOS and Android applications
- **Desktop App**: Electron-based desktop application
- **Browser Extensions**: Chrome/Firefox extensions for quick access
- **Smartwatch Support**: Quick puzzle solving on wearables
- **Voice Commands**: Voice input for accessibility

### 🤖 AI & Machine Learning
- **AI Difficulty Adjustment**: Automatically adjust difficulty based on player skill
- **Smart Puzzle Recommendations**: Recommend puzzles based on solving history
- **Pattern Recognition**: Identify and suggest solving techniques
- **Cheat Detection**: ML-based detection of suspicious solving patterns
- **Personalized Experience**: Customize experience based on playing style

### 🌐 Community Features
- **Forums**: Community forums for discussions
- **Puzzle Ratings**: Rate puzzles and see community ratings
- **Puzzle Collections**: Curated collections of puzzles
- **User-Generated Content**: Allow users to submit puzzles
- **Moderation Tools**: Community moderation for user content
- **News & Updates**: In-app news feed for updates and announcements

### 🔐 Security & Privacy
- **User Authentication**: Optional account creation with email/social login
- **Privacy Controls**: Granular privacy settings
- **Data Export**: Export all user data
- **GDPR Compliance**: Full GDPR compliance for EU users
- **Two-Factor Authentication**: Enhanced security for accounts
- **Rate Limiting**: Prevent abuse with intelligent rate limiting

### 📈 Performance Optimizations
- **Code Splitting**: Lazy load components for faster initial load
- **Image Optimization**: Optimize and lazy load images
- **Bundle Size Reduction**: Reduce JavaScript bundle size
- **Database Query Optimization**: Optimize slow queries
- **Caching Layers**: Implement Redis for faster data access
- **CDN for Static Assets**: Serve static assets via CDN

### 🧪 Testing & Quality
- **Unit Tests**: Comprehensive unit test coverage
- **Integration Tests**: End-to-end testing
- **Performance Tests**: Load testing and performance benchmarks
- **Accessibility Tests**: Automated accessibility testing
- **Cross-Browser Testing**: Ensure compatibility across browsers
- **Mobile Device Testing**: Test on various mobile devices

### 📚 Documentation & Developer Experience
- **API Documentation**: Comprehensive API documentation (Swagger/OpenAPI)
- **Developer Guide**: Detailed guide for contributors
- **Architecture Documentation**: Detailed architecture diagrams
- **Deployment Guides**: Step-by-step deployment guides
- **Contributing Guidelines**: Clear contributing guidelines

---

## 🤝 Contributing

We welcome contributions! If you'd like to help implement any of these features or suggest new ones:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Priority Features
If you're looking for a good place to start, these features are high priority:
- ⚡ **Speed Mode**: Time-attack mode with competitive leaderboards (high priority)
- ✅ Unit tests for core game logic
- ✅ Enhanced hint system with contextual suggestions
- ✅ Achievement system
- ✅ PWA support
- ✅ Multi-language support
- ✅ Mobile app development

## 📧 Contact

**Developer**: Kyros Koh  
📧 Email: me@kyroskoh.com  
🐙 GitHub: [github.com/kyroskoh](https://github.com/kyroskoh)

For questions or support, please open an issue on GitHub.

---

**Enjoy playing Sudoku Mastery! 🎉**

