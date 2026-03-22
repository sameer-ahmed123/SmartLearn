import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  PlayCircle,
  FileText,
  MessageSquare,
  Globe,
  CheckCircle2,
  Video,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import "./StudentLectureView.css";
import SharedVideoPlayer from "@/components/Dashboard/shared/SharedVideoPlayer";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import type { LectureDetails } from "@/types/Lectures/Types";

const StudentLectureReviewPage = () => {
  const { id } = useParams(); // URL params: /student/lecture/:id/review
  const navigate = useNavigate();

  const [lecture, setLecture] = useState<LectureDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { handleProgressUpdate } = useVideoProgress(
    id,
    lecture?.review_progress || 0,
    (newProgress) => {
      setLecture((prev) =>
        prev ? { ...prev, review_progress: newProgress } : null,
      );
    },
  );

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Lecture Details
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`lectures/${id}/`);
        console.log(response);
        setLecture(response.data);
      } catch (err) {
        console.error("Error fetching lecture:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture()

  }, [id]);

  // --- Fetch Chat History on Load ---
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!id || id === "demo-id") return;
      try {
        const response = await apiClient.get(`/chat/lectures/${id}/history/`);

        if (response.data.messages && response.data.messages.length > 0) {
          const history = response.data.messages.map((msg: any) => ({
            role: msg.sender === "ai" ? "bot" : "user",
            text: msg.text,
          }));
          setMessages(history);
        } else {
          setMessages([
            {
              role: "bot",
              text: "Hello! I am your AI Tutor. Ask me anything about this lecture.",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setMessages([
          {
            role: "bot",
            text: "Hello! I am your AI Tutor. Ask me anything about this lecture.",
          },
        ]);
      }
    };

    fetchChatHistory();
  }, [id]);

  // --- Send Message Handler ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const currentInput = input;
    const userMsg = { role: "user", text: currentInput };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsChatLoading(true);

    try {
      const response = await apiClient.post(`/chat/lectures/${id}/send/`, {
        message: currentInput,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: response.data.text,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (loading) return <div className="loader">Opening Lecture Room...</div>;

  return (
    <div className="pageWrapper">
      {/* Header Section */}
      <div className="header">
        <button onClick={() => navigate(-1)} className="backBtn">
          <ArrowLeft size={20} />
        </button>
        <div className="titleInfo">
          <h1>{lecture?.topic}</h1>
          <p>
            Course: <span>Interactive Learning</span>
          </p>
        </div>
        <div className="statusBadgeWrapper">
          <div className="activeBadge">
            <Globe size={14} /> Live Session
          </div>
        </div>
      </div>

      <div className="reviewGrid">
        {/* LEFT COLUMN: Video & Summary */}
        <div className="leftColumn">
          <div className="sectionCard">
            <div className="sectionHeader">
              <PlayCircle size={20} color="#6366f1" />
              <h2>Lecture Video</h2>
            </div>
            <div className="videoBox">
              {lecture?.video_url ? (
                <SharedVideoPlayer
                  videoUrl={lecture.video_url}
                  videoStatus={lecture.video_status}
                  onTimeUpdate={handleProgressUpdate}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    background: "#f8fafc",
                    borderRadius: "15px",
                  }}
                >
                  <PlayCircle size={48} color="#cbd5e1" />
                  <p style={{ marginTop: "10px", color: "#64748b" }}>
                    Video content is being processed or not available.
                  </p>
                </div>
              )}
            </div>

            {/* Watch Progress Bar below video */}
            <div
              style={{ padding: "15px 20px", borderTop: "1px solid #f1f5f9" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Video size={14} /> WATCHED PROGRESS
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#6366f1",
                  }}
                >
                  {lecture?.review_progress || 0}%
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#e2e8f0",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${lecture?.review_progress || 0}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #6366f1, #a855f7)",
                    transition: "width 0.5s ease",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* ADDED: Quiz & Assignment Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {lecture?.has_quiz ? (
              <div className="sectionCard" style={{ marginBottom: 0 }}>
                <div className="sectionHeader">
                  <HelpCircle size={20} color="#6366f1" />
                  <h2>Lecture Quiz</h2>
                </div>
                <div style={{ padding: "0 20px 20px" }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#64748b",
                      marginBottom: "15px",
                    }}
                  >
                    Test your knowledge with a quick AI-generated quiz.
                  </p>
                  <button
                    onClick={() => navigate(`/student/quiz/${id}`)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "#6366f1",
                      color: "white",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}

            {lecture?.has_assignment ? (
              <div className="sectionCard" style={{ marginBottom: 0 }}>
                <div className="sectionHeader">
                  <BookOpen size={20} color="#6366f1" />
                  <h2>Assignment</h2>
                </div>
                <div style={{ padding: "0 20px 20px" }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#64748b",
                      marginBottom: "15px",
                    }}
                  >
                    Complete the practical assignment for this session.
                  </p>
                  <button
                    onClick={() => navigate(`/student/assignment/${id}`)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "transparent",
                      color: "#6366f1",
                      border: "2px solid #6366f1",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View Assignment
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sectionCard">
            <div className="sectionHeader">
              <FileText size={20} color="#6366f1" />
              <h2>AI Generated Summary</h2>
            </div>
            <div
              className="summaryContent"
              style={{
                lineHeight: "1.6",
                color: "#334155",
                whiteSpace: "pre-line",
                padding: "0 20px 20px 20px",
              }}
            >
              {lecture?.summary_text ||
                "No summary available for this lecture yet."}
            </div>
          </div>

          <div className="successNotice">
            <div
              className="avatar"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <CheckCircle2 size={24} color="white" />
            </div>
            <div className="successText">
              <h3>Learning in Progress</h3>
              <p>
                You are viewing this lecture as a student. All AI queries are
                saved for your review.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ChatBot */}
        <div className="rightColumn">
          <div className="ai-chatbot-sidebar" style={{ height: "600px" }}>
            <div className="chat-header">
              <MessageSquare size={20} color="#6366f1" />
              <span>AI Lecture Tutor</span>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble ${msg.role}`}>
                  <div className="avatar">
                    {msg.role === "bot" ? (
                      <Bot size={16} />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="text">{msg.text}</div>
                </div>
              ))}

              {isChatLoading && (
                <div className="message-bubble bot">
                  <div className="avatar">
                    <Bot size={16} />
                  </div>
                  <div
                    className="text"
                    style={{ fontStyle: "italic", color: "#888" }}
                  >
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={isChatLoading}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLectureReviewPage;
