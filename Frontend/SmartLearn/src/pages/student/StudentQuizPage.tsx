import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Loader2,
  XCircle,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import "./StudentQuizPage.css";
import QuizSentinel from "@/components/Proctoring/QuizSentinal";
import { getVerdict } from "@/components/Proctoring/ProctorJudge";
import type { ViolationStats } from "@/components/Proctoring/ProctorJudge";
import { toast } from "react-toastify";
import {
  triggerWarningToast,
  typeMap,
} from "@/components/Proctoring/Proctorhelper";

const StudentQuizPage = () => {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizLectureTitle, setQuizLectureTitle] = useState("");
  const [, setViolationStats] = useState<ViolationStats>({
    TAB_SWITCH: 0,
    MULTI_FACE: 0,
    LOOK_LEFT: 0,
    LOOK_RIGHT: 0,
    LOOK_DOWN: 0,
    NO_FACE: 0,
  });
  const pendingAction = useRef<{ type: string; verdict: any } | null>(null);
  const systemReadyRef = useRef(false);
  const [violationTrigger, setViolationTrigger] = useState(0);
  const mountTimeRef = useRef(Date.now());

  const isTerminatedRef = useRef(false);
  const isSystemReadyRef = useRef(false);

  const calculateScoreAndSave = useCallback(
    async (wasTerminated: boolean = false,termination_reason:string = '') => {
      const formattedAnswers: any = {};

      quizData.forEach((question, index) => {
        const selectedOptionIndex = selectedAnswers[index];
        const options = question.options;
        const selectedOption = options[selectedOptionIndex];

        const finalValue =
          typeof selectedOption === "object"
            ? selectedOption.text
            : selectedOption;
        formattedAnswers[index] = finalValue;
      });

      try {
        const response = await apiClient.post(
          `/assessments/quiz/${id}/submit/`,
          {
            student_answers: formattedAnswers,
            is_flagged: wasTerminated,
            termination_reason:termination_reason
          },
        );

        if (response.data && response.data.correct_count !== undefined) {
          setScore(response.data.correct_count);
        } else {
          setScore(response.data.score || 0);
        }
        setShowResult(true);
      } catch (err) {
        console.error("Failed to save score to backend:", err);

        let localCount = 0;
        quizData.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.correct_index) localCount++;
        });
        setScore(localCount);
        setShowResult(true);
      }
    },
    [id, quizData, selectedAnswers],
  );

  const logViolation = async (quizId: string, type: string) => {
    const backendType = typeMap(type);
    try {
      await apiClient.post(`/assessments/quiz/${quizId}/violation/`, {
        type: backendType,
      });
    } catch (err) {
      console.error("Failed to log proctoring violation", err);
    }
  };

  const handleViolation = useCallback(async (type: string) => {
    console.log(
      `Checking violation: ${type}. SystemReady: ${isSystemReadyRef.current}, Terminated: ${isTerminatedRef.current}`,
    );
    const secondsSinceMount = (Date.now() - mountTimeRef.current) / 1000;

    if (secondsSinceMount < 10) {
      console.warn(
        `Warm-up phase: Ignoring ${type} (${secondsSinceMount.toFixed(1)}s)`,
      );
      return;
    }

    if (isTerminatedRef.current) return;

    console.log(type, "from handel violation function");
    // Use the functional update to get the latest state
    setViolationStats((prev) => {
      // 1. Calculate what the NEW stats WOULD be
      const nextStats = {
        ...prev,
        [type]: prev[type as keyof ViolationStats] + 1,
      };
      // 2. Ask the judge based on those future stats
      const verdict = getVerdict(nextStats, type);
      if (verdict.isSpam) {
        console.log(`Verdict for ${type}: SPAM (ignored)`);
        return prev;
      }
      console.log(`Verdict for ${type}: VALID. Counts:`, nextStats);
      // 3. If NOT spam, proceed with side effects
      pendingAction.current = { type, verdict };
      setViolationTrigger((v) => v + 1);
      return nextStats;
    });
  }, []);
  // 2. This Effect listens for changes and handles Toasts/API calls safely
  useEffect(() => {
    console.log("Effect Triggered! PendingAction:", pendingAction.current);
    if (!pendingAction.current) return;

    const { type, verdict } = pendingAction.current;
    pendingAction.current = null; // Clear immediately
    const wasTerminated = verdict.terminate;
    const terminationReason = verdict.reason;
    const executeAction = async () => {
      console.log(
        `Executing Action for: ${type}. Terminate: ${wasTerminated}`,
      );
      // Sync to Database
      if (id) logViolation(id, type);

      if (wasTerminated) {
        setIsTerminated(true);
        toast.error(`QUIZ TERMINATED: ${terminationReason}`, {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        });
        // Auto-complete the quiz
        await calculateScoreAndSave(wasTerminated,terminationReason);
      } else {
        // Trigger Warning Toast
        triggerWarningToast(type);
      }
    };

    executeAction();
  }, [violationTrigger, id, calculateScoreAndSave]);

  useEffect(() => {
    // Start the timer immediately when the page loads
    const timer = setTimeout(() => {
      console.log("PROCTOR SYSTEM ONLINE");
      setIsSystemReady(true);
      systemReadyRef.current = true;
    }, 5000); // 5 seconds to let the camera/AI warm up

    return () => clearTimeout(timer);
  }, []); // Empty dependency array means it runs once on mount

  useEffect(() => {
    isTerminatedRef.current = isTerminated;
  }, [isTerminated]);

  useEffect(() => {
    isSystemReadyRef.current = isSystemReady;
  }, [isSystemReady]);
  // Fetch Quiz Data Effect
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/assessments/quiz/${id}/`);
        const data = response.data.quiz_data;
        setQuizLectureTitle(response.data.title);
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;

        if (parsedData && Array.isArray(parsedData)) {
          setQuizData(parsedData);
        } else if (parsedData && parsedData.questions) {
          setQuizData(parsedData.questions);
        } else {
          console.error("Quiz data format not recognized:", parsedData);
        }
      } catch (err) {
        console.error("Error fetching real quiz data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Tab Switching Detection Effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only log if the quiz is ongoing and not in result mode
      if (document.hidden && !showResult && !loading) {
        handleViolation("TAB_SWITCH");
        toast.error(
          "Security Warning: Tab switching is prohibited and has been recorded.",
          {
            position: "top-center",
            autoClose: 5000,
          },
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showResult, loading, handleViolation]);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScoreAndSave();
    }
  };

  const cardStyle = {
    backgroundColor: "var(--card)",
    color: "var(--foreground)",
    borderColor: "var(--border)",
  };

  if (loading) {
    return (
      <div className="quiz-loading-state">
        <Loader2 className="animate-spin" size={40} />
        <p>Loading Quiz Questions...</p>
      </div>
    );
  }

  if (quizData.length === 0) {
    return (
      <div className="quiz-error-state">
        <p>No questions found for this quiz.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* AI PROCTORING : Active only during quiz */}
      {!showResult && <QuizSentinel onViolation={handleViolation} />}
      {/* <div style={{ display: showResult ? "none" : "block" }}>
        <QuizSentinel onViolation={(type) => handleViolation(type)} />
      </div> */}

      <div className="quiz-header">
        <h1 style={{ color: "var(--foreground)" }}>
          {showResult ? (
            "Quiz Results"
          ) : (
            <>
              Quiz for <strong> {quizLectureTitle}</strong>
            </>
          )}
        </h1>
        <div
          className="progress-text"
          style={{ color: "var(--muted-foreground)" }}
        >
          {showResult
            ? "Finished"
            : `Question ${currentQuestion + 1} of ${quizData.length}`}
        </div>
      </div>

      {!showResult ? (
        <div className="quiz-card" style={cardStyle}>
          <div
            className="progress-bar"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestion + 1) / quizData.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="question-section">
            <div className="question-header">
              <HelpCircle size={24} color="#6366f1" />
              <h2
                className="question-text"
                style={{ color: "var(--foreground)" }}
              >
                {quizData[currentQuestion].question_text ||
                  quizData[currentQuestion].question ||
                  quizData[currentQuestion].text ||
                  "Question not found"}
              </h2>
            </div>

            <div className="options-grid">
              {quizData[currentQuestion].options.map(
                (option: any, index: number) => (
                  <button
                    key={index}
                    className={`option-btn ${selectedAnswers[currentQuestion] === index ? "selected" : ""}`}
                    onClick={() => handleOptionSelect(index)}
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <span
                      className="option-label"
                      style={{
                        backgroundColor: "var(--muted)",
                        color: "var(--foreground)",
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">
                      {typeof option === "object" ? option.text : option}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          <button
            className="next-btn"
            disabled={selectedAnswers[currentQuestion] === undefined}
            onClick={handleNext}
          >
            {currentQuestion === quizData.length - 1
              ? "Submit Quiz"
              : "Next Question"}
            <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <div className="result-card" style={cardStyle}>
          <Award size={80} color="#f59e0b" style={{ marginBottom: "20px" }} />
          <h2 style={{ color: "var(--foreground)" }}>Well Done!</h2>
          <div className="score-display">
            <span className="final-score">{score}</span>
            <span
              className="total-score"
              style={{ color: "var(--muted-foreground)" }}
            >
              {" "}
              / {quizData.length}
            </span>
          </div>

          <div
            className="review-breakdown"
            style={{ borderTopColor: "var(--border)" }}
          >
            <h3 style={{ color: "var(--foreground)" }}>Review Answers</h3>
            {quizData.map((question, qIdx) => {
              const studentIdx = selectedAnswers[qIdx];
              const options = question.options || [];
              const correctIdx = question.correct_index;
              const isCorrect = studentIdx === correctIdx;

              const studentAnsText = options[studentIdx]
                ? typeof options[studentIdx] === "object"
                  ? options[studentIdx].text
                  : options[studentIdx]
                : "Not Answered";
              const correctAnsText = options[correctIdx]
                ? typeof options[correctIdx] === "object"
                  ? options[correctIdx].text
                  : options[correctIdx]
                : "N/A";

              return (
                <div
                  key={qIdx}
                  className={`review-item ${isCorrect ? "is-correct" : "is-wrong"}`}
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="review-question-row">
                    {isCorrect ? (
                      <CheckCircle size={18} className="icon-c" />
                    ) : (
                      <XCircle size={18} className="icon-w" />
                    )}
                    <p style={{ color: "var(--foreground)" }}>
                      <strong>Q{qIdx + 1}:</strong>{" "}
                      {question.question_text ||
                        question.question ||
                        question.text}
                    </p>
                  </div>
                  <div className="review-answers-row">
                    <p style={{ color: "var(--muted-foreground)" }}>
                      Your Answer:{" "}
                      <span
                        style={{ color: isCorrect ? "#16a34a" : "#dc2626" }}
                      >
                        {studentAnsText}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="correct-text">
                        Correct Answer: <span>{correctAnsText}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="result-actions">
            <button onClick={() => navigate(-1)} className="finish-btn">
              <CheckCircle size={18} /> Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizPage;
