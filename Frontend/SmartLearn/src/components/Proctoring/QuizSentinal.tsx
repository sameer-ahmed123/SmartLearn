import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import styles from "./QuizSentinal.module.css";

interface ProctorProps {
  onViolation: (type: string) => void;
}

const QuizSentinel: React.FC<ProctorProps> = ({ onViolation }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const violationBuffer = useRef<{ [key: string]: number }>({});

  const throttledViolation = (type: string) => {
    const now = Date.now();
    // Only trigger the same violation type once every 3 seconds
    if (
      !violationBuffer.current[type] ||
      now - violationBuffer.current[type] > 3000
    ) {
      violationBuffer.current[type] = now;
      onViolation(type);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    // 1. Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 2, // We use this to detect if a second person is present
      refineLandmarks: true, // Needed for precise eye/iris tracking
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // 2. Define the Detection Logic
    faceMesh.onResults((results) => {
      // 1. Basic Presence Checks
      if (results.multiFaceLandmarks.length === 0) {
        onViolation("NO_FACE");
        return;
      }
      if (results.multiFaceLandmarks.length > 1) {
        onViolation("MULTI_FACE");
        return;
      }

      // 2. Gaze & Head Pose Logic
      const landmarks = results.multiFaceLandmarks[0];

      // Landmark Indices:
      // 4: Nose Tip, 33: Left Eye Outer, 263: Right Eye Outer
      const nose = landmarks[4];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];

      // Calculate the horizontal midpoint between eyes
      const eyeMidpointX = (leftEye.x + rightEye.x) / 2;

      // Calculate the "Yaw" (Left/Right look)
      // We check how far the nose is from the center of the eyes
      const horizontalDeviation = nose.x - eyeMidpointX;

      // Thresholds (Tweak these based on testing)
      // 0.05 is usually a slight turn, 0.1 is looking away from the screen
      if (horizontalDeviation > 0.08) {
        throttledViolation("LOOK_LEFT");
      } else if (horizontalDeviation < -0.08) {
        throttledViolation("LOOK_RIGHT");
      }

      // 3. Calculate "Pitch" (Up/Down look)
      // We compare the nose height to the eye height
      const eyeMidpointY = (leftEye.y + rightEye.y) / 2;
      const verticalDeviation = nose.y - eyeMidpointY;

      // If verticalDeviation is high, they are looking down at a phone/paper
      if (verticalDeviation > 0.15) {
        onViolation("LOOK_DOWN");
      }
    });

    // 3. Setup Camera Loop
    const camera = new cam.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().then(() => setIsModelLoaded(true));

    return () => {
      camera.stop();
      faceMesh.close();
    };
  }, []);

  return (
    <div className={styles.sentinelWrapper}>
      <video ref={videoRef} className={styles.videoFeed} autoPlay muted />
      <div className={styles.statusIndicator}>
        <div className={isModelLoaded ? styles.dotGreen : styles.dotPulse} />
        <span>
          {isModelLoaded ? "AI Proctoring Active" : "Initializing AI..."}
        </span>
      </div>
    </div>
  );
};

export default QuizSentinel;
