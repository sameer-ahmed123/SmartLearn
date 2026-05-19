# 🛡️ Phase 6: AI-Enhanced Quiz Proctoring & Security

## 📍 Phase 6: Implementation Status

### 1. Backend Security Layer (Django)
- [ ] **Violation Model:** Create `QuizViolation` to log incidents (User, Quiz, Violation Type, Timestamp).
- [ ] **Integrity Endpoints:** API to receive real-time security pings from the frontend.
- [ ] **Quiz State Lock:** Backend logic to "Auto-Fail" or lock a quiz if violations exceed a threshold.
- [ ] **Proctoring Config:** Model fields for Quiz to toggle "Face Detection" or "Tab Switching" rules.

### 2. Frontend Detection Engine (React + AI)
- [ ] **MediaPipe/Face-API Integration:** Load pre-trained models for facial landmark detection.
- [ ] **Active Vision Hook:** Custom hook `useProctoring` to monitor camera stream for eye/head movement.
- [ ] **Detection Logic:**
    - **Gaze Tracking:** Detect if eyes leave the screen area.
    - **Head Pose Estimation:** Detect yaw/pitch indicating looking at external materials.
    - **Identity Verification:** Ensure only one face is present and matches the logged-in user.
- [ ] **Tab/Window Monitoring:** Implement `visibilitychange` listeners to prevent googling answers.

### 3. UI/UX (Proctoring Interface)
- [ ] **Camera Preview:** Small, non-intrusive camera overlay with "Live" status.
- [ ] **Warning System:** Toast notifications for "Face Not Detected" or "Eyes Off Screen."
- [ ] **Pre-Quiz Check:** "Hardware Check" step to verify camera permissions and lighting.

## 🟢 Completed (Pre-requisites)
- [x] **User Identity:** Global `useAuthStore` provides the current user's profile and avatar for verification.
- [x] **Branch Merged:** Phase 5 (Profiles) successfully integrated into `main`.

## 🟡 In-Progress (Development)
- [ ] **Research:** Testing `face-api.js` vs `MediaPipe` for browser performance.
- [ ] **Architecture:** Defining the violation threshold logic (e.g., 3 strikes rule).

## 🛠 Technical Notes & Challenges
* **Performance:** AI models are CPU intensive. We must run detection at an interval (e.g., every 1500ms) to avoid lagging the actual quiz.
* **Privacy:** Must implement a clear "Data Consent" popup before accessing the webcam.
* **False Positives:** Handling scenarios where a user might look down at their keyboard or have glasses glare.
* **Persistent Failures:** If a user loses camera connection, the quiz should pause rather than instantly failing.

## 🚀 Future Refinement (Advanced Proctoring)
- [ ] **Object Detection:** Detect phones, books, or second monitors in the frame.
- [ ] **Audio Analysis:** Detect "Cheating Sounds" (whispering, page turning).
- [ ] **Snapshot Evidence:** Save low-res thumbnails of the violation moment to Cloudinary for teacher review.

---

**Last Updated:** May 12, 2026
**Branch Status:** `feature/quiz-proctoring` - **Scoping & Setup.**