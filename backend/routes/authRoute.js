import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin // ✅ Make sure this is included
} from '../controllers/authController.js';
import { getUserProfile } from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin); // ✅ Now this will not throw error
router.get('/me', authenticateUser, getUserProfile);

export default router;
