import express from 'express';
import { getUserProfile } from '../controllers/userController.js';

const router = express.Router();

// Define a route to get user profile data
router.get('/me', getUserProfile);

export default router;
