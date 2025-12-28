import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard"; // Naya Dashboard import karein
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import TeacherDashboardPage from "./pages/teacher/DashboardPage";
import LectureReviewPage from "./pages/teacher/LectureReviewPage";
// import DashboardPage from "./pages/student/DashboardPage";
// import DashboardPage from "./pages/teacher/DashboardPage";
const App: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <>
      {/* Agar aap chahte hain ke toggle aur logout har jagah nazar aayein */}
      {/* <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          display: "flex",
          gap: "10px",
        }}
      >
        {user && <LogoutButton />}
      </div> */}

      <Routes>
        {/* PUBLIC ROUTES */}
        {/* Agar user login hai to '/' par jane se wo Dashboard par redirect ho jaye */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* PROTECTED DASHBOARD (Dono roles ke liye) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* STUDENT SPECIFIC ROUTES */}
        <Route element={<ProtectedRoute allowedRole={["student"]} />}>
          <Route path="/student/dashboard" element={<Dashboard />} />
        </Route>

        {/* TEACHER SPECIFIC ROUTES */}
        <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
          <Route
            path="/teacher/lecture/:id/review"
            element={<LectureReviewPage />}
          ></Route>
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

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
