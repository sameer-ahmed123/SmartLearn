import { SignupForm } from "@/components/Auth/signup-form";

export default function SignupPage() {
  return (
    <div className="main-wrapper">
      <div className="auth-card">
        <div className="form-header">
          <span className="brand-logo">🎓</span>
          <h2>SmartLearn</h2>
          <p>Start your learning journey today</p>
        </div>
        <SignupForm />
        <div className="form-footer">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}