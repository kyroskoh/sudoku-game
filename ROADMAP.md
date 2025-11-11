# 🗺️ Sudoku Mastery Development Roadmap

## ⚡ Speed Mode - Detailed Implementation Plan

### 📋 Overview

Speed Mode is a time-attack game mode where players race against the clock to solve Sudoku puzzles within strict time limits. This mode adds competitive pressure, rewards fast completion, and introduces a new dimension to the leaderboard system.

**Status**: 🟡 Planned  
**Priority**: High  
**Estimated Timeline**: 4-6 weeks  
**Complexity**: Medium-High

---

## 🎯 Core Features & Requirements

### 1. Time Limit System

#### Time Limits per Difficulty
- **Easy**: 5 minutes (300 seconds)
- **Medium**: 10 minutes (600 seconds)
- **Hard**: 15 minutes (900 seconds)
- **Expert**: 20 minutes (1200 seconds)
- **Extreme**: 30 minutes (1800 seconds)

#### Implementation Details
- Timer starts immediately when puzzle is loaded (no "Ready" overlay)
- Timer counts down from time limit to zero
- When timer reaches zero, puzzle is automatically submitted
- Timer persists across page refreshes (stored in localStorage)
- Timer syncs with server for cross-device consistency

### 2. Visual Countdown Timer

#### Color-Coded Warnings
- **Green** (100% - 60% time remaining): Normal state, no urgency
- **Yellow** (60% - 30% time remaining): Warning state, moderate urgency
- **Orange** (30% - 10% time remaining): Critical state, high urgency
- **Red** (10% - 0% time remaining): Emergency state, extreme urgency

#### Visual Indicators
- Large, prominent timer display (top center of screen)
- Pulsing animation when in red zone
- Smooth color transitions between states
- Optional: Sound effects for time warnings (configurable)
- Optional: Vibration feedback on mobile devices (red zone only)

#### Timer Display Format
```
MM:SS (e.g., 04:32)
- Minutes and seconds always visible
- Large, readable font (minimum 24px)
- Bold font weight for visibility
- High contrast against background
```

### 3. Bonus Points & Scoring System

#### Early Finish Bonuses
- **2x Multiplier**: Finish in ≤ 50% of time limit
- **1.5x Multiplier**: Finish in ≤ 75% of time limit
- **1.0x Multiplier**: Finish within time limit (no bonus)
- **0.5x Multiplier**: Finish after time limit (auto-submitted, incomplete)

#### Score Calculation Formula
```
Base Score = 1000 × (difficulty_multiplier)
Difficulty Multipliers:
  - Easy: 1.0
  - Medium: 1.5
  - Hard: 2.0
  - Expert: 3.0
  - Extreme: 5.0

Time Bonus = time_multiplier × (1 - (time_used / time_limit))
Final Score = Base Score × time_multiplier × (1 + time_bonus)
```

#### Example Calculations
- Easy puzzle completed in 2 minutes (50% of 5 min limit):
  - Base Score: 1000 × 1.0 = 1000
  - Time Multiplier: 2.0 (≤ 50%)
  - Time Bonus: 2.0 × (1 - 0.5) = 1.0
  - Final Score: 1000 × 2.0 × (1 + 1.0) = **4000 points**

- Hard puzzle completed in 12 minutes (80% of 15 min limit):
  - Base Score: 1000 × 2.0 = 2000
  - Time Multiplier: 1.0 (no bonus)
  - Time Bonus: 1.0 × (1 - 0.8) = 0.2
  - Final Score: 2000 × 1.0 × (1 + 0.2) = **2400 points**

### 4. Progressive Difficulty Unlocking

#### Unlock System
- **Easy**: Available immediately
- **Medium**: Unlock after completing 3 Easy puzzles within time limit
- **Hard**: Unlock after completing 5 Medium puzzles within time limit
- **Expert**: Unlock after completing 7 Hard puzzles within time limit
- **Extreme**: Unlock after completing 10 Expert puzzles within time limit

#### Implementation
- Track unlock progress in localStorage and database
- Show lock icon on locked difficulties
- Display unlock requirements when hovering over locked difficulty
- Celebration animation when unlocking new difficulty
- Persist unlock status across devices (via user account/device sync)

### 5. Speed Streaks

#### Streak Tracking
- Track consecutive speed solves completed within time limit
- Streak resets if:
  - Puzzle is not completed within time limit
  - User manually exits before completion
  - Puzzle is auto-submitted incomplete
- Streak persists across difficulties (combined streak)
- Display current streak prominently in UI

#### Streak Rewards
- **3 Streak**: "Getting Started" badge
- **5 Streak**: "On a Roll" badge
- **10 Streak**: "Speed Runner" badge
- **25 Streak**: "Consistency Master" badge
- **50 Streak**: "Speed Legend" badge
- **100 Streak**: "Unstoppable" badge

### 6. Dedicated Speed Leaderboards

#### Leaderboard Types
1. **Global Speed Leaderboard**: All-time fastest times per difficulty
2. **Weekly Speed Leaderboard**: Fastest times this week per difficulty
3. **Monthly Speed Leaderboard**: Fastest times this month per difficulty
4. **Speed Score Leaderboard**: Highest scores (including bonuses) per difficulty

#### Ranking Criteria
- **Time-based**: Ranked by completion time (fastest first)
- **Score-based**: Ranked by final score (highest first)
- Separate leaderboards for each difficulty level
- Show top 50 players (expandable to top 100)

#### Display Information
- Rank position
- Player name/display name
- Completion time (MM:SS format)
- Final score (for score-based leaderboards)
- Date completed
- Difficulty level
- Streak count (if applicable)

### 7. Speed Achievements & Badges

#### Achievement Categories

**Time-Based Achievements**
- ⚡ "Lightning Fast": Complete Easy puzzle in < 2 minutes
- ⚡⚡ "Speed Demon": Complete Medium puzzle in < 5 minutes
- ⚡⚡⚡ "Time Master": Complete Hard puzzle in < 8 minutes
- ⚡⚡⚡⚡ "Expert Speedster": Complete Expert puzzle in < 12 minutes
- ⚡⚡⚡⚡⚡ "Extreme Velocity": Complete Extreme puzzle in < 20 minutes

**Streak Achievements**
- 🔥 "Getting Started": 3 consecutive speed solves
- 🔥🔥 "On a Roll": 5 consecutive speed solves
- 🔥🔥🔥 "Speed Runner": 10 consecutive speed solves
- 🔥🔥🔥🔥 "Consistency Master": 25 consecutive speed solves
- 🔥🔥🔥🔥🔥 "Speed Legend": 50 consecutive speed solves
- 🔥🔥🔥🔥🔥🔥 "Unstoppable": 100 consecutive speed solves

**Score-Based Achievements**
- 💎 "Score Hunter": Achieve 5000+ points in a single puzzle
- 💎💎 "Point Master": Achieve 10000+ points in a single puzzle
- 💎💎💎 "Score Legend": Achieve 20000+ points in a single puzzle

**Completion Achievements**
- ✅ "Speed Novice": Complete 10 speed puzzles
- ✅✅ "Speed Enthusiast": Complete 50 speed puzzles
- ✅✅✅ "Speed Veteran": Complete 100 speed puzzles
- ✅✅✅✅ "Speed Master": Complete 500 speed puzzles

#### Badge Display
- Show badges in user profile
- Display badges next to name on leaderboards
- Badge collection page showing all earned badges
- Share badges on social media (future feature)

### 8. No Pause Option

#### Rationale
- Ensures fair competition (no time manipulation)
- Adds to the challenge and intensity
- Prevents players from pausing to think/plan

#### Implementation
- Remove pause button in Speed Mode UI
- Disable keyboard shortcuts for pause (if any)
- Show warning message if user tries to navigate away
- Auto-save progress every 10 seconds (for crash recovery)

### 9. Auto-Submit on Time Expiry

#### Behavior
- When timer reaches 0:00, automatically submit current board state
- Validate solution (even if incomplete)
- Calculate score based on completion percentage
- Show completion screen with:
  - Completion status (Complete/Incomplete)
  - Time taken
  - Final score
  - Percentage completed
  - Correct cells count
  - Mistakes count

#### User Experience
- Smooth transition to completion screen
- Clear indication that time expired
- Option to retry immediately
- Option to view solution
- Option to share result (future feature)

---

## 🏗️ Technical Implementation

### Backend Changes

#### 1. Database Schema Updates

**New Table: `SpeedModeProgress`**
```prisma
model SpeedModeProgress {
  id            String   @id @default(uuid())
  userId        String?
  deviceId      String?
  difficulty    String   // easy, medium, hard, expert, extreme
  unlocked      Boolean  @default(false)
  puzzlesCompleted Int   @default(0)
  currentStreak Int      @default(0)
  bestStreak    Int      @default(0)
  bestTime      Int?     // milliseconds
  bestScore     Int?     @default(0)
  totalPuzzles  Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User?    @relation(fields: [userId], references: [id])
  device        Device?  @relation(fields: [deviceId], references: [id])

  @@unique([userId, deviceId, difficulty])
  @@index([userId, deviceId])
  @@index([difficulty, bestTime])
  @@index([difficulty, bestScore])
}
```

**New Table: `SpeedModeAttempt`**
```prisma
model SpeedModeAttempt {
  id            String   @id @default(uuid())
  puzzleId      String
  userId        String?
  deviceId      String?
  difficulty    String
  timeMs        Int      // completion time in milliseconds
  timeLimitMs   Int      // time limit for this difficulty
  score         Int      @default(0)
  completed     Boolean  @default(false)
  completionPercent Float @default(0)
  mistakes      Int      @default(0)
  hintsUsed     Int      @default(0)
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  puzzle        Puzzle   @relation(fields: [puzzleId], references: [id])
  user          User?    @relation(fields: [userId], references: [id])
  device        Device?  @relation(fields: [deviceId], references: [id])

  @@index([difficulty, timeMs])
  @@index([difficulty, score])
  @@index([userId, deviceId])
  @@index([completedAt])
}
```

**New Table: `SpeedModeAchievement`**
```prisma
model SpeedModeAchievement {
  id            String   @id @default(uuid())
  userId        String?
  deviceId      String?
  achievementId String  // e.g., "lightning_fast", "speed_demon"
  unlockedAt    DateTime @default(now())
  metadata      Json?    // Additional data (e.g., time achieved, score)

  user          User?    @relation(fields: [userId], references: [id])
  device        Device?  @relation(fields: [deviceId], references: [id])

  @@unique([userId, deviceId, achievementId])
  @@index([userId, deviceId])
  @@index([achievementId])
}
```

**Update `Puzzle` Model**
```prisma
model Puzzle {
  // ... existing fields ...
  mode          String   @default("casual") // Add "speed" as option
  // ... rest of fields ...
}
```

**Update `Leaderboard` Model**
```prisma
model Leaderboard {
  // ... existing fields ...
  mode          String   @default("casual") // Add "speed" as option
  score         Int?     // Add score field for speed mode
  // ... rest of fields ...
}
```

#### 2. New API Endpoints

**Speed Mode Progress**
```
GET    /api/speed/progress?difficulty={difficulty}&userId={id}&deviceId={id}
POST   /api/speed/progress
PATCH  /api/speed/progress/:id
```

**Speed Mode Attempts**
```
POST   /api/speed/attempts
GET    /api/speed/attempts/:id
GET    /api/speed/attempts?userId={id}&deviceId={id}&difficulty={difficulty}
```

**Speed Mode Leaderboards**
```
GET    /api/speed/leaderboard/time?difficulty={difficulty}&period={all|week|month}&limit={limit}
GET    /api/speed/leaderboard/score?difficulty={difficulty}&period={all|week|month}&limit={limit}
```

**Speed Mode Achievements**
```
GET    /api/speed/achievements?userId={id}&deviceId={id}
POST   /api/speed/achievements/check
```

**Speed Mode Unlocks**
```
GET    /api/speed/unlocks?userId={id}&deviceId={id}
POST   /api/speed/unlock
```

#### 3. New Services

**`speed-mode-service.ts`**
- Handle speed mode puzzle generation
- Manage difficulty unlocking logic
- Track streaks and progress
- Calculate scores and bonuses
- Check achievement eligibility
- Update leaderboards

**`speed-leaderboard-service.ts`**
- Generate time-based leaderboards
- Generate score-based leaderboards
- Handle period filtering (all/week/month)
- Cache leaderboard data for performance

**`speed-achievement-service.ts`**
- Check achievement conditions
- Award achievements
- Track achievement progress
- Generate achievement metadata

### Frontend Changes

#### 1. New Components

**`SpeedTimer.tsx`**
- Display countdown timer
- Handle color transitions
- Show time warnings
- Emit events for time expiry

**`SpeedModePage.tsx`**
- Main speed mode page component
- Difficulty selector (with unlock indicators)
- Puzzle loading and display
- Integration with timer and game components

**`SpeedCompletionModal.tsx`**
- Display completion results
- Show score breakdown
- Display achievements unlocked
- Show leaderboard rank (if applicable)

**`SpeedLeaderboard.tsx`**
- Display speed mode leaderboards
- Toggle between time-based and score-based
- Filter by period (all/week/month)
- Show user's rank and position

**`SpeedProgress.tsx`**
- Display unlock progress
- Show current streak
- Display best times and scores
- Show achievement progress

**`SpeedAchievements.tsx`**
- Display all speed mode achievements
- Show earned vs. unearned badges
- Display achievement details and requirements

#### 2. Updated Components

**`Grid.tsx`**
- Remove pause functionality in speed mode
- Add time warning indicators
- Handle auto-submit on time expiry

**`Controls.tsx`**
- Hide pause button in speed mode
- Display speed timer prominently
- Show score multiplier indicator

**`Header.tsx`**
- Add Speed Mode navigation item
- Show current streak badge
- Display speed mode achievements

#### 3. State Management Updates

**`gameStore.ts`**
- Add `speedMode` boolean flag
- Add `timeLimit` and `timeRemaining` state
- Add `speedScore` and `scoreMultiplier` state
- Add `speedStreak` state
- Add `unlockedDifficulties` state
- Add `speedAchievements` state

**New Store: `speedModeStore.ts`**
- Manage speed mode-specific state
- Handle timer logic
- Track progress and unlocks
- Manage achievements

#### 4. API Integration

**`api.ts`**
- Add speed mode API methods:
  - `getSpeedProgress()`
  - `updateSpeedProgress()`
  - `createSpeedAttempt()`
  - `getSpeedLeaderboard()`
  - `getSpeedAchievements()`
  - `checkSpeedUnlocks()`

#### 5. Routing Updates

**`App.tsx`**
- Add `/speed` route
- Add `/speed/leaderboard` route
- Add `/speed/achievements` route
- Add `/speed/progress` route

---

## 🎨 UI/UX Design Specifications

### Speed Mode Page Layout

```
┌─────────────────────────────────────────┐
│  Header (with Speed Mode indicator)     │
├─────────────────────────────────────────┤
│  [Difficulty Selector]                   │
│  Easy [🔓] Medium [🔒] Hard [🔒] ...   │
├─────────────────────────────────────────┤
│  ⏱️ 04:32  [Large Timer - Color Coded] │
│  Score: 2,400  Multiplier: 1.5x         │
│  Streak: 🔥 5                            │
├─────────────────────────────────────────┤
│  [Sudoku Grid]                          │
│  (No pause button visible)              │
├─────────────────────────────────────────┤
│  [Number Pad]                           │
│  [Controls - No Pause]                   │
└─────────────────────────────────────────┘
```

### Timer Display Design

**Normal State (Green)**
- Background: `#4CAF50` (green)
- Text: White
- Size: 48px font, bold
- Animation: None

**Warning State (Yellow)**
- Background: `#FFC107` (yellow)
- Text: Dark gray/black
- Size: 48px font, bold
- Animation: Subtle pulse (1.05x scale)

**Critical State (Orange)**
- Background: `#FF9800` (orange)
- Text: White
- Size: 52px font, bold
- Animation: Moderate pulse (1.1x scale)

**Emergency State (Red)**
- Background: `#F44336` (red)
- Text: White
- Size: 56px font, bold
- Animation: Strong pulse (1.15x scale), faster frequency

### Completion Screen Design

```
┌─────────────────────────────────────────┐
│  ⏱️ Time's Up!                          │
├─────────────────────────────────────────┤
│  Status: ⚠️ Incomplete                  │
│  Time Taken: 15:00 / 15:00              │
│  Completion: 87%                        │
│  Score: 1,200                           │
│  Streak: 🔥 5 → 0 (Reset)               │
├─────────────────────────────────────────┤
│  [View Solution] [Retry] [Leaderboard] │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Requirements

### Unit Tests

**Backend**
- Speed mode service logic
- Score calculation formulas
- Achievement checking logic
- Unlock progression logic
- Leaderboard generation

**Frontend**
- Timer countdown logic
- Score calculation display
- Color transition logic
- Auto-submit functionality

### Integration Tests

- Speed mode puzzle generation
- Attempt creation and submission
- Leaderboard updates
- Achievement unlocking
- Difficulty unlocking
- Streak tracking

### E2E Tests

- Complete speed mode flow (start → solve → submit)
- Time expiry auto-submit
- Difficulty unlocking
- Achievement unlocking
- Leaderboard display

### Performance Tests

- Timer accuracy (no drift)
- Leaderboard query performance
- Real-time updates (if implemented)

---

## 📅 Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema updates
- [ ] Backend API endpoints
- [ ] Basic speed mode service
- [ ] Frontend routing and page structure
- [ ] Timer component (basic)

### Phase 2: Core Features (Week 2-3)
- [ ] Timer with color transitions
- [ ] Score calculation system
- [ ] Auto-submit on time expiry
- [ ] Difficulty unlocking system
- [ ] Streak tracking

### Phase 3: Leaderboards & Achievements (Week 3-4)
- [ ] Speed leaderboard service
- [ ] Leaderboard UI components
- [ ] Achievement system backend
- [ ] Achievement UI components
- [ ] Badge display system

### Phase 4: Polish & Testing (Week 4-5)
- [ ] UI/UX refinements
- [ ] Animation and transitions
- [ ] Sound effects (optional)
- [ ] Comprehensive testing
- [ ] Bug fixes

### Phase 5: Deployment (Week 5-6)
- [ ] Production deployment
- [ ] Performance optimization
- [ ] Monitoring and analytics
- [ ] User feedback collection

---

## 🔗 Dependencies

### Backend Dependencies
- No new major dependencies required
- Existing Prisma, Express setup sufficient

### Frontend Dependencies
- No new major dependencies required
- Existing React, Zustand setup sufficient
- May need animation library (Framer Motion or CSS animations)

### External Services
- None required (all features can be self-hosted)

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)
- **Adoption Rate**: % of users who try Speed Mode
- **Retention Rate**: % of users who return to Speed Mode
- **Completion Rate**: % of puzzles completed within time limit
- **Average Completion Time**: Per difficulty level
- **Leaderboard Engagement**: % of users who check leaderboards
- **Achievement Unlock Rate**: % of users who unlock achievements

### Goals
- 30% of active users try Speed Mode within first month
- 20% of users become regular Speed Mode players
- Average completion rate > 60% for Easy/Medium difficulties
- Leaderboard views > 1000 per week
- At least 10% of users unlock at least one achievement

---

## 🚧 Known Challenges & Considerations

### Technical Challenges
1. **Timer Accuracy**: Ensuring timer doesn't drift across devices/browsers
2. **Auto-Submit Timing**: Handling edge cases when timer expires mid-action
3. **Leaderboard Performance**: Efficiently querying and caching leaderboard data
4. **Cross-Device Sync**: Ensuring progress/unlocks sync correctly

### UX Challenges
1. **Pressure Management**: Balancing challenge with frustration
2. **Accessibility**: Ensuring timer and warnings are accessible
3. **Mobile Experience**: Optimizing for smaller screens and touch input
4. **Onboarding**: Teaching users how Speed Mode works

### Business Considerations
1. **Cheating Prevention**: Ensuring fair competition (server-side validation)
2. **Server Load**: Handling increased API calls from timer sync
3. **Storage**: Managing increased data from speed mode attempts

---

## 🔮 Future Enhancements

### Phase 2 Features (Post-Launch)
- **Speed Mode Tournaments**: Scheduled competitive events
- **Speed Mode Replays**: Watch top players' solutions
- **Speed Mode Challenges**: Special time-limited challenges
- **Social Features**: Share speed mode results
- **Speed Mode Analytics**: Detailed performance tracking
- **Custom Time Limits**: User-defined time limits (practice mode)

### Advanced Features
- **Multiplayer Speed Mode**: Race against other players in real-time
- **Speed Mode Variants**: Different rule sets (e.g., no notes, no undo)
- **Speed Mode Seasons**: Seasonal leaderboards with rewards
- **Speed Mode Leagues**: Ranked competitive play

---

## 📝 Notes

- Speed Mode should be opt-in (users choose to play it)
- Consider adding a tutorial for first-time Speed Mode players
- Monitor user feedback closely after launch
- Be prepared to adjust time limits based on user data
- Consider A/B testing different time limit configurations

---

**Last Updated**: 2025-01-15  
**Next Review**: After Phase 1 completion

