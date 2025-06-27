import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TopicDetails.css";

const TopicDetails = () => {
  const { levelId, topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const numericLevel = parseInt(levelId.replace(/[^0-9]/g, ""));
  const topicNumber = parseInt(topicId.split("-")[2], 10);
  const topicPrefix = topicId.split("-").slice(0, 2).join("-");
  const isFirstTopic = topicNumber === 1;
  const isLastTopic = topicNumber === 10;

  const getPreviousLink = () => {
    if (numericLevel === 1 && isFirstTopic) return "/modules";
    if (numericLevel > 1 && isFirstTopic) {
      const prevLevel = numericLevel - 1;
      return `/levels/${prevLevel}/topics/level${prevLevel}-topic-010`;
    }
    return `/levels/${levelId}/topics/${topicPrefix}-${String(topicNumber - 1).padStart(3, "0")}`;
  };

  const nextLink = isLastTopic
    ? null
    : `/levels/${levelId}/topics/${topicPrefix}-${String(topicNumber + 1).padStart(3, "0")}`;

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        setTopic(null);
        setSelectedAnswers({});
        setSubmitted(false);
        setScore(null);

        const levelNumber = levelId.replace(/[^0-9]/g, "");
        const res = await axios.get(`http://localhost:2100/api/levels/${levelNumber}/topics/${topicId}`);
        setTopic(res.data);
        window.scrollTo(0, 0);

        if (!sessionStorage.getItem("visitedTopic")) {
          sessionStorage.setItem("visitedTopic", "true");
        } else {
          navigate(`/levels/${levelId}/topics/${topicId}`, { replace: true });
        }
      } catch (err) {
        setError("Could not load topic details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [levelId, topicId, navigate]);

  const handleSubmit = async () => {
    if (!topic || !topic.quiz) {
      alert("Quiz data is missing.");
      return;
    }

    const total = topic.quiz.length;
    let correct = 0;

    topic.quiz.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const selectedText = q.options[selected];
      if (selectedText === q.correctAnswer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest@example.com";

    try {
      await axios.post("http://localhost:2100/api/quiz-scores/submit", {
        userEmail,
        levelId: levelId,
        topicId: topicId,
        score: correct,
        total,
      });
      alert("✅ Quiz score submitted successfully!");
    } catch (err) {
      console.error("Error submitting quiz score", err);
      if (err.response?.status === 409) {
        alert("❌ You have already submitted this quiz.");
      } else {
        alert("❌ Something went wrong while submitting your quiz.");
      }
    }
  };

  if (loading) return <div className="loading">Loading topic...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!topic) return <div className="error">Topic not found</div>;

  return (
    <div className="topic-details-container">
      <div className="topic-header">
        <div className="series-title">{topic.seriesTitle || topic.title}</div>
        <h1>{topic.title || topic.topic}</h1>
        <Link to={`/topics/level-${numericLevel}`} className="back-link">← Back to Topics</Link>
      </div>

      <div className="topic-content">
        <div className="topic-main-content">{topic.content}</div>

        {topic.quiz?.length > 0 && (
          <div className="topic-quiz">
            <h2>Prove Yourself</h2>
            {topic.quiz.map((q, idx) => (
              <div key={idx} className="quiz-question">
                <h4>Question {idx + 1}</h4>
                <p>{q.question}</p>
                <div className="quiz-options">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedAnswers[idx] === i;
                    const isCorrect = q.correctAnswer === opt;
                    const isWrongSelected = submitted && isSelected && !isCorrect;
                    const isRight = submitted && isCorrect;
                    const optionClass = submitted
                      ? isRight
                        ? "correct"
                        : isWrongSelected
                        ? "wrong"
                        : ""
                      : "";

                    return (
                      <label
                        key={i}
                        className={`quiz-option ${optionClass}`}
                        style={{ pointerEvents: submitted ? "none" : "auto" }}
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={i}
                          checked={selectedAnswers[idx] === i}
                          onChange={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [idx]: i }))
                          }
                          disabled={submitted}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted && (
              <button className="submit-btn" onClick={handleSubmit}>
                Submit Quiz
              </button>
            )}

            {submitted && (
              <div className="quiz-score-result">
                ✅ You scored {score} out of {topic.quiz.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetails;
