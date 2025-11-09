# 🔍 Developer Mode Features

## Overview

Debug/developer features accessible via URL parameters for testing and development.

## Features

### 1. Show Answers (`?showans=true`)
Display correct answers in empty cells.

### 2. Show Device ID (`?showid=true`)
Display user's device ID and name in the header.

### 3. Combine Both (`?showans=true&showid=true`)
Use both features together.

## Usage

### Show Answers Only
```
http://localhost:3010/casual?showans=true
http://localhost:3010/daily?showans=true&difficulty=easy
http://localhost:3010/challenge?showans=true
```

**What It Shows:**
- Small red numbers in top-right corner of empty cells
- The correct answer for each empty cell
- Helps verify puzzle is solvable

### Show Device ID Only
```
http://localhost:3010/casual?showid=true
http://localhost:3010/daily?showid=true
http://localhost:3010/challenge?showid=true
http://localhost:3010/leaderboard?showid=true
```

**What It Shows:**
- Debug info panel in header
- User's display name
- User's device ID (UUID)

**Example Display:**
```
┌────────────────────────────────────────┐
│ 🧩 Sudoku Mastery                     │
│ ┌──────────────────────────────────┐  │
│ │ 🔍 Debug Info:                   │  │
│ │ Name: John Doe                   │  │
│ │ Device ID: abc-123-def-456       │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Combine Both Features
```
http://localhost:3010/casual?showans=true&showid=true
http://localhost:3010/daily?showans=true&showid=true&difficulty=medium
```

**What It Shows:**
- Debug info in header (name + device ID)
- Correct answers in grid cells
- Full debug/testing mode

## Feature Details

### Show Answers (`?showans=true`)

#### Visual Appearance
```
┌─────┬─────┬─────┐
│  5  │  3  │  8  │  ← Given (blue)
├─────┼─────┼─────┤
│     │  6  │  2  │  ← User input (black)
│   ⁷ │     │   ⁴ │  ← Debug answers (small red)
├─────┼─────┼─────┤
│  1  │     │     │
│     │   ⁹ │   ⁵ │
└─────┴─────┴─────┘
```

#### Implementation
- **Location**: `frontend/src/components/Grid.tsx`
- **Style**: `frontend/src/components/Grid.module.css`
- **API**: `GET /api/puzzles/:id?showsolution=true`
- **Backend**: `backend/src/routes/puzzles.ts`

#### How It Works
1. Detects `?showans=true` in URL
2. Fetches solution from backend with `?showsolution=true`
3. Displays small red numbers in empty cells
4. Logs: `🔓 Debug mode activated: Showing answers`

### Show Device ID (`?showid=true`)

#### Visual Appearance

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│ 🧩 Sudoku Mastery  🔍 Debug Info:  Name: John           │
│                                      Device ID: abc-123   │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────────┐
│ 🧩 Sudoku Mastery        │
│ ┌──────────────────────┐ │
│ │ 🔍 Debug Info:       │ │
│ │ Name: John Doe       │ │
│ │ Device ID:           │ │
│ │ abc-123-def-456      │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

#### Implementation
- **Location**: `frontend/src/components/Header.tsx`
- **Style**: `frontend/src/components/Header.module.css`
- **Data Source**: `localStorage` (deviceId, displayName)

#### How It Works
1. Detects `?showid=true` in URL
2. Reads device ID from localStorage (`getDeviceId()`)
3. Reads display name from localStorage (`getStoredName()`)
4. Displays debug panel in header
5. Logs: `🔍 Debug mode: Showing Device ID`

#### Information Shown
- **Name**: Display name (or "Anonymous" if not set)
- **Device ID**: UUID stored in localStorage
  - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
  - Unique per browser/device
  - Used for leaderboard tracking

## Use Cases

### 1. Testing Puzzle Generation
```
URL: ?showans=true
Purpose: Verify puzzle is solvable and has correct solution
```

### 2. QA Testing
```
URL: ?showans=true
Purpose: Quickly complete puzzles to test flows
```

### 3. Debugging Leaderboard
```
URL: ?showid=true
Purpose: See which device ID is being used for leaderboard entries
```

### 4. User Support
```
URL: ?showid=true
Purpose: User can share their device ID for support
```

### 5. Full Debug Mode
```
URL: ?showans=true&showid=true
Purpose: Complete debugging environment
```

## Examples

### Test Casual Mode
```
http://localhost:3010/casual?showans=true&showid=true
```
- See answers to quickly fill puzzle
- See device ID to verify leaderboard entry

### Test Daily Puzzle
```
http://localhost:3010/daily?showans=true&showid=true&difficulty=easy
```
- Check daily puzzle solution
- Verify device ID for streak tracking

### Test Leaderboard Entry
```
# Step 1: Play with showid
http://localhost:3010/casual?showid=true

# Copy device ID from header
# Device ID: abc-123-def-456

# Step 2: Check leaderboard for that ID
http://localhost:3010/leaderboard?showid=true
```

### Production Testing
```
https://sudoku.kyros.party/casual?showans=true&showid=true
```
- Works on production too!
- Use for live debugging

## Browser Console

### With showans=true
```javascript
console.log('🔓 Debug mode activated: Showing answers');
```

### With showid=true
```javascript
console.log('🔍 Debug mode: Showing Device ID');
```

## Responsive Design

### Desktop (>768px)
```css
.debugInfo {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  font-size: 0.85rem;
}
```

### Mobile (≤768px)
```css
.debugInfo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
  width: 100%;
}
```

## Security Considerations

### ⚠️ Not Production-Secure

**These are DEBUG features!**

Issues:
- No authentication required
- Anyone can access via URL parameter
- Device IDs are UUIDs (not sensitive but should be private)
- Solutions are exposed

### Why It's Still Okay

1. **Casual Gaming**: Not competitive for real prizes
2. **Personal Choice**: Users who cheat only cheat themselves
3. **Development Tool**: Intended for testing
4. **Easy to Remove**: Can be disabled in production builds

### Future Security (Optional)

#### Option 1: Environment Check
```typescript
// Only allow in development
if (import.meta.env.DEV) {
  const params = new URLSearchParams(window.location.search);
  const showAns = params.get('showans') === 'true';
  setShowAnswers(showAns);
}
```

#### Option 2: Secret Key
```typescript
// Require secret key
const params = new URLSearchParams(window.location.search);
const showAns = params.get('showans') === 'secretkey123';
setShowAnswers(showAns);
```

## URL Parameter Combinations

### All Possible Combinations

| showans | showid | Result |
|---------|--------|--------|
| false   | false  | Normal mode |
| true    | false  | Show answers only |
| false   | true   | Show device ID only |
| true    | true   | Full debug mode |

### Examples

```
# Normal
http://localhost:3010/casual

# Answers only
http://localhost:3010/casual?showans=true

# Device ID only
http://localhost:3010/casual?showid=true

# Full debug
http://localhost:3010/casual?showans=true&showid=true

# With difficulty
http://localhost:3010/daily?showans=true&showid=true&difficulty=medium

# Order doesn't matter
http://localhost:3010/casual?showid=true&showans=true
```

## Testing Checklist

### Test showans=true
- [ ] Visit `?showans=true`
- [ ] Red numbers appear in empty cells
- [ ] Numbers are correct answers
- [ ] Numbers disappear when cell is filled
- [ ] Works on all difficulties
- [ ] Works on all modes

### Test showid=true
- [ ] Visit `?showid=true`
- [ ] Debug panel appears in header
- [ ] Shows correct name
- [ ] Shows valid UUID device ID
- [ ] Responsive on mobile
- [ ] Persists across pages

### Test Combined
- [ ] Visit `?showans=true&showid=true`
- [ ] Both features work
- [ ] No conflicts
- [ ] Layout looks good

## Files Modified

### Show Answers (`showans`)
1. `frontend/src/components/Grid.tsx` - Logic
2. `frontend/src/components/Grid.module.css` - Styling
3. `backend/src/routes/puzzles.ts` - API endpoint

### Show Device ID (`showid`)
1. `frontend/src/components/Header.tsx` - Logic
2. `frontend/src/components/Header.module.css` - Styling

## API Endpoints

### Get Solution (for showans)
```
GET /api/puzzles/:id?showsolution=true
```

**Response:**
```json
{
  "id": "abc-123",
  "mode": "casual",
  "difficulty": "easy",
  "givens": [[...]],
  "solution": [[5,3,8,...]]  // ← Only returned if showsolution=true
}
```

## LocalStorage Keys

### Device ID (for showid)
```javascript
// Key
'sudoku.deviceId'

// Value (example)
'abc-123-def-456-ghi-789'

// Access
import { getDeviceId } from '../utils/localStorage';
const deviceId = getDeviceId();
```

### Display Name (for showid)
```javascript
// Key
'sudoku.displayName'

// Value (example)
'John Doe'

// Access
import { getStoredName } from '../utils/localStorage';
const name = getStoredName();
```

## Troubleshooting

### Issue: Answers Not Showing
**Solution:**
1. Check URL has `?showans=true`
2. Check backend is running
3. Check console for errors
4. Try refreshing page

### Issue: Device ID Not Showing
**Solution:**
1. Check URL has `?showid=true`
2. Check localStorage has deviceId
3. Open DevTools → Application → Local Storage
4. Look for `sudoku.deviceId`

### Issue: Wrong Device ID
**Solution:**
1. Clear localStorage
2. Refresh page
3. New device ID will be generated

### Issue: Layout Broken
**Solution:**
1. Check browser width (may be too narrow)
2. Try desktop mode
3. Refresh page

## Quick Reference

### URL Parameters
```
?showans=true         # Show answers
?showid=true          # Show device ID
?showans=true&showid=true  # Both
```

### Console Commands
```javascript
// Get device ID
localStorage.getItem('sudoku.deviceId')

// Get display name
localStorage.getItem('sudoku.displayName')

// Clear and regenerate
localStorage.removeItem('sudoku.deviceId')
location.reload()
```

### Testing Commands
```bash
# Start dev server
npm run dev

# Test answers
http://localhost:3010/casual?showans=true

# Test device ID
http://localhost:3010/casual?showid=true

# Test both
http://localhost:3010/casual?showans=true&showid=true
```

## Summary

### Show Answers (`?showans=true`)
✅ Displays correct answers in grid
✅ Small red numbers in corners
✅ Helps with testing
✅ Works on all modes/difficulties

### Show Device ID (`?showid=true`)
✅ Displays device ID in header
✅ Shows display name
✅ Helps with debugging
✅ Mobile-responsive

### Combined
✅ Use both together
✅ Full debug environment
✅ Perfect for testing

## 🔍 Ready to Use!

Test both features:
```
http://localhost:3010/casual?showans=true&showid=true
```

Perfect for development and testing! 🎮🔍✨

