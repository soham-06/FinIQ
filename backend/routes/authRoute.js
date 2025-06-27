import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin // ✅ Make sure this is included
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin); // ✅ Now this will not throw error

export default router;
