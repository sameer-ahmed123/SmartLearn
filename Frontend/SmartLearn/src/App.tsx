import { Routes, Route } from "react-router-dom";
import { ModeToggle } from "./components/Layout/mode-toggle";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
const App: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<ModeToggle />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* AUTHENTICATED/PROTECTED ROUTES */}
      {/* <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
       */}
      {/* Add all other protected routes here */}
      {/* <Route path="/classroom/:id" element={<ProtectedRoute><VirtualClassroomPage /></ProtectedRoute>} /> */}
    </Routes>
  );
};

export default App;
