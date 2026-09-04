import { 
  recordDeposit, 
  recordSharePurchase, 
  applyForLoan, 
  repayLoan, 
  recordWithdrawal,
  findUserById 
} from '../services/dataService.js';

export const handleDeposit = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, notes, paymentReference } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid deposit amount is required' });
    }

    const updatedUser = await recordDeposit(userId, { amount, notes, paymentReference });
    res.json({
      success: true,
      message: `Deposit of ₦${Number(amount).toLocaleString()} confirmed successfully!`,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handleSharePurchase = async (req, res) => {
  try {
    const userId = req.userId;
    const { shareUnits } = req.body;

    if (!shareUnits || Number(shareUnits) <= 0) {
      return res.status(400).json({ message: 'Valid number of share units is required' });
    }

    const updatedUser = await recordSharePurchase(userId, { shareUnits });
    res.json({
      success: true,
      message: `Successfully purchased ${shareUnits} share units!`,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handleLoanApplication = async (req, res) => {
  try {
    const userId = req.userId;
    const { loanType, amount, durationMonths, purpose, guarantorName } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid loan amount is required' });
    }

    const updatedUser = await applyForLoan(userId, {
      loanType,
      amount,
      durationMonths,
      purpose,
      guarantorName
    });

    res.json({
      success: true,
      message: `Loan application for ₦${Number(amount).toLocaleString()} approved and disbursed!`,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handleLoanRepayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid repayment amount is required' });
    }

    const updatedUser = await repayLoan(userId, { amount });
    res.json({
      success: true,
      message: `Repayment of ₦${Number(amount).toLocaleString()} processed successfully!`,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handleGetTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      transactions: user.transactions || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleWithdraw = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, destinationBank, accountNumber } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid withdrawal amount is required' });
    }

    const updatedUser = await recordWithdrawal(userId, { amount, destinationBank, accountNumber });
    res.json({
      success: true,
      message: `Withdrawal of ₦${Number(amount).toLocaleString()} processed successfully!`,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
