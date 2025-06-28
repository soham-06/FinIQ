import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    // Assuming authentication middleware sets req.user.email
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Fetch the user data from the database
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the required fields to the client
    res.status(200).json({
      name: user.name,
      email: user.email,
      dob: user.dob,
      profession: user.profession,
      role: user.role,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};
