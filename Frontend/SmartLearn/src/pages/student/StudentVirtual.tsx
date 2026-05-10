import { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  Hand, MessageSquare, Users, X, 
  FileText, Share2, MoreVertical, PhoneOff,
  UserPlus, Check, Clock, Search, UserCheck, UserX, Trash2, Send
} from "lucide-react";
import "./StudentVirtualRoom.css";
import apiClient from "@/api/apiClient";

const VirtualStudyRoomPage = () => {
  // UI States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "files" | "members" | "find">("members");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data States
  const [availableStudents, setAvailableStudents] = useState([]); 
  const [connections, setConnections] = useState([]); 
  const [messages, setMessages] = useState<{sender: string, content: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Refs for WebSockets, Streams & UI
  const socketRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Room ID
  const roomId = "study_room_1"; 

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Initial Setup: Socket, Camera and History
  useEffect(() => {
    fetchSocialData();
    fetchChatHistory();
    connectWebSocket();
    startLocalStream();

    return () => {
      socketRef.current?.close();
      localStream.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    
    // 🔥 Priority to 'access' key as used by TokenAuthMiddleware
    const token = localStorage.getItem("access") || localStorage.getItem("access_token");
    
    if (!token) {
        console.error("❌ Auth Token missing! WebSocket connection will likely fail on backend.");
    }

    const wsUrl = `${protocol}://127.0.0.1:8000/ws/study-room/${roomId}/?token=${token}`;
    
    console.log("🔗 Connecting to WebSocket:", wsUrl);
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("Study Room WebSocket Connected ✅");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("📩 Socket Received:", data);

      if (data.type === 'chat') {
        setMessages(prev => [...prev, { sender: data.sender, content: data.message }]);
      }
      
      // Signaling for Video/Audio (WebRTC)
      if (['offer', 'answer', 'candidate'].includes(data.type)) {
          handleSignalingData(data);
      }
    };

    socketRef.current.onclose = (e) => {
      console.log("WebSocket Disconnected. Reconnecting in 3s...", e.reason);
      setTimeout(connectWebSocket, 3000);
    };

    socketRef.current.onerror = (err) => {
        console.error("WebSocket Error:", err);
    };
  };

  // WebRTC Signaling Handler
  const handleSignalingData = (data: any) => {
    console.log("WebRTC signaling logic triggered for:", data.type);
    // Peer-to-peer connection logic will go here
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const fetchSocialData = async () => {
    try {
      const studentsRes = await apiClient.get("/lectures/same-course-students/");
      const connectionsRes = await apiClient.get("/lectures/connections/");
      setAvailableStudents(studentsRes.data);
      setConnections(connectionsRes.data); 
    } catch (err) {
      console.error("Social data fetch failed", err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await apiClient.get(`/lectures/messages/${roomId}/`);
      setMessages(res.data);
    } catch (err) {
      console.error("Chat history load failed", err);
    }
  };

  // 2. Chat Send Logic
  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat',
        message: newMessage
      }));
      setNewMessage("");
    } else {
        console.warn("WebSocket not connected. Message not sent.");
    }
  };

  // 3. Social Actions
  const sendRequest = async (e: React.MouseEvent, studentId: number) => {
    e.stopPropagation();
    try {
      await apiClient.post(`/lectures/request/${studentId}/`);
      fetchSocialData();
    } catch (err) {
      console.error("Send request failed", err);
    }
  };

  const handleAction = async (e: React.MouseEvent, connectionId: number, action: 'accept' | 'reject' | 'remove') => {
    e.stopPropagation();
    const confirmMsg = action === 'remove' ? "Remove this partner?" : null;
    if (confirmMsg && !window.confirm(confirmMsg)) return;

    try {
      await apiClient.post(`/lectures/request-action/${connectionId}/`, { action });
      fetchSocialData(); 
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  const toggleMedia = (type: 'video' | 'audio') => {
    if (localStream.current) {
      const track = type === 'video' 
        ? localStream.current.getVideoTracks()[0] 
        : localStream.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        type === 'video' ? setIsCamOn(track.enabled) : setIsMicOn(track.enabled);
      }
    }
  };

  return (
    <div className="room-wrapper">
      <div className="video-section">
        <div className="video-grid">
          <div className="video-card">
            <div className="video-placeholder">
              {isCamOn ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="video-feed" />
              ) : (
                <span className="avatar-big">Y</span>
              )}
            </div>
            <div className="video-overlay-info">
              <span>You (Host)</span>
              {!isMicOn && <MicOff size={14} color="#ef4444" />}
            </div>
          </div>

          <div className="video-card">
            <div className="video-placeholder">
              <span className="avatar-big">P</span>
            </div>
            <div className="video-overlay-info">
              <span>Partner</span>
              <MicOff size={14} color="#ef4444" />
            </div>
          </div>
        </div>

        <div className="room-controls">
          <div className="control-group">
            <button className={`icon-btn ${!isMicOn ? "off" : ""}`} onClick={() => toggleMedia('audio')}>
              {isMicOn ? <Mic /> : <MicOff />}
            </button>
            <button className={`icon-btn ${!isCamOn ? "off" : ""}`} onClick={() => toggleMedia('video')}>
              {isCamOn ? <Video /> : <VideoOff />}
            </button>
          </div>

          <div className="control-group">
            <button className="icon-btn action"><ScreenShare /></button>
            <button className="icon-btn action"><Hand /></button>
            <button className="icon-btn action"><Share2 /></button>
            <button className="icon-btn action"><MoreVertical /></button>
          </div>

          <button className="end-call-btn">
            <PhoneOff /> Leave Room
          </button>
        </div>
      </div>

      <div className="room-sidebar">
        <div className="sidebar-tabs">
          <button className={activeTab === "members" ? "tab active" : "tab"} onClick={() => setActiveTab("members")}><Users size={18} /></button>
          <button className={activeTab === "find" ? "tab active" : "tab"} onClick={() => setActiveTab("find")}><UserPlus size={18} /></button>
          <button className={activeTab === "chat" ? "tab active" : "tab"} onClick={() => setActiveTab("chat")}><MessageSquare size={18} /></button>
          <button className={activeTab === "files" ? "tab active" : "tab"} onClick={() => setActiveTab("files")}><FileText size={18} /></button>
        </div>

        <div className="sidebar-content">
          {activeTab === "chat" && (
            <div className="chat-section">
              <div className="messages scroll-area">
                {messages.length === 0 && <p className="empty-msg">No messages yet. Say Hi!</p>}
                {messages.map((m, i) => (
                  <div key={i} className="msg">
                    <b style={{ color: "#6366f1" }}>{m.sender}: </b>
                    <span>{m.content}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="chat-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="send-btn">
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "find" && (
            <div className="member-list">
              <h3>Find Study Partners</h3>
              <div className="search-box-mini">
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="scroll-area">
                {availableStudents.filter(s => s.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                  <div key={s.id} className="member-item">
                    <div className="member-avatar">{s.full_name[0]}</div>
                    <div className="member-info">
                      <p>{s.full_name}</p>
                      <span>{s.connection_status.replace('_', ' ')}</span>
                    </div>
                    <div style={{ marginLeft: 'auto', zIndex: 10 }}>
                      {s.connection_status === 'none' && (
                        <button className="add-peer-btn" onClick={(e) => sendRequest(e, s.id)}>
                          <UserPlus size={16} />
                        </button>
                      )}
                      {s.connection_status === 'pending_incoming' && (
                         <button onClick={(e) => handleAction(e, s.connection_id, 'accept')} className="accept-btn">
                           <Check size={14}/>
                         </button>
                      )}
                      {s.connection_status === 'accepted' && <UserCheck size={16} color="#10b981" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="member-list">
              <h3>My Study Group ({connections.length})</h3>
              <div className="scroll-area">
                {connections.map(p => (
                  <div key={p.id} className="member-item">
                    <div className="member-avatar">{p.name?.[0] || 'U'}</div>
                    <div className="member-info"><p>{p.name}</p></div>
                    <button onClick={(e) => handleAction(e, p.id, 'remove')} style={{ marginLeft: 'auto' }}>
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="files-section">
              <h3>Shared Resources</h3>
              <div className="file-box">
                <FileText size={20} />
                <div>
                  <p>Course_Notes.pdf</p>
                  <span>Click to download</span>
                </div>
              </div>
              <button className="upload-btn">+ Share Note</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualStudyRoomPage;