import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard"; // Naya Dashboard import karein
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
const App: React.FC = () => {
  const { user } = useAuthStore();
  const role = useAuthStore((s) => s.role);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<DashboardLayout userRole={role} />}>
          {/* PUBLIC ROUTES */}
          {/* Agar user login hai to '/' par jane se wo Dashboard par redirect ho jaye */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />

          {/* PROTECTED DASHBOARD (Dono roles ke liye) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* STUDENT SPECIFIC ROUTES */}
          <Route element={<ProtectedRoute allowedRole={["student"]} />}>
            <Route
              path="/student/dashboard"
              element={<DummyStudentDashboard />}
            />
          </Route>

          {/* TEACHER SPECIFIC ROUTES */}
          <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
            <Route
              path="/teacher/dashboard"
              element={<TeacherDashboardPage />}
            />
            <Route
              path="/teacher/lecture/:id/review"
              element={<LectureReviewPage />}
            ></Route>
            <Route
              path="/teacher/course/:courseid"
              element={<TeacherCourseDetailPage />}
            />
          </Route>

          {/* ERROR ROUTES */}
          <Route
            path="/unauthorized"
            element={
              <div style={{ textAlign: "center", marginTop: "100px" }}>
                <h1>🚫 YOU ARE NOT ALLOWED</h1>
                <p>You have no permission to this page</p>
              </div>
            }
          />

          {/* DUMMY ROUTES */}

          <Route path="/assignments" element={<DummyAssignments />} />
          <Route path="/grades" element={<DummyGradebook />} />
          <Route path="/analytics" element={<DummyAnalytics />} />
          <Route path="/settings" element={<DummySettings />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
