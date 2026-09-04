import mongoose from 'mongoose';

const SavingsSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Savings', SavingsSchema);
