import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanId: { type: String, required: true, unique: true },
  loanType: { type: String, required: true },
  requestedAmount: { type: Number, required: true },
  approvedAmount: { type: Number },
  interestRate: { type: Number, required: true },
  durationMonths: { type: Number, required: true },
  purpose: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Disbursed', 'Active', 'Completed'], 
    default: 'Pending' 
  },
  guarantors: [{
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amountGuaranteed: { type: Number },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
  }],
  totalInterest: { type: Number },
  totalRepayment: { type: Number },
  amountPaid: { type: Number, default: 0 },
  outstandingBalance: { type: Number },
  nextRepaymentDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('Loan', LoanSchema);
