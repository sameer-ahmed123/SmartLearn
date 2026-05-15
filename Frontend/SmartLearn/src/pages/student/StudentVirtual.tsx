import { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  Hand, MessageSquare, Users, X, 
  FileText, Share2, MoreVertical, PhoneOff,
  UserPlus, Check, Clock, Search, UserCheck, UserX, Trash2, Send
} from "lucide-react";
import "./StudentVirtualRoom.css";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "../../store/useAuthStore";

const VirtualStudyRoomPage = () => {
  // Zustand se access token uthayein
  const accessToken = useAuthStore((state) => state.accessToken);

  // UI States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "files" | "members" | "find">("members");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data States
  const [availableStudents, setAvailableStudents] = useState([]); 
  const [connections, setConnections] = useState([]); 
  const [messages, setMessages] = useState<{sender: string, content: string, timestamp: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // WebRTC & WebSocket Refs
  const socketRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const roomId = "study_room_1"; 

  // ICE Servers (Google's Public STUN servers)
  const rtcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  };

  // 🔥 Helper function to format time as 5:15 PM
  const formatMessageTime = (dateInput: any) => {
    return new Date(dateInput).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSocialData();
    fetchChatHistory();
    connectWebSocket();
    startLocalStream();

    return () => {
      socketRef.current?.close();
      localStream.current?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();
    };
  }, []);

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

  const connectWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const token = accessToken;
    
    if (!token) {
        console.error("❌ Auth Token nahi mila!");
        return;
    }

    const wsUrl = `${protocol}://127.0.0.1:8000/ws/study-room/${roomId}/?token=${token}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => console.log("Study Room WebSocket Connected ✅");

    socketRef.current.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      
      if (data.type === 'chat') {
        setMessages(prev => [...prev, { 
          sender: data.sender, 
          content: data.message, 
          timestamp: formatMessageTime(data.timestamp || Date.now()) 
        }]);
      } else {
        handleSignalingData(data);
      }
    };

    socketRef.current.onclose = () => setTimeout(connectWebSocket, 3000);
  };

  const handleSignalingData = async (data: any) => {
    switch (data.type) {
      case 'offer':
        await handleOffer(data.offer);
        break;
      case 'answer':
        await handleAnswer(data.answer);
        break;
      case 'candidate':
        await handleCandidate(data.candidate);
        break;
      default:
        break;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(rtcConfig);
    localStream.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current!);
    });
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };
    peerConnection.current = pc;
    return pc;
  };

  const initiateCall = async () => {
    console.log("Initiating call...");
    const pc = createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.send(JSON.stringify({ type: 'offer', offer }));
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.send(JSON.stringify({ type: 'answer', answer }));
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnection.current) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
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
      const formattedHistory = res.data.map((m: any) => ({
        sender: m.sender,
        content: m.content,
        timestamp: formatMessageTime(m.timestamp || Date.now())
      }));
      setMessages(formattedHistory);
    } catch (err) {
      console.error("Chat history load failed", err);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat',
        message: newMessage
      }));
      setNewMessage("");
    }
  };

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
      const track = type === 'video' ? localStream.current.getVideoTracks()[0] : localStream.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        type === 'video' ? setIsCamOn(track.enabled) : setIsMicOn(track.enabled);
      }
    }
  };

  return (
    <div className="room-wrapper" style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      <div className="video-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px' }}>
        
        {/* 4 Screens Grid: 2 Up, 2 Down */}
        <div className="video-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gridTemplateRows: '1fr 1fr', 
          gap: '12px', 
          flex: 1,
          minHeight: 0 
        }}>
          {/* Screen 1: You */}
          <div className="video-card" style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
              {isCamOn ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="video-feed" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="avatar-big">Y</span></div>
              )}
            <div className="video-overlay-info">
              <span>You (Host)</span>
              {!isMicOn && <MicOff size={14} color="#ef4444" />}
            </div>
          </div>

          {/* Screen 2: Partner */}
          <div className="video-card" style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
              <video ref={remoteVideoRef} autoPlay playsInline className="video-feed" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              {!remoteVideoRef.current?.srcObject && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="avatar-big">P</span></div>}
            <div className="video-overlay-info">
              <span>Partner</span>
            </div>
          </div>

          {/* Screen 3: Placeholder */}
          <div className="video-card" style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span className="avatar-big" style={{ opacity: 0.2 }}>S3</span>
             <div className="video-overlay-info"><span>Empty Slot</span></div>
          </div>

          {/* Screen 4: Placeholder */}
          <div className="video-card" style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span className="avatar-big" style={{ opacity: 0.2 }}>S4</span>
             <div className="video-overlay-info"><span>Empty Slot</span></div>
          </div>
        </div>

        {/* Buttons Section - Fixed on Screen */}
        <div className="room-controls" style={{ padding: '20px 0', display: 'flex', justifyContent: 'center', gap: '20px', marginTop: 'auto' }}>
          <div className="control-group" style={{ display: 'flex', gap: '10px' }}>
            <button className={`icon-btn ${!isMicOn ? "off" : ""}`} onClick={() => toggleMedia('audio')}>
              {isMicOn ? <Mic /> : <MicOff />}
            </button>
            <button className={`icon-btn ${!isCamOn ? "off" : ""}`} onClick={() => toggleMedia('video')}>
              {isCamOn ? <Video /> : <VideoOff />}
            </button>
          </div>

          <div className="control-group" style={{ display: 'flex', gap: '10px' }}>
            <button className="icon-btn action" onClick={initiateCall} title="Start Video Call"><ScreenShare /></button>
            <button className="icon-btn action"><Hand /></button>
            <button className="icon-btn action"><Share2 /></button>
            <button className="icon-btn action"><MoreVertical /></button>
          </div>

          <button className="end-call-btn" style={{ padding: '0 20px' }}>
            <PhoneOff size={20} /> Leave Room
          </button>
        </div>
      </div>

      <div className="room-sidebar" style={{ width: '360px', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-tabs">
          <button className={activeTab === "members" ? "tab active" : "tab"} onClick={() => setActiveTab("members")}><Users size={18} /></button>
          <button className={activeTab === "find" ? "tab active" : "tab"} onClick={() => setActiveTab("find")}><UserPlus size={18} /></button>
          <button className={activeTab === "chat" ? "tab active" : "tab"} onClick={() => setActiveTab("chat")}><MessageSquare size={18} /></button>
          <button className={activeTab === "files" ? "tab active" : "tab"} onClick={() => setActiveTab("files")}><FileText size={18} /></button>
        </div>

        <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === "chat" && (
            <div className="chat-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="messages scroll-area" style={{ flex: 1, padding: '15px' }}>
                {messages.length === 0 && <p className="empty-msg">No messages yet. Say Hi!</p>}
                {messages.map((m, i) => (
                  <div key={i} className="msg" style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <b style={{ color: "#6366f1", fontSize: '0.85rem' }}>{m.sender}</b>
                      <span style={{ fontSize: '0.7rem', color: '#666' }}>{m.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>{m.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-wrapper" style={{ padding: '15px', borderTop: '1px solid #333' }}>
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
            <div className="member-list" style={{ padding: '15px' }}>
              <h3>Find Study Partners</h3>
              <div className="search-box-mini">
                <Search size={14} />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                        <button className="add-peer-btn" onClick={(e) => sendRequest(e, s.id)}><UserPlus size={16} /></button>
                      )}
                      {s.connection_status === 'pending_incoming' && (
                         <button onClick={(e) => handleAction(e, s.connection_id, 'accept')} className="accept-btn"><Check size={14}/></button>
                      )}
                      {s.connection_status === 'accepted' && <UserCheck size={16} color="#10b981" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="member-list" style={{ padding: '15px' }}>
              <h3>My Study Group ({connections.length})</h3>
              <div className="scroll-area">
                {connections.map(p => (
                  <div key={p.id} className="member-item">
                    <div className="member-avatar">{p.name?.[0] || 'U'}</div>
                    <div className="member-info"><p>{p.name}</p></div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      <button onClick={initiateCall} className="icon-btn-small" style={{ color: '#6366f1' }}><Video size={18} /></button>
                      <button onClick={(e) => handleAction(e, p.id, 'remove')} className="icon-btn-small" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="files-section" style={{ padding: '15px' }}>
              <h3>Shared Resources</h3>
              <div className="file-box">
                <FileText size={20} />
                <div><p>Course_Notes.pdf</p><span>Click to download</span></div>
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