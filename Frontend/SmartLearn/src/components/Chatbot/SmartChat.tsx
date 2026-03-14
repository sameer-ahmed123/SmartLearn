import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './SmartChat.css';
import apiClient from '@/api/apiClient';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const SmartChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I am your SmartLearn Assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      // FIX: Aapke main urls.py ke mutabiq path '/v1/ai/chat/' banta hai
      const response = await apiClient.post('ai/chat/', { message: userMsg });
      setMessages(prev => [...prev, { text: response.data.reply, sender: 'ai' }]);
    } catch (error: any) {
      console.error("Chat Error:", error.response?.data || error.message);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Floating Button */}
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <Bot size={20} />
              <span>SmartLearn AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className="message-icon">
                  {msg.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message-wrapper ai">
                <div className="message-bubble typing">AI is thinking...</div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="send-btn">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartChat;