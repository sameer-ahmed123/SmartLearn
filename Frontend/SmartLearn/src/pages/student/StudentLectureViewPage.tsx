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
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import "./StudentLectureView.css";
import SharedVideoPlayer from "@/components/Dashboard/shared/SharedVideoPlayer";

const StudentLectureReviewPage = () => {
  const { id } = useParams(); // URL params: /student/lecture/:id/review
  const navigate = useNavigate();

  const [lecture, setLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        setLecture(response.data);
      } catch (err) {
        console.error("Error fetching lecture:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id !== "demo-id") {
      fetchLecture();
    } else {
      setLecture({
        topic: "Demo: How to use the AI Tutor",
        summary_text: "This is a sample summary for the lecture.",
        video_url: "",
        created_at: new Date().toLocaleDateString(),
      });
      setLoading(false);
    }
  }, [id]);

  // --- NEW: Fetch Chat History on Load ---
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!id || id === "demo-id") return;
      try {
        const response = await apiClient.get(`/chat/lectures/${id}/history/`);

        // If there is history, map it to the frontend state. Otherwise, show default message.
        if (response.data.messages && response.data.messages.length > 0) {
          const history = response.data.messages.map((msg: any) => ({
            role: msg.sender === "ai" ? "bot" : "user", // Map backend 'ai' to frontend 'bot' for CSS
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

  // --- UPDATED: Send Message Handler ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const currentInput = input;
    const userMsg = { role: "user", text: currentInput };

    setMessages((prev) => [...prev, userMsg]);
    setInput(""); // Clear input immediately for better UX
    setIsChatLoading(true);

    try {
      // Hit the new persistent chatbot endpoint
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
                  title="AI Lecture Presentation"
                />
              ) : (
                // <video controls className="main-video" style={{width: '100%', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
                //   <source src={lecture.video_url} type="video/mp4" />
                // </video>

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
          {/* ChatBot Section */}
          <div className="ai-chatbot-sidebar" style={{ height: "500px" }}>
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

              {/* Show typing indicator while waiting for AI */}
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
                disabled={isChatLoading} // Disable input while loading
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
