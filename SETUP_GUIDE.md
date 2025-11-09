# 🚀 Quick Setup Guide

This guide will help you get Sudoku Mastery up and running in just a few minutes!

## Prerequisites

Before you begin, make sure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- A terminal/command prompt
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game
```

### 2️⃣ Setup Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Wait for dependencies to install, then:

```bash
# Generate Prisma client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate
```

You should see a confirmation that migrations were applied.

Start the backend server:

```bash
npm run dev
```

You should see:
```
🚀 Sudoku Mastery API server running on port 3011
📍 http://localhost:3011
🏥 Health check: http://localhost:3011/api/health
```

✅ **Backend is ready!** Keep this terminal open.

### 3️⃣ Setup Frontend

Open a **NEW terminal** (keep the backend running) and run:

```bash
cd frontend
npm install
```

Wait for dependencies to install, then:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3010/
  ➜  Network: use --host to expose
```

✅ **Frontend is ready!**

### 4️⃣ Open Your Browser

Navigate to: **http://localhost:3010**

You should see the Sudoku Mastery home page! 🎉

## Testing the Setup

1. **Health Check**: Visit http://localhost:3011/api/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Play a Game**:
   - Click "Casual Mode"
   - Select a difficulty
   - Click "Start Game"
   - The puzzle should load and you can start playing!

3. **Try Daily Puzzle**:
   - Click "Daily" in the header
   - Today's puzzle should load automatically

## Troubleshooting

### Backend won't start
- **Error**: `Port 3011 is already in use`
  - **Solution**: Change PORT in `backend/.env` or stop the process using port 3011
  
- **Error**: `Cannot find module '@prisma/client'`
  - **Solution**: Run `npm run prisma:generate` in the backend folder

### Frontend won't start
- **Error**: `Port 3010 is already in use`
  - **Solution**: Vite will offer a different port (e.g., 3011). Use that instead.

- **Error**: API calls failing
  - **Solution**: Make sure the backend is running on port 3011

### Database issues
- **Error**: Migration failed
  - **Solution**: Delete `backend/data/app.sqlite` and run migrations again

## Development Tips

### Hot Reload
- Backend: Uses nodemon, auto-restarts on file changes
- Frontend: Vite HMR, updates instantly

### Viewing the Database
```bash
cd backend
npm run prisma:studio
```
Opens a GUI at http://localhost:5555

### Stopping the Servers
- Press `Ctrl+C` in each terminal

### Restarting
- Backend: `npm run dev` in backend folder
- Frontend: `npm run dev` in frontend folder

## Next Steps

- Read the [full README](README.md) for detailed documentation
- Check [backend README](backend/README.md) for API details
- Check [frontend README](frontend/README.md) for UI customization
- Explore the code and start building!

## Common Commands Cheat Sheet

### Backend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run prisma:studio # Open database GUI
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Need Help?

- Check the logs in your terminal
- Look for error messages in the browser console (F12)
- Review the README files
- Open an issue on GitHub

Happy coding! 🧩✨

