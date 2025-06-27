import Quiz from '../models/Quiz.js';

// Function to handle quiz score submission
export const submitQuizScore = async (req, res) => {
  try {
    const { userEmail, levelId, topicId, score, total } = req.body;

    // Validate request body
    if (!userEmail || !levelId || !topicId || score === undefined || !total) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate that the score is within acceptable range
    if (score < 0 || score > total) {
      return res.status(400).json({ message: 'Invalid score value' });
    }

    // Check for duplicate submissions
    const existingQuiz = await Quiz.findOne({ userEmail, topicId });
    if (existingQuiz) {
      return res.status(409).json({ message: 'Quiz already submitted for this topic' });
    }

    // Create and save the quiz entry
    const newQuiz = new Quiz({ userEmail, levelId, topicId, score, total });
    await newQuiz.save();

    res.status(201).json({ 
      message: 'Quiz score submitted successfully', 
      quiz: newQuiz 
    });
  } catch (err) {
    console.error('Error submitting quiz score:', err);

    // Provide a detailed error response in development mode
res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};
