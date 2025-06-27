import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./TopicDetails.css";

const TopicDetails = () => {
  const { levelId, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const levelNumber = levelId.replace(/[^0-9]/g, "");
        const res = await axios.get(`http://localhost:2100/api/levels/${levelNumber}/topics/${topicId}`);
        setTopic(res.data);
      } catch (err) {
        setError("Could not load topic details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [levelId, topicId]);

  if (loading) return <div className="loading">Loading topic...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!topic) return <div className="error">Topic not found</div>;

  const formatContent = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="topic-details-container">
      <div className="topic-header">
        <div className="series-title">{topic.seriesTitle || topic.title}</div>
        <h1>{topic.title || topic.topic}</h1>
        <Link to={`/topics/level-${levelId}`} className="back-link">
          ← Back to Topics
        </Link>
      </div>

      <div className="topic-content">
        <div className="topic-summary">
          <h3>Summary</h3>
          <p>{topic.summary}</p>
        </div>

        {topic.image && (
          <div className="topic-image" style={{ margin: '20px 0', textAlign: 'center' }}>
            <img
              src={topic.image}
              alt={topic.title || topic.topic}
              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, boxShadow: '0 2px 12px rgba(25, 118, 210, 0.10)' }}
            />
          </div>
        )}

        <div className="topic-main-content">
          {formatContent(topic.content || "")}
        </div>

        {topic.additionalImages && topic.additionalImages.length > 0 && (
          <div className="additional-images">
            <h3>Additional Resources</h3>
            <div className="image-grid">
              {topic.additionalImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Additional resource ${idx + 1}`} />
              ))}
            </div>
          </div>
        )}

        {topic.videoLinks &&
  topic.videoLinks.filter(
    (v) => v && v.trim() !== "" && !v.toLowerCase().includes("video_url")
  ).length > 0 && (
  <div className="video-section">
    <h3>Video Resources</h3>
    <div className="video-grid">
      {topic.videoLinks
        .filter(
          (v) => v && v.trim() !== "" && !v.toLowerCase().includes("video_url")
        )
        .map((video, idx) => {
          const youtubeMatch = video.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
          );
          const videoId = youtubeMatch ? youtubeMatch[1] : null;

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
                <a href={video} target="_blank" rel="noopener noreferrer">
                  View Video {idx + 1}
                </a>
              )}
            </div>
          );
        })}
    </div>
  </div>
)}


        {topic.quiz && topic.quiz.length > 0 && (
          <div className="topic-quiz">
            <h2>Knowledge Check</h2>
            {topic.quiz.map((q, idx) => (
              <div key={idx} className="quiz-question">
                <h4>Question {idx + 1}</h4>
                <p>{q.question}</p>
                <div className="quiz-options">
                  {q.options.map((opt, i) => (
                    <label key={i} className="quiz-option">
                      <input type="radio" name={`question-${idx}`} value={i} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetails;
