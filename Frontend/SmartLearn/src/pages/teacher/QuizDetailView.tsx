import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  Users,
  CheckCircle,
  User,
  Loader2,
  Eye,
  ShieldCheck,
  Zap,
  ShieldAlert,
} from "lucide-react";
import apiClient from "@/api/apiClient";
import styles from "./QuizDetailView.module.css";
import GradingModal from "@/components/Assesment/GradingModal";

const QuizDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"questions" | "submissions">(
    "submissions",
  );

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/assessments/quiz/detail-by-lecture/${id}/`,
      );
      const quizId = response.data.id;

      if (quizId) {
        const detailResponse = await apiClient.get(
          `/assessments/quiz/${quizId}/`,
        );
        setQuizData(detailResponse.data);

        const subResponse = await apiClient.get(
          `/assessments/quiz/${quizId}/submissions/`,
        );
        
        setSubmissions(subResponse.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleOpenGradingModal = (submission: any) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleSaveOverride = (updatedSubmission: any) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updatedSubmission.id ? updatedSubmission : s)),
    );
  };

  // Helper to parse JSON quiz data safely
  const getQuestions = () => {
    let rawData = quizData?.quiz_data;
    if (!rawData) return [];

    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (e) {
        return [];
      }
    }

    if (Array.isArray(rawData)) return rawData;
    if (rawData.questions && Array.isArray(rawData.questions))
      return rawData.questions;

    return [];
  };

  const calculateAvgScore = (subs: any[]) => {
    if (subs.length === 0 || !quizData?.questions_count) return "0";
    const totalCorrectPercent = subs.reduce(
      (acc, curr) => acc + (parseFloat(curr.score) || 0),
      0,
    );
    const avgPercentage = totalCorrectPercent / subs.length;
    return ((avgPercentage / 100) * quizData.questions_count).toFixed(1);
  };

  const formatStudentScore = (score: any) => {
    const scoreVal = parseFloat(score) || 0;
    const totalQuestions = quizData?.questions_count || 0;
    // Scores are stored as percentages in backend (e.g. 20.0 for 1/5)
    const correctCount = Math.round((scoreVal / 100) * totalQuestions);
    return `${correctCount} / ${totalQuestions}`;
  };

  const cardStyle = {
    backgroundColor: "var(--card, #ffffff)",
    color: "var(--foreground, #1e293b)",
    borderColor: "var(--border, #e2e8f0)",
  };

  if (loading)
    return (
      <div className={styles.loading}>
        <Loader2 size={40} className="animate-spin" />
        <p>Loading Quiz Analytics...</p>
      </div>
    );

  if (!quizData)
    return <div className={styles.error}>Quiz not found for this lecture.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backBtn}
          style={cardStyle}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className={styles.titleInfo}>
          <h1 style={{ color: "var(--foreground)" }}>
            {quizData.lecture_title || "Quiz Details"}
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            {quizData.course_name} •{" "}
            <span className={styles.statusText}>{quizData.status}</span>
          </p>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard} style={cardStyle}>
          <HelpCircle className={styles.iconQ} />
          <div>
            <span style={{ color: "var(--muted-foreground)" }}>Questions</span>
            <h3 style={{ color: "var(--foreground)" }}>
              {quizData.questions_count || 0}
            </h3>
          </div>
        </div>
        <div className={styles.statCard} style={cardStyle}>
          <Users className={styles.iconU} />
          <div>
            <span style={{ color: "var(--muted-foreground)" }}>Attempts</span>
            <h3 style={{ color: "var(--foreground)" }}>{submissions.length}</h3>
          </div>
        </div>
        <div className={styles.statCard} style={cardStyle}>
          <CheckCircle className={styles.iconS} />
          <div>
            <span style={{ color: "var(--muted-foreground)" }}>Avg. Score</span>
            <h3 style={{ color: "var(--foreground)" }}>
              {calculateAvgScore(submissions)} / {quizData.questions_count}
            </h3>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === "submissions" ? styles.activeTab : ""}
          onClick={() => setActiveTab("submissions")}
        >
          Student Submissions
        </button>
        <button
          className={activeTab === "questions" ? styles.activeTab : ""}
          onClick={() => setActiveTab("questions")}
        >
          Quiz Questions
        </button>
      </div>

      <div className={styles.contentArea}>
        {activeTab === "submissions" ? (
          <div className={styles.submissionsTable} style={cardStyle}>
            {submissions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Date Submitted</th>
                    <th>Score</th>
                    <th>Grading Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td className={styles.userName}>
                        <div className={styles.avatar}>
                          <User size={14} />
                        </div>
                        <span>{sub.user_name || "Unknown Student"}</span>
                      </td>
                      <td>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                      <td className={styles.scoreCell}>
                        {formatStudentScore(sub.score)}
                      </td>
                      <td>
                        {/* MERGED LOGIC: Flagged > Overridden > Default */}
                        {sub.is_flagged ? (
                          <span className={styles.statusFlagged}>
                            <ShieldAlert size={12} /> Terminated
                          </span>
                        ) : sub.is_overridden ? (
                          <span className={styles.statusVerified}>
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : (
                          <span className={styles.statusAuto}>
                            <Zap size={12} /> AI Graded
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className={styles.reviewBtn}
                          onClick={() => handleOpenGradingModal(sub)}
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>No submissions found.</div>
            )}
          </div>
        ) : (
          <div className={styles.questionsList}>
            {getQuestions().map((q: any, idx: number) => (
              <div key={idx} className={styles.questionCard} style={cardStyle}>
                <h4 style={{ color: "var(--foreground)" }}>
                  {/* Priority: question_text to match your AI schema */}Q
                  {idx + 1}:{" "}
                  {q.question_text ||
                    q.question ||
                    q.text ||
                    "Question Content Missing"}
                </h4>
                <div className={styles.optionsGrid}>
                  {q.options?.map((opt: any, oIdx: number) => {
                    // Match correct answer by correct_index from your AI schema
                    const isCorrect =
                      q.correct_index === oIdx ||
                      q.answer === (opt.text || opt);

                    return (
                      <div
                        key={oIdx}
                        className={`${styles.option} ${isCorrect ? styles.correct : ""}`}
                        style={{ borderColor: "var(--border)" }}
                      >
                        {typeof opt === "string" ? opt : opt.text || opt.option}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedSubmission && (
        <GradingModal
          submission={selectedSubmission}
          totalMarks={quizData.questions_count}
          type="quiz"
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOverride}
        />
      )}
    </div>
  );
};

export default QuizDetailView;
