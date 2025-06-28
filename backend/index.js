import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';

import authRoutes from './routes/authRoute.js';
import googleAuthRoute from './routes/googleAuthRoute.js';
import moduleRoutes from './routes/moduleRoute.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import './config/passportConfig.js';
import quizScoreRoutes from './routes/QuizscoreRoute.js';
import userRoutes from './routes/userRoute.js';

dotenv.config();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
mongoose.set('strictQuery', false);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session and passport setup
app.use(session({
  secret: process.env.SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoute);
app.use('/api/levels', moduleRoutes);
app.use('/api/quiz-scores', quizScoreRoutes);
app.use('/api/users', userRoutes);


// Root route
app.get('/', (req, res) => {
  res.send('✅ Server is up and running!');
});

// 404 fallback route
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// Error handler
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 2100;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
