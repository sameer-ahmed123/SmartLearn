import { useState } from "react";
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  Hand, MessageSquare, Users, X, 
  FileText, Share2, MoreVertical, PhoneOff
} from "lucide-react";
import "./StudentVirtualRoom.css";

const VirtualStudyRoomPage = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "files" | "members">("members");

  const participants = [
    { id: 1, name: "You", role: "Host", avatar: "Y", isMuted: !isMicOn },
    { id: 2, name: "Ahmed Khan", role: "Student", avatar: "A", isMuted: true },
    { id: 3, name: "Sarah Malik", role: "Student", avatar: "S", isMuted: false },
    { id: 4, name: "Zaid Ahmed", role: "Student", avatar: "Z", isMuted: false },
  ];

  return (
    <div className="room-wrapper">
      {/* LEFT: VIDEO GRID SECTION */}
      <div className="video-section">
        <div className="video-grid">
          {participants.map((p) => (
            <div key={p.id} className="video-card">
              <div className="video-placeholder">
                <span className="avatar-big">{p.avatar}</span>
              </div>
              <div className="video-overlay-info">
                <span>{p.name} {p.id === 1 && "(You)"}</span>
                {p.isMuted && <MicOff size={14} color="#ef4444" />}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="room-controls">
          <div className="control-group">
            <button className={`icon-btn ${!isMicOn ? "off" : ""}`} onClick={() => setIsMicOn(!isMicOn)}>
              {isMicOn ? <Mic /> : <MicOff />}
            </button>
            <button className={`icon-btn ${!isCamOn ? "off" : ""}`} onClick={() => setIsCamOn(!isCamOn)}>
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

      {/* RIGHT: SIDEBAR (Notes, Chat, Members) */}
      <div className="room-sidebar">
        <div className="sidebar-tabs">
          <button className={activeTab === "members" ? "tab active" : "tab"} onClick={() => setActiveTab("members")}><Users size={18} /></button>
          <button className={activeTab === "chat" ? "tab active" : "tab"} onClick={() => setActiveTab("chat")}><MessageSquare size={18} /></button>
          <button className={activeTab === "files" ? "tab active" : "tab"} onClick={() => setActiveTab("files")}><FileText size={18} /></button>
        </div>

        <div className="sidebar-content">
          {activeTab === "members" && (
            <div className="member-list">
              <h3>Participants ({participants.length})</h3>
              {participants.map(p => (
                <div key={p.id} className="member-item">
                  <div className="member-avatar">{p.avatar}</div>
                  <div className="member-info">
                    <p>{p.name}</p>
                    <span>{p.role}</span>
                  </div>
                  {p.isMuted ? <MicOff size={16} opacity={0.5} /> : <Mic size={16} color="#10b981" />}
                </div>
              ))}
            </div>
          )}

          {activeTab === "files" && (
            <div className="files-section">
              <h3>Shared Resources</h3>
              <div className="file-box">
                <FileText size={20} />
                <div>
                  <p>Quantum_Notes.pdf</p>
                  <span>Shared by Ahmed</span>
                </div>
              </div>
              <button className="upload-btn">+ Share Note</button>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="chat-section">
              <div className="messages">
                <div className="msg"><b>Sarah:</b> Hi guys, ready for group study?</div>
              </div>
              <input type="text" placeholder="Type a message..." className="chat-input" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualStudyRoomPage;