import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, User, Bot, PlayCircle, 
  FileText, MessageSquare, Globe, Info, Clock, CheckCircle2 
} from "lucide-react";
import apiClient from "@/api/apiClient";
import "./StudentLectureView.css";

const StudentLectureReviewPage = () => {
  const { id } = useParams(); // URL params: /student/lecture/:id/review
  const navigate = useNavigate();
  
  const [lecture, setLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am your AI Tutor. Ask me anything about this lecture." }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        // Correct endpoint as per your urls.py: path('<int:id>/', lecture_detail)
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
        summary_text: "This is a sample summary for the lecture. It explains how AI can help you learn faster by providing instant answers to your questions based on the video content.",
        video_url: "",
        created_at: new Date().toLocaleDateString()
      });
      setLoading(false);
    }
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "bot", 
        text: `I'm analyzing the lecture content for: "${input}". (AI integration coming soon!)` 
      }]);
    }, 1000);
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
          <p>Course: <span>Interactive Learning</span></p>
        </div>
        <div className="statusBadgeWrapper">
          <div className="activeBadge"><Globe size={14} /> Live Session</div>
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
                <video controls className="main-video" style={{width: '100%', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
                  <source src={lecture.video_url} type="video/mp4" />
                </video>
              ) : (
                <div style={{textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '15px'}}>
                  <PlayCircle size={48} color="#cbd5e1" />
                  <p style={{marginTop: '10px', color: '#64748b'}}>Video content is being processed or not available.</p>
                </div>
              )}
            </div>
          </div>

          <div className="sectionCard">
            <div className="sectionHeader">
              <FileText size={20} color="#6366f1" />
              <h2>AI Generated Summary</h2>
            </div>
            <div className="summaryContent" style={{ lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line' }}>
              {/* Backend se 'summary_text' field aa raha hai, is liye wahi use kiya hai */}
              {lecture?.summary_text || "No summary available for this lecture yet."}
            </div>
          </div>

          <div className="successNotice">
            <div className="avatar" style={{background: 'rgba(255,255,255,0.2)'}}>
              <CheckCircle2 size={24} color="white" />
            </div>
            <div className="successText">
              <h3>Learning in Progress</h3>
              <p>You are viewing this lecture as a student. All AI queries are saved for your review.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Metadata & ChatBot */}
        <div className="rightColumn">
          {/* Metadata Info */}
          <div className="metadataCard">
            <div className="metaHeader">
              <Info size={16} /> LECTURE DETAILS
            </div>
            <div className="metaGroup">
              <label><Clock size={12} /> DATE PUBLISHED</label>
              <p>{lecture?.created_at ? new Date(lecture.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="metaGroup">
              <label><MessageSquare size={12} /> AI TUTOR STATUS</label>
              <div className="promptBox" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #10b981' }}>
                Active & Ready to Assist
              </div>
            </div>
          </div>

          {/* ChatBot Section */}
          <div className="ai-chatbot-sidebar" style={{ height: '500px' }}>
            <div className="chat-header">
              <MessageSquare size={20} color="#6366f1" />
              <span>AI Lecture Tutor</span>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble ${msg.role}`}>
                  <div className="avatar">
                    {msg.role === "bot" ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className="text">{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                placeholder="Ask a question..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="send-btn">
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