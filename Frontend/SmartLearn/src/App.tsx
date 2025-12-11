import { Routes, Route,  } from 'react-router-dom';
import Header from './components/Layout/Header';
const App: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Header/> } />
      {/* <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} /> */}

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