import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
// import * as cam from "@mediapipe/camera_utils";
import styles from "./QuizSentinal.module.css";
interface ProctorProps {
  onViolation: (type: string) => void;
}

const QuizSentinel: React.FC<ProctorProps> = ({ onViolation }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const isInitialized = useRef(false);

  const violationBuffer = useRef<{ [key: string]: number }>({});

  const throttledViolation = useCallback(
    (type: string) => {
      const now = Date.now();
      // Only trigger the same violation type once every 3 seconds
      if (
        !violationBuffer.current[type] ||
        now - violationBuffer.current[type] > 3000
      ) {
        violationBuffer.current[type] = now;
        onViolation(type);
      }
    },
    [onViolation],
  );

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    let isMounted = true;
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // 1. Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file: string) => {
        // If you named your folder 'facemesh' inside 'models'
        return `/models/facemesh/${file}`;
      },
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
        throttledViolation("NO_FACE");
        return;
      }
      if (results.multiFaceLandmarks.length > 1) {
        throttledViolation("MULTI_FACE");
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
        throttledViolation("LOOK_DOWN");
      }
    });

    // 3. Setup Camera Loop
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
          },
          audio: false,
        });

        if (!isMounted) return;

        videoElement.srcObject = stream;

        await videoElement.play();

        const detectFrame = async () => {
          if (!isMounted) return;

          try {
            await faceMesh.send({ image: videoElement });
          } catch (err) {
            console.warn("FaceMesh send error:", err);
          }

          if (isMounted) {
            requestAnimationFrame(detectFrame);
          }
        };

        detectFrame();

        setIsModelLoaded(true);
      } catch (err) {
        console.error("Camera access failed:", err);
      }
    };

    startCamera();

    return () => {
      console.log("QUIZ SENTINEL UNMOUNTING");
      isMounted = false;

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // Fully detach stream from video
      videoElement.pause();
      videoElement.srcObject = null;

      setTimeout(() => {
        try {
          faceMesh.close();
        } catch (err) {
          console.warn("FaceMesh cleanup error:", err);
        }
      }, 100);

      isInitialized.current = false;
    };
  }, [throttledViolation]);

  return (
    <div className={styles.sentinelWrapper}>
      <video
        ref={videoRef}
        className={styles.videoFeed}
        autoPlay
        muted
        playsInline
      />
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
