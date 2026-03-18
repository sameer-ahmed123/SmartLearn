// src/components/Shared/SharedVideoPlayer.tsx

import React, { useRef } from 'react';

interface SharedVideoPlayerProps {
  videoUrl: string | null | undefined;
  videoStatus?: "none" | "processing" | "completed" | "failed" | string;
  title?: string;
  // NEW: Parent se function receive karne ke liye prop
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const SharedVideoPlayer: React.FC<SharedVideoPlayerProps> = ({ 
  videoUrl, 
  videoStatus, 
  title,
  onTimeUpdate 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video ke time change hone par parent ko batane wala function
  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  // 1. Handle "None" or "Pending" states
  if (!videoStatus || videoStatus === 'none' || videoStatus === 'pending') {
    return (
      <div style={{ padding: '40px', background: '#f8f9fa', textAlign: 'center', borderRadius: '8px', border: '2px dashed #ccc', color: '#6c757d' }}>
        <p>🎥 No video generated for this lecture yet.</p>
      </div>
    );
  }

  // 2. Handle "Processing" state
  if (videoStatus === 'processing') {
    return (
      <div style={{ padding: '40px', background: '#e8f4f8', textAlign: 'center', borderRadius: '8px', border: '2px solid #3498db', color: '#2980b9' }}>
        <p>⏳ <strong>Video is currently generating...</strong></p>
        <p style={{ fontSize: '0.9em' }}>This usually takes about 1-2 minutes. You can refresh the page later.</p>
      </div>
    );
  }

  // 3. Handle "Failed" state
  if (videoStatus === 'failed') {
    return (
      <div style={{ padding: '40px', background: '#fceaea', textAlign: 'center', borderRadius: '8px', border: '2px solid #e74c3c', color: '#c0392b' }}>
        <p>❌ <strong>Video generation failed.</strong></p>
        <p style={{ fontSize: '0.9em' }}>There was an error communicating with the AI. Please try again or contact support.</p>
      </div>
    );
  }

  // 4. Handle "Completed" state (Safety check: ensure we actually have a URL)
  if (videoStatus === 'completed' && videoUrl) {
    return (
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {title && <h3 style={{ margin: 0, color: '#2c3e50' }}>{title}</h3>}
        <video 
          ref={videoRef}
          controls 
          onTimeUpdate={handleTimeUpdate} // <-- Yeh line backend ko data bhejegi
          controlsList="nodownload"
          style={{ width: '100%', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', backgroundColor: '#000' }}
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // 5. Absolute Fallback
  return null;
};

export default SharedVideoPlayer;