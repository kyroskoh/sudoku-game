# 🏆 Leaderboard Name Entry Feature

## Overview

Users can now enter their name after completing a puzzle to appear on the leaderboard with their chosen display name instead of an anonymous player ID.

## Features

### ✨ What Was Added

1. **Name Entry Modal**
   - Beautiful modal appears after puzzle completion
   - Only shows if user hasn't entered a name before
   - Validates name (2-20 characters)
   - Saves name for future games

2. **Persistent Name Storage**
   - Names stored in localStorage
   - Synced to backend database
   - Automatically pre-filled in future sessions

3. **Leaderboard Display**
   - Shows display names instead of Player IDs
   - Falls back to ID if no name provided
   - Works across all game modes

4. **Backend Support**
   - New `/api/device` endpoint for name updates
   - `displayName` field added to Device and Leaderboard models
   - Automatic name retrieval when creating leaderboard entries

## User Flow

```
Complete Puzzle
     ↓
No Name Stored? → Show Name Entry Modal
     ↓
Enter Name (or Skip)
     ↓
Name Saved Locally + Sent to Backend
     ↓
Show Completion Modal
     ↓
View Leaderboard → See Your Name!
```

## Technical Implementation

### Database Schema Changes

Added two new fields:

```prisma
model Device {
  displayName String?  // User's chosen name
  // ... other fields
}

model Leaderboard {
  displayName String?  // Cached name for faster queries
  // ... other fields
}
```

### Frontend Components

1. **NameEntryModal.tsx**
   - Modal component with name input
   - Validation and error handling
   - LocalStorage and API integration

2. **Game Pages** (Casual, Daily, Challenge)
   - State management for modal visibility
   - Hooks to show modal at right time
   - Smooth transition between modals

3. **Leaderboard Component**
   - Updated to display `displayName`
   - Graceful fallback to IDs

### Backend API

**New Endpoint: POST /api/device**

```json
{
  "deviceId": "uuid",
  "displayName": "PlayerName"
}
```

**Response:**
```json
{
  "id": "uuid",
  "displayName": "PlayerName",
  "createdAt": "2025-11-09T..."
}
```

### LocalStorage

**Keys Added:**
- `sudoku.displayName` - Stores user's chosen name

**Functions:**
- `getStoredName()` - Get stored name
- `storeName(name)` - Save name
- `clearName()` - Remove name

## Files Modified/Created

### Frontend

**New Files:**
- `frontend/src/components/NameEntryModal.tsx` - Name entry modal component
- `frontend/src/components/NameEntryModal.module.css` - Modal styles
- `frontend/src/utils/deviceApi.ts` - Device API client

**Modified Files:**
- `frontend/src/pages/CasualGame.tsx` - Added name entry flow
- `frontend/src/pages/DailyGame.tsx` - Added name entry flow
- `frontend/src/pages/ChallengeGame.tsx` - Added name entry flow
- `frontend/src/components/Leaderboard.tsx` - Display names
- `frontend/src/utils/localStorage.ts` - Name storage functions
- `frontend/src/types/index.ts` - Added `displayName` to LeaderboardEntry

### Backend

**New Files:**
- `backend/src/routes/device.ts` - Device management routes
- `backend/prisma/migrations/20251109_add_display_name/migration.sql` - Database migration

**Modified Files:**
- `backend/prisma/schema.prisma` - Added displayName fields
- `backend/src/index.ts` - Registered device routes
- `backend/src/services/attempt-service.ts` - Fetch displayName for leaderboard

## Deployment Instructions

### 1. Database Migration

```bash
# Run migration to add displayName columns
cd backend
npm run prisma:migrate
```

Or manually:

```bash
cd backend
npx prisma migrate dev --name add_display_name
```

### 2. Rebuild and Deploy

```bash
# On server
cd ~/sudoku-game
git pull

# Stop containers
sudo docker compose down

# Rebuild with new schema
sudo docker compose build --no-cache

# Start containers
sudo docker compose up -d

# Run migration inside container
sudo docker exec -it sudoku-backend npx prisma migrate deploy

# Restart to ensure changes are loaded
sudo docker compose restart
```

### 3. Verify Deployment

```bash
# Test device endpoint
curl -X POST https://sudoku.kyros.party/api/device \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-123","displayName":"TestPlayer"}'

# Should return device object with displayName
```

## Usage Examples

### First-Time Player

1. User completes their first puzzle
2. Name entry modal appears
3. User enters "ProGamer2025"
4. Name is saved
5. Future completions skip directly to results

### Returning Player

1. User already has name stored
2. Completes puzzle
3. Goes directly to completion modal
4. Leaderboard shows their saved name

### Skip Option

1. User can click "Skip" on name entry
2. Still marked as completed
3. Leaderboard shows "Player [ID]"
4. Can enter name later (on next completion)

## UI/UX Details

### Name Entry Modal

- **Title**: "🏆 Enter Your Name"
- **Subtitle**: "Your score will be added to the leaderboard!"
- **Input**: Text field (2-20 characters)
- **Buttons**: "Submit to Leaderboard", "Skip"
- **Hint**: "💡 Your name will be saved for next time"

### Validation

- Minimum 2 characters
- Maximum 20 characters
- Trimmed whitespace
- Shows inline error messages

### Visual Design

- Smooth fade-in animation
- Slide-up effect
- Dark overlay backdrop
- Matches theme system
- Mobile responsive

## Privacy & Data

- Names are optional (can skip)
- Stored locally and on server
- Not tied to email/account
- Can be cleared from localStorage
- Used only for leaderboard display

## Future Enhancements

1. **Name Change Option**
   - Settings page to update name
   - Change name button in leaderboard

2. **Name Verification**
   - Check for profanity
   - Prevent duplicate names
   - Name uniqueness badges

3. **Profile System**
   - Avatar selection
   - Bio/tagline
   - Achievement showcase

4. **Social Features**
   - Friend names highlighted
   - Tag friends in leaderboard
   - Share scores with name

## Troubleshooting

### Name Not Showing on Leaderboard

**Problem**: Name was entered but leaderboard shows Player ID

**Solution**:
```bash
# Check if name was saved locally
localStorage.getItem('sudoku.displayName')

# Check if backend has name
curl https://sudoku.kyros.party/api/device/[deviceId]

# Complete a new puzzle to update leaderboard
```

### Migration Fails

**Problem**: Database migration error

**Solution**:
```bash
# Manually apply migration
sudo docker exec -it sudoku-backend sh
cd /app
npx prisma migrate deploy
# or
npx prisma db push
exit
```

### Modal Not Appearing

**Problem**: Completion modal shows immediately

**Possible Causes**:
1. Name already stored → Check localStorage
2. Component state issue → Clear cache and reload
3. Skip was clicked previously → Delete localStorage key

## Testing Checklist

- [ ] Complete casual game without name → Modal appears
- [ ] Enter valid name → Saves successfully
- [ ] Complete another game → No modal, direct to results
- [ ] Check leaderboard → Name appears correctly
- [ ] Try invalid names (too short/long) → Error messages
- [ ] Click skip → No name, goes to results
- [ ] Clear localStorage → Modal appears again
- [ ] Test on mobile device
- [ ] Test all three game modes

## Analytics & Metrics

Track these metrics:

- % of users who enter names
- % of users who skip
- Average name length
- Name entry time
- Returning user recognition rate

## API Reference

### POST /api/device

Register or update device with display name.

**Request:**
```json
{
  "deviceId": "string (required)",
  "displayName": "string (optional, 2-20 chars)"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid | null",
  "displayName": "string | null",
  "createdAt": "ISO date string"
}
```

**Errors:**
- `400` - Missing deviceId
- `500` - Server error

### PATCH /api/device/:id

Update existing device display name.

**Request:**
```json
{
  "displayName": "string (2-20 chars)"
}
```

**Response:** `200 OK` - Same as POST

## Performance Considerations

- Name retrieval cached in leaderboard entries
- LocalStorage check before DB query
- Debounced API calls on rapid changes
- Optimistic UI updates

## Security

- No XSS vulnerabilities (sanitized input)
- Rate limiting on device updates
- UUID-based device IDs (not guessable)
- No PII collected beyond chosen name

## 🎉 Success Criteria

Feature is successful if:

1. ✅ 50%+ of users enter names
2. ✅ Names display correctly on leaderboard
3. ✅ No performance degradation
4. ✅ Smooth user experience
5. ✅ Mobile and desktop functional

## Conclusion

The name entry feature adds personalization to the leaderboard experience, encouraging competition and engagement while respecting user privacy and choice!

