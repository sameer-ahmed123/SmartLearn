import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  allowedRole?: ("student" | "teacher")[];
}

const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { user, role, hydrated } = useAuthStore();
  if (!hydrated) {
    return null;
  }
  const isAuthenticated = !!user;
  if (!isAuthenticated) {
    return <Navigate to={"/login"} replace />;
  }

  if (allowedRole && role && !allowedRole.includes(role)) {
    return <Navigate to={"/unauthorized"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
