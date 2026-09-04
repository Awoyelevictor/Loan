import {
  loadStore,
  saveStore,
  formatUserProfile,
  evaluateLoanEligibility,
  calculateLoanSchedule
} from '../services/dataService.js';

// Get comprehensive cooperative data for member or admin
export const getCooperativeDashboardData = async (req, res) => {
  try {
    const store = loadStore();
    const user = store.users.find(u => u.id === req.userId || u.memberId === req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isAdmin = user.role === 'ADMIN' || user.email.includes('admin');

    // Default rules & collections if not present
    if (!store.rules) {
      store.rules = {
        monthlyContributionAmount: 20000,
        loanInterestRateAnnual: 10,
        maxLoanMultiplier: 2,
        guarantorLimitPercent: 50,
        minSavingsForLoan: 50000,
        lateFeePercent: 2
      };
      saveStore(store);
    }

    if (!store.contributions) store.contributions = [];
    if (!store.reconciliationQueue) store.reconciliationQueue = [];
    if (!store.loans) store.loans = [];
    if (!store.payouts) store.payouts = [];
    if (!store.auditTrail) store.auditTrail = [];
    if (!store.notificationsQueue) store.notificationsQueue = [];

    // Filter data based on role (RBAC)
    let memberData = null;
    let adminData = null;

    if (isAdmin) {
      adminData = {
        totalMembers: store.users.length,
        totalContributions: store.users.reduce((acc, u) => acc + (u.savingsBalance || 0) + (u.shareCapital || 0), 0),
        todaysCollections: 125000,
        outstandingContributions: 180000,
        activeLoansCount: store.loans.filter(l => l.status === 'Active' || l.status === 'Disbursed').length,
        activeLoansAmount: store.loans.filter(l => l.status === 'Active' || l.status === 'Disbursed').reduce((acc, l) => acc + (l.outstandingBalance || l.requestedAmount || 0), 0),
        pendingLoanApplications: store.loans.filter(l => l.status === 'Pending' || l.status === 'Under Review'),
        upcomingPayouts: store.payouts,
        pendingReconciliation: store.reconciliationQueue.filter(r => r.status === 'Needs Review' || r.status === 'Unmatched'),
        overduePayments: store.contributions.filter(c => c.status === 'OVERDUE'),
        allMembers: store.users.map(u => formatUserProfile(u)),
        reconciliationQueue: store.reconciliationQueue,
        allLoans: store.loans,
        auditTrail: store.auditTrail,
        notifications: store.notificationsQueue,
        rules: store.rules
      };
    } else {
      const userLoans = store.loans.filter(l => l.memberId === user.memberId || l.member === user.id);
      const userContributions = store.contributions.filter(c => c.memberId === user.memberId);
      const userPayouts = store.payouts.filter(p => p.recipientMemberId === user.memberId);

      memberData = {
        profile: formatUserProfile(user),
        loans: userLoans,
        contributions: userContributions,
        payouts: userPayouts,
        notifications: user.notifications || [],
        rules: store.rules
      };
    }

    res.json({
      success: true,
      isAdmin,
      memberData,
      adminData
    });
  } catch (error) {
    console.error('Cooperative dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Check loan eligibility deterministically
export const checkLoanEligibilityAPI = async (req, res) => {
  try {
    const { amount, durationMonths } = req.body;
    const store = loadStore();
    const user = store.users.find(u => u.id === req.userId || u.memberId === req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = evaluateLoanEligibility(user, Number(amount) || 100000, Number(durationMonths) || 12, store.rules);
    res.json({ success: true, evaluation: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Apply for cooperative loan
export const applyCooperativeLoanAPI = async (req, res) => {
  try {
    const { loanType, amount, durationMonths, purpose, guarantorName } = req.body;
    const store = loadStore();
    const user = store.users.find(u => u.id === req.userId || u.memberId === req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reqAmount = Number(amount);
    if (!reqAmount || reqAmount <= 0) return res.status(400).json({ message: 'Valid loan amount is required' });

    const eligibility = evaluateLoanEligibility(user, reqAmount, Number(durationMonths) || 12, store.rules);
    
    const loanId = `LN-${Math.floor(100000 + Math.random() * 900000)}`;
    const scheduleData = calculateLoanSchedule(reqAmount, store.rules?.loanInterestRateAnnual || 10, Number(durationMonths) || 12);

    const newLoan = {
      id: `loan_${Date.now()}`,
      loanId,
      memberId: user.memberId,
      memberName: user.fullName,
      loanType: loanType || 'Personal Development Loan',
      requestedAmount: reqAmount,
      approvedAmount: eligibility.status === 'Eligible' ? reqAmount : eligibility.eligibleAmount,
      interestRate: store.rules?.loanInterestRateAnnual || 10,
      durationMonths: Number(durationMonths) || 12,
      purpose: purpose || 'Working capital',
      status: 'Under Review',
      eligibilityStatus: eligibility.status,
      eligibilityReason: eligibility.reason,
      riskIndicators: eligibility.riskIndicators || [],
      totalInterest: scheduleData.totalInterest,
      totalRepayment: scheduleData.totalRepayment,
      amountPaid: 0,
      outstandingBalance: scheduleData.totalRepayment,
      nextRepaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      guarantor: guarantorName ? { name: guarantorName, status: 'Pending' } : null,
      createdAt: new Date().toISOString()
    };

    if (!store.loans) store.loans = [];
    store.loans.unshift(newLoan);

    // Audit trail
    if (!store.auditTrail) store.auditTrail = [];
    store.auditTrail.unshift({
      id: `aud_${Date.now()}`,
      action: 'LOAN_APPLICATION_SUBMITTED',
      actor: user.fullName,
      timestamp: new Date().toISOString(),
      affectedRecord: loanId,
      previousValue: null,
      newValue: 'Under Review',
      reason: `Member applied for ₦${reqAmount.toLocaleString()}`
    });

    saveStore(store);

    res.json({
      success: true,
      message: 'Loan application submitted successfully and queued for human review.',
      loan: newLoan,
      eligibility
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin Review / Approve Loan (Human Approval Workflow)
export const adminReviewLoanAPI = async (req, res) => {
  try {
    const { loanId, action, comment } = req.body; // action: 'APPROVE', 'REJECT', 'DISBURSE'
    const store = loadStore();
    const adminUser = store.users.find(u => u.id === req.userId || u.memberId === req.userId);
    
    const loan = store.loans.find(l => l.id === loanId || l.loanId === loanId);
    if (!loan) return res.status(404).json({ message: 'Loan application not found' });

    const prevStatus = loan.status;
    if (action === 'APPROVE') {
      loan.status = 'Approved';
    } else if (action === 'REJECT') {
      loan.status = 'Rejected';
    } else if (action === 'DISBURSE') {
      loan.status = 'Disbursed';
      loan.status = 'Active';
      // Credit member account or active balance
      const member = store.users.find(u => u.memberId === loan.memberId);
      if (member) {
        member.activeLoanBalance = (Number(member.activeLoanBalance) || 0) + Number(loan.approvedAmount || loan.requestedAmount);
        member.nextRepaymentDate = new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString();
        member.nextRepaymentAmount = Math.round(loan.totalRepayment / loan.durationMonths);
        member.transactions = [
          {
            id: `tx_${Date.now()}`,
            type: 'Loan Disbursement',
            date: new Date().toLocaleString(),
            amount: loan.approvedAmount || loan.requestedAmount,
            isCredit: true,
            status: 'Successful',
            reference: `DISB-${loan.loanId}`,
            description: `Loan disbursement for ${loan.loanType}`
          },
          ...(member.transactions || [])
        ];
      }
    }

    if (!store.auditTrail) store.auditTrail = [];
    store.auditTrail.unshift({
      id: `aud_${Date.now()}`,
      action: `LOAN_${action}`,
      actor: adminUser ? adminUser.fullName : 'Administrator',
      timestamp: new Date().toISOString(),
      affectedRecord: loan.loanId,
      previousValue: prevStatus,
      newValue: loan.status,
      reason: comment || 'Administrative review & human approval'
    });

    saveStore(store);

    res.json({
      success: true,
      message: `Loan successfully marked as ${loan.status}`,
      loan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Payment Reconciliation Action
export const adminReconcilePaymentAPI = async (req, res) => {
  try {
    const { reconciliationId, action, matchedMemberId, notes } = req.body; // action: 'CONFIRM', 'MATCH', 'FLAG'
    const store = loadStore();
    const adminUser = store.users.find(u => u.id === req.userId || u.memberId === req.userId);

    const rec = store.reconciliationQueue.find(r => r.id === reconciliationId);
    if (!rec) return res.status(404).json({ message: 'Reconciliation item not found' });

    const prevStatus = rec.status;
    if (action === 'CONFIRM' || action === 'MATCH') {
      rec.status = 'Manually Confirmed';
      rec.matchedMemberId = matchedMemberId || rec.matchedMemberId;
      
      // Credit member savings if matched member exists
      if (rec.matchedMemberId) {
        const member = store.users.find(u => u.id === rec.matchedMemberId || u.memberId === rec.matchedMemberId);
        if (member) {
          member.savingsBalance = (Number(member.savingsBalance) || 0) + Number(rec.amount);
          member.transactions = [
            {
              id: `tx_${Date.now()}`,
              type: 'Savings Deposit',
              date: new Date().toLocaleString(),
              amount: rec.amount,
              isCredit: true,
              status: 'Successful',
              reference: rec.reference,
              description: `Reconciled bank deposit from ${rec.senderName}`
            },
            ...(member.transactions || [])
          ];
        }
      }
    } else if (action === 'FLAG') {
      rec.status = 'Needs Review';
    }

    if (!store.auditTrail) store.auditTrail = [];
    store.auditTrail.unshift({
      id: `aud_${Date.now()}`,
      action: `RECONCILIATION_${action}`,
      actor: adminUser ? adminUser.fullName : 'Administrator',
      timestamp: new Date().toISOString(),
      affectedRecord: rec.reference || rec.id,
      previousValue: prevStatus,
      newValue: rec.status,
      reason: notes || 'Admin reconciliation action'
    });

    saveStore(store);
    res.json({ success: true, message: 'Reconciliation record updated successfully', reconciliation: rec });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Payout Approval Workflow
export const adminApprovePayoutAPI = async (req, res) => {
  try {
    const { payoutId, action, comment } = req.body; // action: 'APPROVE', 'EXECUTE'
    const store = loadStore();
    const adminUser = store.users.find(u => u.id === req.userId || u.memberId === req.userId);

    const payout = store.payouts.find(p => p.id === payoutId);
    if (!payout) return res.status(404).json({ message: 'Payout record not found' });

    const prevStatus = payout.status;
    if (action === 'APPROVE') {
      payout.status = 'Approved';
    } else if (action === 'EXECUTE') {
      payout.status = 'Executed';
      payout.receiptRef = `RCT-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const member = store.users.find(u => u.memberId === payout.recipientMemberId);
      if (member) {
        member.transactions = [
          {
            id: `tx_${Date.now()}`,
            type: 'Payout Distribution',
            date: new Date().toLocaleString(),
            amount: payout.amount,
            isCredit: true,
            status: 'Successful',
            reference: payout.receiptRef,
            description: `Cooperative rotation payout for cycle ${payout.cycle}`
          },
          ...(member.transactions || [])
        ];
      }
    }

    if (!store.auditTrail) store.auditTrail = [];
    store.auditTrail.unshift({
      id: `aud_${Date.now()}`,
      action: `PAYOUT_${action}`,
      actor: adminUser ? adminUser.fullName : 'Administrator',
      timestamp: new Date().toISOString(),
      affectedRecord: payout.id,
      previousValue: prevStatus,
      newValue: payout.status,
      reason: comment || 'Human admin approval and payout execution'
    });

    saveStore(store);
    res.json({ success: true, message: `Payout status updated to ${payout.status}`, payout });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Schedule Notification / Reminder
export const scheduleNotificationAPI = async (req, res) => {
  try {
    const { recipientMemberId, title, message, type, scheduledFor } = req.body;
    const store = loadStore();
    const adminUser = store.users.find(u => u.id === req.userId || u.memberId === req.userId);

    const newNotif = {
      id: `notif_${Date.now()}`,
      recipientMemberId: recipientMemberId || 'ALL',
      title,
      message,
      type: type || 'Reminder',
      status: 'Scheduled',
      scheduledFor: scheduledFor || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!store.notificationsQueue) store.notificationsQueue = [];
    store.notificationsQueue.unshift(newNotif);

    if (!store.auditTrail) store.auditTrail = [];
    store.auditTrail.unshift({
      id: `aud_${Date.now()}`,
      action: 'NOTIFICATION_SCHEDULED',
      actor: adminUser ? adminUser.fullName : 'Administrator',
      timestamp: new Date().toISOString(),
      affectedRecord: newNotif.id,
      previousValue: null,
      newValue: 'Scheduled',
      reason: `Reminder scheduled for ${recipientMemberId}`
    });

    saveStore(store);
    res.json({ success: true, message: 'Notification scheduled successfully', notification: newNotif });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Financial Rules Engine Configuration
export const updateRulesAPI = async (req, res) => {
  try {
    const { monthlyContributionAmount, loanInterestRateAnnual, maxLoanMultiplier, guarantorLimitPercent } = req.body;
    const store = loadStore();
    const adminUser = store.users.find(u => u.id === req.userId || u.memberId === req.userId);

    const prevRules = { ...store.rules };
    store.rules = {
      ...store.rules,
      monthlyContributionAmount: Number(monthlyContributionAmount) || store.rules.monthlyContributionAmount,
      loanInterestRateAnnual: Number(loanInterestRateAnnual) || store.rules.loanInterestRateAnnual,
      maxLoanMultiplier: Number(maxLoanMultiplier) || store.rules.maxLoanMultiplier,
      guarantorLimitPercent: Number(guarantorLimitPercent) || store.rules.guarantorLimitPercent
    };

    if (!store.auditTrail) store.auditTrail = [];
    store.auditTrail.unshift({
      id: `aud_${Date.now()}`,
      action: 'RULES_UPDATED',
      actor: adminUser ? adminUser.fullName : 'Administrator',
      timestamp: new Date().toISOString(),
      affectedRecord: 'Financial Rules Engine',
      previousValue: JSON.stringify(prevRules),
      newValue: JSON.stringify(store.rules),
      reason: 'Administrative update to cooperative lending & contribution rules'
    });

    saveStore(store);
    res.json({ success: true, message: 'Financial rules updated successfully', rules: store.rules });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// USSD Gateway Service Abstraction Simulation
export const ussdSimulationAPI = async (req, res) => {
  try {
    const { ussdString, memberId } = req.body;
    const store = loadStore();
    const user = store.users.find(u => u.memberId === memberId || u.id === memberId);
    
    if (!user) {
      return res.json({ response: 'END FSBC USSD: Member ID not found. Please register on the FSBC platform.' });
    }

    let response = '';
    const code = ussdString ? ussdString.trim() : '';

    if (code === '*894#' || code === '*894') {
      response = `CON Welcome to FSBC Co-op via USSD (${user.fullName})\n1. Check Balance & Savings\n2. Check Loan Status\n3. Check Assigned Collection Bank\n4. Exit`;
    } else if (code.endsWith('*1')) {
      response = `END FSBC Account Summary:\nName: ${user.fullName}\nSavings: ₦${(user.savingsBalance || 0).toLocaleString()}\nShare Capital: ${(user.shareCount || 0)} Units`;
    } else if (code.endsWith('*2')) {
      const activeLoan = user.activeLoanBalance || 0;
      response = `END FSBC Loan Status:\nActive Loan: ₦${activeLoan.toLocaleString()}\nNext Repayment: ${user.nextRepaymentDate || 'None'}\nAmount: ₦${(user.nextRepaymentAmount || 0).toLocaleString()}`;
    } else if (code.endsWith('*3')) {
      response = `END Assigned Bank: ${user.assignedAccount?.bankName}\nAccount: ${user.assignedAccount?.accountNumber}\nName: ${user.assignedAccount?.accountName}`;
    } else {
      response = `CON FSBC Cooperative USSD Gateway\nWelcome ${user.fullName}\nDial *894# to view balance, loans, or assigned bank.`;
    }

    res.json({ success: true, ussdResponse: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
