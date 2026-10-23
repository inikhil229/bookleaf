import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  body: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ticketSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
  bookTitle: { type: String, default: 'General / Account Level' },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open', index: true },
  category: { type: String, enum: ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'], default: 'General Inquiry', index: true },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium', index: true },
  aiClassified: { type: Boolean, default: false },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  internalNotes: [{ body: { type: String, trim: true }, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, authorName: String, createdAt: { type: Date, default: Date.now } }],
  replies: [replySchema],
  attachmentName: { type: String, default: '' },
  lastActivityAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
ticketSchema.index({ status: 1, priority: 1, createdAt: 1 });
export default mongoose.model('Ticket', ticketSchema);
