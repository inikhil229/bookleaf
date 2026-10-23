import { Router } from 'express';
import { z } from 'zod';
import Ticket from '../models/Ticket.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { classifyTicket, draftReply } from '../services/ai.service.js';

const router = Router();
router.use(requireAuth);
const populate = q => q.populate('author', 'name email').populate('book', 'title isbn').populate('assignee', 'name email');
async function emitTicket(req, ticket) {
  const full = await populate(Ticket.findById(ticket._id));
  const io = req.app.get('io');
  if (io && full) {
    const authorId = full.author?._id?.toString() || full.author?.toString();
    if (authorId) io.to(`user:${authorId}`).emit('ticket:updated', { ticket: full });
    io.to('role:admin').emit('ticket:updated', { ticket: full });
  }
  return full;
}
const hideInternalNotes = (ticket, user) => {
  if (!ticket) return ticket;
  const plain = ticket.toObject ? ticket.toObject() : ticket;
  if (user.role !== 'admin') delete plain.internalNotes;
  return plain;
};
const categories = ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'];
const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
const priorities = ['Critical', 'High', 'Medium', 'Low'];

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { author: req.user._id };
    if (req.query.status && statuses.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.category && categories.includes(req.query.category)) filter.category = req.query.category;
    if (req.query.priority && priorities.includes(req.query.priority)) filter.priority = req.query.priority;
    const tickets = await populate(Ticket.find(filter)).sort({ lastActivityAt: -1 });
    res.json({ tickets: req.user.role === 'admin' ? tickets : tickets.map(t => hideInternalNotes(t, req.user)) });
  } catch (e) { next(e); }
});
router.post('/', requireRole('author'), async (req, res, next) => {
  try {
    const parsed = z.object({
      bookId: z.string().optional().nullable(), subject: z.string().trim().min(3).max(160),
      description: z.string().trim().min(10).max(5000), attachmentName: z.string().max(255).optional()
    }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Please correct the ticket form', details: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) });
    let book = null;
    if (parsed.data.bookId) {
      book = await Book.findOne({ _id: parsed.data.bookId, author: req.user._id });
      if (!book) return res.status(400).json({ message: 'Choose one of your own books' });
    }
    const classification = await classifyTicket(parsed.data.subject, parsed.data.description);
    const ticket = await Ticket.create({
      author: req.user._id, book: book?._id || null, bookTitle: book?.title || 'General / Account Level',
      subject: parsed.data.subject, description: parsed.data.description, attachmentName: parsed.data.attachmentName || '', ...classification
    });
    const created = await populate(Ticket.findById(ticket._id));
    res.status(201).json({ ticket: hideInternalNotes(created, req.user) });
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await populate(Ticket.findById(req.params.id));
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'admin' && ticket.author._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'You cannot view this ticket' });
    res.json({ ticket: hideInternalNotes(ticket, req.user) });
  } catch (e) { next(e); }
});
router.patch('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(statuses).optional(), category: z.enum(categories).optional(), priority: z.enum(priorities).optional(),
      assigneeToMe: z.boolean().optional(), internalNote: z.string().trim().max(2000).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid ticket update', details: parsed.error.issues.map(i => i.message) });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const { status, category, priority, assigneeToMe, internalNote } = parsed.data;
    if (status) ticket.status = status;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
    if (assigneeToMe) ticket.assignee = req.user._id;
    if (internalNote) ticket.internalNotes.push({ body: internalNote, author: req.user._id, authorName: req.user.name });
    ticket.lastActivityAt = new Date();
    await ticket.save();
    res.json({ ticket: await emitTicket(req, ticket) });
  } catch (e) { next(e); }
});
router.post('/:id/replies', requireRole('admin'), async (req, res, next) => {
  try {
    const parsed = z.object({ body: z.string().trim().min(2).max(5000) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Reply must contain at least 2 characters' });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    ticket.replies.push({ author: req.user._id, authorName: req.user.name, body: parsed.data.body });
    if (ticket.status === 'Open') ticket.status = 'In Progress';
    ticket.lastActivityAt = new Date();
    await ticket.save();
    res.json({ ticket: await emitTicket(req, ticket) });
  } catch (e) { next(e); }
});
router.post('/:id/draft', requireRole('admin'), async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('author', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(await draftReply(ticket));
  } catch (e) { next(e); }
});
export default router;
