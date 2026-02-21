import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import TeacherDashboardPage from "./pages/teacher/DashboardPage";
import LectureReviewPage from "./pages/teacher/LectureReviewPage";
import TeacherCourseDetailPage from "./pages/teacher/TeacherCourseDetailPage";
import DummyAnalytics from "./pages/dummy/DummyAnalytics";
import DummyStudentDashboard from "./pages/dummy/DummyStudentDashboard";
import DummySettings from "./pages/dummy/DummySettings";
import DummyAssignments from "./pages/dummy/DummyAssignments";
import DummyGradebook from "./pages/dummy/DummyGradebook";
import DashboardLayout from "./Layout/DashboardLayout";

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
              element={<DummyStudentDashboard />}
            />
          </Route>

          {/* TEACHER ROUTES */}
          <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
            <Route
              path="/teacher/dashboard"
              element={<TeacherDashboardPage />}
            />
            <Route
              path="/teacher/lecture/:id/review"
              element={<LectureReviewPage />}
            />
            <Route
              path="/teacher/course/:courseid"
              element={<TeacherCourseDetailPage />}
            />
          </Route>

          {/* DUMMY & ERROR ROUTES */}
          <Route path="/assignments" element={<DummyAssignments />} />
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
    </>
  );
};

export default App;