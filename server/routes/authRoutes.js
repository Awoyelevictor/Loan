import express from 'express';
import { authUser, registerUser, getMe, getCollectionAccounts } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);
router.get('/collection-accounts', getCollectionAccounts);

export default router;
