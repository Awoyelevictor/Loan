import { registerNewUser, loginUser, findUserById, FSBC_COLLECTION_ACCOUNTS } from '../services/dataService.js';

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, professionalTitle, password } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields (Full name, email, phone, password)' });
    }

    const { user, token } = await registerNewUser({
      fullName,
      email,
      phoneNumber,
      professionalTitle,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide your email/Member ID and password' });
    }

    const { user, token } = await loginUser({
      identifier: email,
      password
    });

    res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCollectionAccounts = (req, res) => {
  res.json({
    success: true,
    accounts: FSBC_COLLECTION_ACCOUNTS
  });
};
