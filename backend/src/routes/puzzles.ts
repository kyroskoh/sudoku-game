/**
 * Puzzle Routes
 */

import { Router, Request, Response } from 'express';
import { puzzleService } from '../services/puzzle-service';
import { Difficulty } from '../services/sudoku-generator';

const router = Router();

/**
 * GET /api/puzzles?mode=[casual|daily|challenge]&difficulty=...
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { mode, difficulty } = req.query;

    if (!mode || !difficulty) {
      return res.status(400).json({ error: 'Mode and difficulty are required' });
    }

    const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'extreme'];
    if (!validDifficulties.includes(difficulty as string)) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }

    let puzzle;
    if (mode === 'casual') {
      puzzle = await puzzleService.getCasualPuzzle(difficulty as Difficulty);
    } else if (mode === 'challenge') {
      puzzle = await puzzleService.getChallengePuzzle(difficulty as Difficulty, 'standard');
    } else {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    res.json(puzzle);
  } catch (error) {
    console.error('Error getting puzzle:', error);
    res.status(500).json({ error: 'Failed to get puzzle' });
  }
});

/**
 * GET /api/puzzles/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const puzzle = await puzzleService.getPuzzleById(id);
    res.json(puzzle);
  } catch (error) {
    console.error('Error getting puzzle:', error);
    res.status(404).json({ error: 'Puzzle not found' });
  }
});

/**
 * POST /api/puzzles/:id/validate
 */
router.post('/:id/validate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { board } = req.body;

    if (!board || !Array.isArray(board)) {
      return res.status(400).json({ error: 'Invalid board' });
    }

    const isValid = await puzzleService.validateSolution(id, board);
    res.json({ valid: isValid });
  } catch (error) {
    console.error('Error validating puzzle:', error);
    res.status(500).json({ error: 'Failed to validate puzzle' });
  }
});

export default router;

