import { Routes, Route } from "react-router-dom";
import { ModeToggle } from "./components/Layout/mode-toggle";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LogoutButton from "./components/Auth/LogoutButton";
const App: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<><ModeToggle /> <LogoutButton/></>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes ====> only authenticated users Allowed */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashBoard"
          element={<h1>Protected H1 dashboard</h1>}
        ></Route>
      </Route>

      {/* Protected Route ====> only Authenticated Students Allowed */}
      <Route element={<ProtectedRoute allowedRole={["student"]} />}>
        <Route
          path="/allow_student"
          element={<h1>hello student</h1>}
        ></Route>
      </Route>

      {/* Protected Route ====> only Authenticated Teachers Allowed */}
      <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
        <Route
          path="/allow_teacher"
          element={<h1>hello teacher</h1>}
        ></Route>
      </Route>

      <Route path="/unauthorized" element={<h1>YOU ARE NOT ALLOWED IN THIS PAGE</h1>}></Route>
    </Routes>
  );
};

export default App;
