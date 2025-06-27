import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🟢 Register User (Email/Password)
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, dob, profession } = req.body;
    console.log('[Register] Incoming data:', { name, email, dob, profession });

    if (!name || !email || !password || !dob || !profession) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      dob: new Date(dob),
      profession,
      role: 'user'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        profession: user.profession,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Register] Error:', err);
    next(err);
  }
};

// 🟢 Login User (Email/Password)
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('[Login] Attempting login for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    console.log('[Login] User found:', !!user);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[Login] Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    user.password = undefined;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        profession: user.profession,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error('[Login] Error:', err);
    next(err);
  }
};

// 🟢 Google OAuth Login
export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account missing email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: '', // Not used for OAuth users
        dob: new Date(), // optional default
        profession: 'student', // default value
        role: 'user'
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        profession: user.profession,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Google Login] Error:', err);
    res.status(401).json({ message: 'Invalid Google token or login failed' });
  }
};
