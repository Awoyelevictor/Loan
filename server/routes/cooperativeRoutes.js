import express from 'express';
import {
  getCooperativeDashboardData,
  checkLoanEligibilityAPI,
  applyCooperativeLoanAPI,
  adminReviewLoanAPI,
  adminReconcilePaymentAPI,
  adminApprovePayoutAPI,
  scheduleNotificationAPI,
  updateRulesAPI,
  ussdSimulationAPI
} from '../controllers/cooperativeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getCooperativeDashboardData);
router.post('/loans/eligibility', protect, checkLoanEligibilityAPI);
router.post('/loans/apply', protect, applyCooperativeLoanAPI);
router.post('/admin/loans/review', protect, admin, adminReviewLoanAPI);
router.post('/admin/reconciliation', protect, admin, adminReconcilePaymentAPI);
router.post('/admin/payouts/approve', protect, admin, adminApprovePayoutAPI);
router.post('/admin/notifications', protect, admin, scheduleNotificationAPI);
router.post('/admin/rules', protect, admin, updateRulesAPI);
router.post('/ussd', ussdSimulationAPI);

export default router;
