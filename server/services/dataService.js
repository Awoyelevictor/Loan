import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import FSBCAccount from '../models/FSBCAccount.js';
import Savings from '../models/Savings.js';
import ShareCapital from '../models/ShareCapital.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export const FSBC_COLLECTION_ACCOUNTS = [
  {
    id: 1,
    accountNumber: '0001 2345 6789',
    rawAccountNumber: '000123456789',
    bankName: 'First Bank of Nigeria',
    accountName: 'FSBC Collection Account 01',
    accountRef: 'FSBC-FBN-01',
    ussdCode: '*894*000123456789#'
  },
  {
    id: 2,
    accountNumber: '0002 3456 7890',
    rawAccountNumber: '000234567890',
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountName: 'FSBC Collection Account 02',
    accountRef: 'FSBC-GTB-02',
    ussdCode: '*737*000234567890#'
  },
  {
    id: 3,
    accountNumber: '0003 4567 8901',
    rawAccountNumber: '000345678901',
    bankName: 'Zenith Bank',
    accountName: 'FSBC Collection Account 03',
    accountRef: 'FSBC-ZEN-03',
    ussdCode: '*966*000345678901#'
  },
  {
    id: 4,
    accountNumber: '0004 5678 9012',
    rawAccountNumber: '000456789012',
    bankName: 'Access Bank',
    accountName: 'FSBC Collection Account 04',
    accountRef: 'FSBC-ACC-04',
    ussdCode: '*901*000456789012#'
  }
];

// Helper to ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data dir:', err);
  }
}

// Initial default seed store
const initialData = {
  users: [
    {
      id: 'usr_victor_demo',
      memberId: 'MEM-PSN-00458',
      fullName: 'Victor Adewale',
      email: 'awoyeleemma1@gmail.com',
      phoneNumber: '+234 803 123 4567',
      professionalTitle: 'Registered Pharmacist (MPSN)',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      role: 'MEMBER',
      assignedAccount: FSBC_COLLECTION_ACCOUNTS[0], // Account 1
      savingsBalance: 0,
      shareCapital: 0,
      shareCount: 0,
      activeLoanBalance: 0,
      usedGuarantee: 0,
      nextRepaymentDate: null,
      nextRepaymentAmount: 0,
      createdAt: new Date().toISOString(),
      transactions: [],
      notifications: [
        {
          id: 'notif_1',
          title: 'Welcome to FSBC! Your assigned collection account is ready for funding.',
          date: 'Just now',
          read: false
        }
      ]
    }
  ]
};

// Load data store
export function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store file:', err);
  }
  saveStore(initialData);
  return initialData;
}

export function saveStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file:', err);
  }
}

// Generate JWT token
export const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fsbc_super_secret_jwt_key_2025', {
    expiresIn: '30d'
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fsbc_super_secret_jwt_key_2025');
  } catch (err) {
    return null;
  }
};

// Get User full profile with calculated fields
export const formatUserProfile = (user) => {
  const savings = Number(user.savingsBalance || 0);
  const shares = Number(user.shareCapital || 0);
  const totalAssets = savings + shares;
  const maxGuarantorCapacity = totalAssets * 0.5;
  const usedGuarantee = Number(user.usedGuarantee || 0);
  const availableGuarantorCapacity = Math.max(0, maxGuarantorCapacity - usedGuarantee);
  const activeLoan = Number(user.activeLoanBalance || 0);

  return {
    id: user.id || user._id,
    _id: user.id || user._id,
    memberId: user.memberId,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    professionalTitle: user.professionalTitle || 'Cooperative Member',
    role: user.role || 'MEMBER',
    assignedAccount: user.assignedAccount || FSBC_COLLECTION_ACCOUNTS[0],
    stats: {
      totalSavings: savings,
      shareCapital: shares,
      totalAssets: totalAssets,
      activeLoan: activeLoan,
      totalBalance: savings + shares - activeLoan
    },
    guarantor: {
      eligibleAssets: totalAssets,
      limitPercent: 50,
      maxCapacity: maxGuarantorCapacity,
      usedGuarantee: usedGuarantee,
      availableCapacity: availableGuarantorCapacity,
      usagePercent: maxGuarantorCapacity > 0 ? Math.min(100, Math.round((usedGuarantee / maxGuarantorCapacity) * 100)) : 0
    },
    repayment: {
      nextDate: user.nextRepaymentDate || 'None pending',
      nextAmount: user.nextRepaymentAmount || 0,
      hasActiveLoan: activeLoan > 0
    },
    transactions: user.transactions || [],
    notifications: user.notifications || []
  };
};

// Register user with randomly assigned account
export const registerNewUser = async ({ fullName, email, phoneNumber, professionalTitle, password }) => {
  const store = loadStore();

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // Randomly assign one of the 4 FSBC collection accounts
  const randomIndex = Math.floor(Math.random() * FSBC_COLLECTION_ACCOUNTS.length);
  const assignedAccount = FSBC_COLLECTION_ACCOUNTS[randomIndex];

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const memberNumber = Math.floor(10000 + Math.random() * 90000);
  const memberId = `MEM-PSN-${memberNumber}`;
  const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const newUser = {
    id: userId,
    memberId,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phoneNumber: phoneNumber.trim(),
    professionalTitle: professionalTitle ? professionalTitle.trim() : 'Registered Pharmacist',
    passwordHash,
    role: 'MEMBER',
    assignedAccount,
    savingsBalance: 0,
    shareCapital: 0,
    shareCount: 0,
    activeLoanBalance: 0,
    usedGuarantee: 0,
    nextRepaymentDate: null,
    nextRepaymentAmount: 0,
    createdAt: new Date().toISOString(),
    transactions: [
      {
        id: `tx_${Date.now()}`,
        type: 'Account Opening',
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        amount: 0,
        isCredit: true,
        status: 'Successful',
        reference: `REG-${memberId}`,
        description: `FSBC Member account activated. Assigned ${assignedAccount.accountName} (${assignedAccount.bankName}) for deposits.`
      }
    ],
    notifications: [
      {
        id: `notif_${Date.now()}`,
        title: `Welcome to FSBC! Your assigned funding account is ${assignedAccount.accountNumber} (${assignedAccount.bankName}).`,
        date: 'Just now',
        read: false
      }
    ]
  };

  store.users.push(newUser);
  saveStore(store);

  // Sync to MongoDB if connected
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      await User.create({
        memberId: newUser.memberId,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        professionalInfo: newUser.professionalTitle,
        password: password, // Will be hashed by mongoose pre-save
        role: 'MEMBER'
      });
    } catch (e) {
      console.warn('Mongo sync non-fatal warning:', e.message);
    }
  }

  const token = createToken(newUser.id);
  const profile = formatUserProfile(newUser);

  return { user: profile, token };
};

// Login user
export const loginUser = async ({ identifier, password }) => {
  const store = loadStore();
  const search = identifier.trim().toLowerCase();

  const user = store.users.find(
    u => u.email.toLowerCase() === search || u.memberId.toLowerCase() === search
  );

  if (!user) {
    throw new Error('Invalid email, member ID, or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email, member ID, or password');
  }

  const token = createToken(user.id);
  const profile = formatUserProfile(user);

  return { user: profile, token };
};

// Find user by ID
export const findUserById = (userId) => {
  const store = loadStore();
  const user = store.users.find(u => u.id === userId || u.memberId === userId);
  if (!user) return null;
  return formatUserProfile(user);
};

// Process Deposit into Savings
export const recordDeposit = async (userId, { amount, notes, paymentReference }) => {
  const store = loadStore();
  const userIndex = store.users.findIndex(u => u.id === userId || u.memberId === userId);
  if (userIndex === -1) throw new Error('User not found');

  const numAmount = Math.abs(Number(amount));
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Invalid deposit amount');
  }

  const user = store.users[userIndex];
  user.savingsBalance = (Number(user.savingsBalance) || 0) + numAmount;

  const txId = `tx_${Date.now()}`;
  const newTx = {
    id: txId,
    type: 'Savings Deposit',
    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: numAmount,
    isCredit: true,
    status: 'Successful',
    reference: paymentReference || `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
    description: notes || `Deposit via ${user.assignedAccount.bankName} (${user.assignedAccount.accountNumber})`
  };

  user.transactions = [newTx, ...(user.transactions || [])];
  user.notifications = [
    {
      id: `notif_${Date.now()}`,
      title: `Deposit of ₦${numAmount.toLocaleString()} into Savings was confirmed successfully.`,
      date: 'Just now',
      read: false
    },
    ...(user.notifications || [])
  ];

  store.users[userIndex] = user;
  saveStore(store);

  return formatUserProfile(user);
};

// Purchase / Subscribe Share Capital
export const recordSharePurchase = async (userId, { shareUnits }) => {
  const store = loadStore();
  const userIndex = store.users.findIndex(u => u.id === userId || u.memberId === userId);
  if (userIndex === -1) throw new Error('User not found');

  const units = Math.floor(Number(shareUnits));
  if (isNaN(units) || units <= 0) throw new Error('Invalid number of shares');

  const sharePrice = 1000; // ₦1,000 per share unit
  const totalCost = units * sharePrice;

  const user = store.users[userIndex];
  user.shareCapital = (Number(user.shareCapital) || 0) + totalCost;
  user.shareCount = (Number(user.shareCount) || 0) + units;

  const newTx = {
    id: `tx_${Date.now()}`,
    type: 'Share Contribution',
    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: totalCost,
    isCredit: true,
    status: 'Successful',
    reference: `SHR-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `Subscribed for ${units} share units @ ₦1,000/share`
  };

  user.transactions = [newTx, ...(user.transactions || [])];
  user.notifications = [
    {
      id: `notif_${Date.now()}`,
      title: `Successfully acquired ${units} FSBC share units (₦${totalCost.toLocaleString()}).`,
      date: 'Just now',
      read: false
    },
    ...(user.notifications || [])
  ];

  store.users[userIndex] = user;
  saveStore(store);

  return formatUserProfile(user);
};

// Apply for Loan
export const applyForLoan = async (userId, { loanType, amount, durationMonths, purpose, guarantorName }) => {
  const store = loadStore();
  const userIndex = store.users.findIndex(u => u.id === userId || u.memberId === userId);
  if (userIndex === -1) throw new Error('User not found');

  const reqAmount = Math.abs(Number(amount));
  if (isNaN(reqAmount) || reqAmount <= 0) throw new Error('Invalid loan amount');

  const user = store.users[userIndex];
  const totalAssets = (Number(user.savingsBalance) || 0) + (Number(user.shareCapital) || 0);
  const maxAllowed = Math.max(500000, totalAssets * 2); // Eligible borrowing up to 200% of assets or minimum ₦500k

  if (reqAmount > maxAllowed) {
    throw new Error(`Requested amount exceeds your maximum borrowing limit of ₦${maxAllowed.toLocaleString()}`);
  }

  user.activeLoanBalance = (Number(user.activeLoanBalance) || 0) + reqAmount;
  const duration = Number(durationMonths) || 12;
  user.nextRepaymentAmount = Math.round(reqAmount / duration);
  
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(10);
  user.nextRepaymentDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const newTx = {
    id: `tx_${Date.now()}`,
    type: 'Loan Disbursement',
    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: reqAmount,
    isCredit: true,
    status: 'Successful',
    reference: `LN-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `${loanType || 'Personal'} Loan approved & credited for ${purpose || 'Working capital'}`
  };

  user.transactions = [newTx, ...(user.transactions || [])];
  user.notifications = [
    {
      id: `notif_${Date.now()}`,
      title: `Loan application for ₦${reqAmount.toLocaleString()} has been approved and disbursed.`,
      date: 'Just now',
      read: false
    },
    ...(user.notifications || [])
  ];

  store.users[userIndex] = user;
  saveStore(store);

  return formatUserProfile(user);
};

// Repay Active Loan
export const repayLoan = async (userId, { amount }) => {
  const store = loadStore();
  const userIndex = store.users.findIndex(u => u.id === userId || u.memberId === userId);
  if (userIndex === -1) throw new Error('User not found');

  const repAmount = Math.abs(Number(amount));
  if (isNaN(repAmount) || repAmount <= 0) throw new Error('Invalid repayment amount');

  const user = store.users[userIndex];
  const currentLoan = Number(user.activeLoanBalance) || 0;
  if (currentLoan <= 0) throw new Error('You do not have any outstanding loan balance');

  const paid = Math.min(currentLoan, repAmount);
  user.activeLoanBalance = currentLoan - paid;
  if (user.activeLoanBalance <= 0) {
    user.nextRepaymentDate = 'Loan fully settled';
    user.nextRepaymentAmount = 0;
  }

  const newTx = {
    id: `tx_${Date.now()}`,
    type: 'Loan Repayment',
    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: paid,
    isCredit: false,
    status: 'Successful',
    reference: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `Repayment on active loan via assigned FSBC account`
  };

  user.transactions = [newTx, ...(user.transactions || [])];
  user.notifications = [
    {
      id: `notif_${Date.now()}`,
      title: `Loan repayment of ₦${paid.toLocaleString()} was processed successfully. Outstanding: ₦${user.activeLoanBalance.toLocaleString()}.`,
      date: 'Just now',
      read: false
    },
    ...(user.notifications || [])
  ];

  store.users[userIndex] = user;
  saveStore(store);

  return formatUserProfile(user);
};

// Process Withdrawal from Savings
export const recordWithdrawal = async (userId, { amount, destinationBank, accountNumber }) => {
  const store = loadStore();
  const userIndex = store.users.findIndex(u => u.id === userId || u.memberId === userId);
  if (userIndex === -1) throw new Error('User not found');

  const wAmount = Math.abs(Number(amount));
  if (isNaN(wAmount) || wAmount <= 0) throw new Error('Invalid withdrawal amount');

  const user = store.users[userIndex];
  const currentSavings = Number(user.savingsBalance) || 0;
  if (wAmount > currentSavings) {
    throw new Error(`Insufficient savings balance (Available: ₦${currentSavings.toLocaleString()})`);
  }

  user.savingsBalance = currentSavings - wAmount;

  const newTx = {
    id: `tx_${Date.now()}`,
    type: 'Wallet Withdrawal',
    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: wAmount,
    isCredit: false,
    status: 'Successful',
    reference: `WDR-${Math.floor(100000 + Math.random() * 900000)}`,
    description: `Withdrawal to ${destinationBank || 'Bank Account'} (${accountNumber || 'External'})`
  };

  user.transactions = [newTx, ...(user.transactions || [])];
  user.notifications = [
    {
      id: `notif_${Date.now()}`,
      title: `Withdrawal of ₦${wAmount.toLocaleString()} processed successfully to your bank account.`,
      date: 'Just now',
      read: false
    },
    ...(user.notifications || [])
  ];

  store.users[userIndex] = user;
  saveStore(store);

  return formatUserProfile(user);
};

// Deterministic Loan Eligibility Engine
export const evaluateLoanEligibility = (user, requestedAmount, durationMonths, rules = {}) => {
  const savings = Number(user.savingsBalance) || 0;
  const shares = Number(user.shareCapital) || 0;
  const totalAssets = savings + shares;
  const activeLoan = Number(user.activeLoanBalance) || 0;
  const maxMultiplier = rules.maxLoanMultiplier || 2;
  const maxAllowed = Math.max(500000, totalAssets * maxMultiplier);

  const riskIndicators = [];
  if (activeLoan > 0) {
    riskIndicators.push('Active outstanding loan exists');
  }
  if (savings < (rules.minSavingsForLoan || 50000)) {
    riskIndicators.push('Savings balance below recommended threshold (₦50,000)');
  }

  let status = 'Eligible';
  let eligibleAmount = maxAllowed;
  let reason = `Contribution and savings history supports up to ₦${maxAllowed.toLocaleString()} under current cooperative lending rules.`;

  if (requestedAmount > maxAllowed) {
    status = 'Conditionally Eligible';
    eligibleAmount = maxAllowed;
    reason = `Requested amount ₦${requestedAmount.toLocaleString()} exceeds max calculated limit of ₦${maxAllowed.toLocaleString()}. Recommended eligible amount: ₦${maxAllowed.toLocaleString()}.`;
  }

  if (activeLoan > totalAssets) {
    status = 'Needs Manual Review';
    eligibleAmount = Math.round(maxAllowed * 0.5);
    reason = 'Outstanding loan balance exceeds total eligible assets. Requires Treasurer/Admin review.';
  }

  return {
    status,
    requestedAmount,
    eligibleAmount,
    maxAllowed,
    reason,
    riskIndicators
  };
};

// Deterministic Loan Repayment Schedule Calculator
export const calculateLoanSchedule = (principal, interestRateAnnual, durationMonths) => {
  const p = Number(principal);
  const rate = Number(interestRateAnnual) || 10;
  const months = Number(durationMonths) || 12;

  const totalInterest = Math.round(p * (rate / 100) * (months / 12));
  const totalRepayment = p + totalInterest;
  const monthlyInstallment = Math.round(totalRepayment / months);

  const schedule = [];
  let remaining = totalRepayment;
  const startDate = new Date();

  for (let i = 1; i <= months; i++) {
    startDate.setMonth(startDate.getMonth() + 1);
    const principalPart = Math.round(p / months);
    const interestPart = Math.round(totalInterest / months);
    const installment = principalPart + interestPart;
    remaining = Math.max(0, remaining - installment);

    schedule.push({
      installmentNumber: i,
      dueDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      paymentAmount: installment,
      principalPart,
      interestPart,
      remainingBalance: remaining
    });
  }

  return {
    totalInterest,
    totalRepayment,
    monthlyInstallment,
    schedule
  };
};


