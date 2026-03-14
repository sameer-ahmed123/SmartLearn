import React, { useState } from "react";
import "./Auth.css";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Icon import kiya

export function LoginForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  
  // Password toggle ke liye state
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { email, password } = credentials;

    if (!email || !password) {
      return setError("Email and Password are required!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email address.");
    }

    try {
      const res = await apiClient.post("/auth/login/", credentials);
      const { user, access, refresh } = res.data;
      login(user, access, refresh);
      navigate("/dashboard");
    } catch {
      setError("Invalid Email or Password. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          className="error-box"
          style={{
            color: "#ff4d4d",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            fontSize: "14px",
            textAlign: "center",
            border: "1px solid #ffcccc",
          }}
        >
          {error}
        </div>
      )}

      <div className="input-field">
        <label>Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-field">
        <label>Password</label>
        {/* Eye icon ko adjust karne ke liye relative wrapper */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter password"
            onChange={handleChange}
            required
            style={{ paddingRight: "40px", width: "100%" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              display: "flex",
              alignItems: "center"
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className="submit-button">
        Login Now
      </button>
    </form>
  );
}