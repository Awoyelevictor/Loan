import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['Savings Deposit', 'Savings Withdrawal', 'Share Contribution', 'Loan Repayment', 'Loan Disbursement', 'Other'],
    required: true
  },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Successful', 'Failed', 'Rejected'], default: 'Pending' },
  reference: { type: String },
  description: { type: String },
  fsbcAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'FSBCAccount' }
}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);
