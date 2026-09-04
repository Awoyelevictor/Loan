import mongoose from 'mongoose';

const FSBCAccountSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true, unique: true },
  bankName: { type: String, required: true },
  accountName: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

export default mongoose.model('FSBCAccount', FSBCAccountSchema);
