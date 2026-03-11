import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import TeacherDashboardPage from "./pages/teacher/DashboardPage";
import StudentDashboardPage from "./pages/student/DashboardPage";
import LectureReviewPage from "./pages/teacher/LectureReviewPage";
import TeacherCourseDetailPage from "./pages/teacher/TeacherCourseDetailPage";
import DummyAnalytics from "./pages/dummy/DummyAnalytics";
import DummyStudentDashboard from "./pages/dummy/DummyStudentDashboard";
import DummySettings from "./pages/dummy/DummySettings";
import DummyGradebook from "./pages/dummy/DummyGradebook";
import DashboardLayout from "./Layout/DashboardLayout";
import TeacherLecturePage from "./pages/teacher/TeacherLecturePage";
import StudentLecturePage from "./pages/student/StudentLecturePage";
import TeacherQuiz from "./pages/teacher/TeacherQuiz";
import TeacherAssignment from "./pages/teacher/TeacherAssignment";
import StudentQuiz from "./pages/student/StudentQuiz";
import StudentAssignment from "./pages/student/StudentAssignment";
import TeacherGradebook from "./pages/teacher/TeacherGradebook";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import TeacherSetting from "./pages/teacher/TeacherSetting";
import StudentGradebook from "./pages/student/StudentGradebook";
import StudentAnalytics from "./pages/student/StudentAnalytics";
import StudentVirtual from "./pages/student/StudentVirtual";
import StudentSetting from "./pages/student/StudentSetting";
import SmartChat from './components/Chatbot/SmartChat';
import StudentCourseDetailPage from "./pages/student/StudentCourseDetailPage";
import StudentLectureReviewPage from "./pages/student/StudentLectureViewPage";
import StudentQuizPage from "./pages/student/StudentQuizPage";
import StudentAssignmentPage from "./pages/student/StudentAssignmentPage";
import AssignmentSubmission from "./pages/teacher/AssignmentSubmissions";
import QuizDetailView from "./pages/teacher/QuizDetailView";


// --- FIX: TypeScript interface for Google Translate ---
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const App: React.FC = () => {
  const { user } = useAuthStore();
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  // --- Logic to check if current route is for teacher ---
  const isTeacherPage = location.pathname.startsWith('/teacher');

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<DashboardLayout userRole={role} />}>
          {/* PUBLIC REDIRECT */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />

          {/* PROTECTED DASHBOARD */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* STUDENT ROUTES */}
          <Route element={<ProtectedRoute allowedRole={["student"]} />}>
            <Route
              path="/student/dashboard"
              element={<StudentDashboardPage />}
            />
            <Route
              path="/student/lecture"
              element={<StudentLecturePage />}
            />
            <Route
              path="/student/quiz"
              element={<StudentQuiz />}
            />
            <Route
              path="/student/assignments"
              element={<StudentAssignment />}
            />
            <Route
              path="/student/grades"
              element={<StudentGradebook />}
            />
            <Route
              path="/student/analytics"
              element={<StudentAnalytics />}
            />
            <Route
              path="/student/virtualroom"
              element={<StudentVirtual />}
            />
            <Route
              path="/student/settings"
              element={<StudentSetting />}
            />
            <Route
              path="/student/course/:courseid"
              element={<StudentCourseDetailPage />}
            />
            <Route
              path="/student/lecture/:id/review"
              element={<StudentLectureReviewPage />}
            />
            <Route
              path="/student/lecture/:id/quiz"
              element={<StudentQuizPage />}
            />
            <Route
              path="/student/lecture/:id/assignment"
              element={<StudentAssignmentPage />}
            />
            
          </Route>

          {/* TEACHER ROUTES */}
          <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
            <Route
              path="/teacher/dashboard"
              element={<TeacherDashboardPage />}
            />
            <Route
              path="/teacher/lecture"
              element={<TeacherLecturePage />}
            />
            <Route
              path="/teacher/quiz"
              element={<TeacherQuiz />}
            />
            <Route
              path="/teacher/assignments"
              element={<TeacherAssignment />}
            />
            <Route
              path="/teacher/grades"
              element={<TeacherGradebook />}
            />
            <Route
              path="/teacher/analytics"
              element={<TeacherAnalytics />}
            />
            <Route
              path="/teacher/settings"
              element={<TeacherSetting />}
            />
            <Route
              path="/teacher/lecture/:id/review"
              element={<LectureReviewPage />}
            />
            <Route
              path="/teacher/course/:courseid"
              element={<TeacherCourseDetailPage />}
            />
            <Route
              path="/teacher/lecture/:id/assignment"
              element={<AssignmentSubmission />}
            />
            <Route
              path="/teacher/lecture/:id/quiz"
              element={<QuizDetailView />}
            />
            
          </Route>

          {/* DUMMY & ERROR ROUTES */}
          
          <Route path="/grades" element={<DummyGradebook />} />
          <Route path="/analytics" element={<DummyAnalytics />} />
          <Route path="/settings" element={<DummySettings />} />

          <Route
            path="/unauthorized"
            element={
              <div style={{ textAlign: "center", marginTop: "100px" }}>
                <h1>🚫 YOU ARE NOT ALLOWED</h1>
                <p>You have no permission to this page</p>
              </div>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>

      {/* CHATBOT INTEGRATED HERE - Only shows on Teacher pages */}
      {isTeacherPage && <SmartChat />}
    </>
  );
};

export default App;