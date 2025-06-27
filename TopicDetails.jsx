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

        // First topic visit should preserve history
        if (!sessionStorage.getItem("visitedTopic")) {
          sessionStorage.setItem("visitedTopic", "true");
        } else {
          // Replace history on topic traversals
          navigate(`/levels/${levelId}/topics/${topicId}`, { replace: true });
        }
      } catch (err) {
        setError("Could not load topic details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [levelId, topicId, navigate]);

  const formatContent = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const handleSubmit = async () => {
    let total = topic.quiz.length;
    let correct = 0;

    topic.quiz.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const selectedText = q.options[selected];
      if (selectedText === q.correctAnswer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    const userEmail = JSON.parse(localStorage.getItem('user'))?.email || 'guest@example.com';

    try {
      await axios.post('http://localhost:2100/api/quiz-scores/submit', {
        userEmail,
        levelId: numericLevel,
        topicId: topic.customId,
        score: correct,
        total,
      });
    } catch (err) {
      if (err.response?.status === 409) {
        alert("❌ You have already submitted this quiz.");
      } else {
        console.error("Error submitting quiz score", err);
        alert("Something went wrong while submitting your quiz.");
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
        {topic.image && (
          <div className="topic-image" style={{ margin: '20px 0', textAlign: 'center' }}>
            <img
              src={topic.image}
              alt={topic.title || topic.topic}
              style={{
                maxWidth: '100%',
                maxHeight: 300,
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.10)'
              }}
            />
          </div>
        )}

        <div className="topic-main-content">
          {formatContent(topic.content || "")}
        </div>

        {topic.additionalImages?.length > 0 && (
          <div className="additional-images">
            <h3>Additional Resources</h3>
            <div className="image-grid">
              {topic.additionalImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Additional resource ${idx + 1}`} />
              ))}
            </div>
          </div>
        )}

        {topic.videoLinks?.filter(v => v && !v.includes("video_url")).length > 0 && (
          <div className="video-section">
            <h3>Video Resources</h3>
            <div className="video-grid">
              {topic.videoLinks
                .filter(v => v && !v.includes("video_url"))
                .map((video, idx) => {
                  const match = video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
                  const videoId = match ? match[1] : null;

                  return (
                    <div key={idx} className="video-container">
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={`YouTube video ${idx + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <a href={video} target="_blank" rel="noopener noreferrer">View Video {idx + 1}</a>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

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
                        ? 'correct'
                        : isWrongSelected
                          ? 'wrong'
                          : ''
                      : '';

                    return (
                      <label
                        key={i}
                        className={`quiz-option ${optionClass}`}
                        style={{ pointerEvents: submitted ? 'none' : 'auto' }}
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

        {/* Navigation Buttons */}
        <div className="topic-navigation-buttons" style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="nav-button"
            onClick={() => {
              navigate(getPreviousLink(), { replace: true });
            }}
          >
            ← Previous
          </button>

          <Link to="/modules" className="nav-button">Module Page</Link>

          {nextLink && (
            <button
              className="nav-button"
              onClick={() => {
                navigate(nextLink, { replace: true });
              }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDetails;
