import mongoose from 'mongoose';

const ShareCapitalSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalShares: { type: Number, default: 0 },
  shareValue: { type: Number, default: 1000 },
  totalValue: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ShareCapital', ShareCapitalSchema);
