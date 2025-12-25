import { LoginForm } from "@/components/Auth/login-form";

export default function LoginPage() {
  return (
    <div className="main-wrapper">
      <div className="auth-card">
        <div className="form-header">
          <span className="brand-logo">🎓</span>
          <h2>Welcome Back</h2>
          <p>Login to access your dashboard</p>
        </div>
        <LoginForm />
        <div className="form-footer">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
}