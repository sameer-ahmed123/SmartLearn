import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import ProtectedRoute from "./components/Auth/ProtectedRoute";
import DashboardLayout from "./Layout/DashboardLayout";
import { useAuthStore } from "./store/useAuthStore";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const TeacherDashboardPage = lazy(() => import("./pages/teacher/DashboardPage"));
const StudentDashboardPage = lazy(() => import("./pages/student/DashboardPage"));

const LectureReviewPage = lazy(() => import("./pages/teacher/LectureReviewPage"));
const TeacherCourseDetailPage = lazy(() => import("./pages/teacher/TeacherCourseDetailPage"));

const DummyAnalytics = lazy(() => import("./pages/dummy/DummyAnalytics"));
const DummySettings = lazy(() => import("./pages/dummy/DummySettings"));
const DummyGradebook = lazy(() => import("./pages/dummy/DummyGradebook"));

const TeacherLecturePage = lazy(() => import("./pages/teacher/TeacherLecturePage"));
const StudentLecturePage = lazy(() => import("./pages/student/StudentLecturePage"));

const TeacherQuiz = lazy(() => import("./pages/teacher/TeacherQuiz"));
const TeacherAssignment = lazy(() => import("./pages/teacher/TeacherAssignment"));
const StudentQuiz = lazy(() => import("./pages/student/StudentQuiz"));
const StudentAssignment = lazy(() => import("./pages/student/StudentAssignment"));

const TeacherGradebook = lazy(() => import("./pages/teacher/TeacherGradebook"));
const TeacherAnalytics = lazy(() => import("./pages/teacher/TeacherAnalytics"));
const StudentGradebook = lazy(() => import("./pages/student/StudentGradebook"));
const StudentAnalytics = lazy(() => import("./pages/student/StudentAnalytics"));
const StudentVirtual = lazy(() => import("./pages/student/StudentVirtual"));

const SmartChat = lazy(() => import("./components/Chatbot/SmartChat"));

const StudentCourseDetailPage = lazy(() => import("./pages/student/StudentCourseDetailPage"));
const StudentLectureReviewPage = lazy(() => import("./pages/student/StudentLectureViewPage"));
const StudentQuizPage = lazy(() => import("./pages/student/StudentQuizPage"));
const StudentAssignmentPage = lazy(() => import("./pages/student/StudentAssignmentPage"));

const AssignmentSubmission = lazy(() => import("./pages/teacher/AssignmentSubmissions"));
const QuizDetailView = lazy(() => import("./pages/teacher/QuizDetailView"));
const StudentReportPage = lazy(() => import("./pages/teacher/StudentReportPage"));
const StudentVideoProgress = lazy(() => import("./pages/teacher/StudentVideoProgress"));

const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const PageLoader = () => {
  return (
    <div style={{ padding: "2rem", fontWeight: 700 }}>
      Loading...
    </div>
  );
};

const App: React.FC = () => {
  const { user } = useAuthStore();
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  const isTeacherPage = location.pathname.startsWith("/teacher");

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<DashboardLayout userRole={role} />}>
            <Route
              path="/"
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : role === "teacher" ? (
                  <Navigate to="/teacher/dashboard" replace />
                ) : (
                  <Navigate to="/student/dashboard" replace />
                )
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole={["student"]} />}>
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/student/lecture" element={<StudentLecturePage />} />
              <Route path="/student/quiz" element={<StudentQuiz />} />
              <Route path="/student/assignments" element={<StudentAssignment />} />
              <Route path="/student/grades" element={<StudentGradebook />} />
              <Route path="/student/analytics" element={<StudentAnalytics />} />
              <Route path="/student/virtualroom" element={<StudentVirtual />} />
              <Route path="/student/settings" element={<SettingsPage />} />
              <Route path="/student/course/:courseid" element={<StudentCourseDetailPage />} />
              <Route path="/student/lecture/:id/review" element={<StudentLectureReviewPage />} />
              <Route path="/student/lecture/:id/quiz" element={<StudentQuizPage />} />
              <Route path="/student/lecture/:id/assignment" element={<StudentAssignmentPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
              <Route path="/teacher/lecture" element={<TeacherLecturePage />} />
              <Route path="/teacher/quiz" element={<TeacherQuiz />} />
              <Route path="/teacher/assignments" element={<TeacherAssignment />} />
              <Route path="/teacher/grades" element={<TeacherGradebook />} />
              <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
              <Route path="/teacher/settings" element={<SettingsPage />} />
              <Route path="/teacher/lecture/:id/review" element={<LectureReviewPage />} />
              <Route path="/teacher/course/:courseid" element={<TeacherCourseDetailPage />} />
              <Route path="/teacher/lecture/:id/assignment" element={<AssignmentSubmission />} />
              <Route path="/teacher/lecture/:id/quiz" element={<QuizDetailView />} />
              <Route path="/teacher/student-report/:studentId/:courseId" element={<StudentReportPage />} />
              <Route path="/teacher/student-video-progress/:studentId/:courseId" element={<StudentVideoProgress />} />
            </Route>

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

            <Route path="*" element={<div>404</div>} />
          </Route>
        </Routes>

        {isTeacherPage && <SmartChat />}
      </Suspense>
    </>
  );
};

export default App;