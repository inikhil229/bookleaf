import { Router } from 'express';
import Book from '../models/Book.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { author: req.user._id };
    const books = await Book.find(filter).populate('author', 'name email').sort({ updatedAt: -1 });
    res.json({ books });
  } catch (e) { next(e); }
});
export default router;
