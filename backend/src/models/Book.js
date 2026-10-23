import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  isbn: { type: String, default: '' },
  genre: { type: String, default: '' },
  publicationDate: { type: Date },
  status: { type: String, enum: ['Manuscript Received', 'Editing', 'Cover Design', 'Typesetting', 'Proofreading', 'ISBN Assignment', 'Printing', 'Distribution Setup', 'Published & Live'], default: 'Manuscript Received' },
  mrp: { type: Number, default: 0, min: 0 },
  copiesSold: { type: Number, default: 0, min: 0 },
  royaltyEarned: { type: Number, default: 0, min: 0 },
  royaltyPaid: { type: Number, default: 0, min: 0 },
  royaltyPending: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
export default mongoose.model('Book', bookSchema);
