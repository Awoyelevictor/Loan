import express from 'express';
import { 
  handleDeposit, 
  handleSharePurchase, 
  handleLoanApplication, 
  handleLoanRepayment, 
  handleGetTransactions,
  handleWithdraw
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/deposit', protect, handleDeposit);
router.post('/withdraw', protect, handleWithdraw);
router.post('/shares', protect, handleSharePurchase);
router.post('/loans/apply', protect, handleLoanApplication);
router.post('/loans/repay', protect, handleLoanRepayment);
router.get('/transactions', protect, handleGetTransactions);

export default router;
