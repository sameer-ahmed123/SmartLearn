import React, { useState } from "react";
import "./Auth.css";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Icons for password toggle

type FormDataType = {
  full_name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
};

export function SignupForm() {
  const [formData, setFormData] = useState<FormDataType>({
    full_name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSignupErrorMessage = (data: any) => {
    if (data?.email?.[0]) return data.email[0];
    if (data?.password?.[0]) return data.password[0];
    if (data?.full_name?.[0]) return data.full_name[0];
    if (data?.role?.[0]) return data.role[0];
    if (data?.detail) return data.detail;

    return "Signup failed! Please check your details and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { full_name, email, role, password, confirmPassword } = formData;

    if (!full_name || !email || !role || !password || !confirmPassword) {
      return setError("All fields are required!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please provide a valid email format.");
    }

    if (password.length < 8) {
      return setError("Password should be at least 8 characters long.");
    }

    if (!/\d/.test(password)) {
      return setError("Password should contain at least one number.");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return setError(
        "Password should contain at least one special character.",
      );
    }

    if (password !== confirmPassword) {
      return setError("Password and Confirm Password must be the same.");
    }

    const registration_data = { email, password, full_name, role };

    try {
      await apiClient.post("/auth/register/", registration_data);
      const login_response = await apiClient.post("/auth/login/", {
        email,
        password,
      });
      const { user, access, refresh } = login_response.data;
      login(user, access, refresh);
      navigate("/");
    } catch (err: any) {
      setError(getSignupErrorMessage(err.response?.data));
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
        <label>Full Name</label>
        <input
          type="text"
          name="full_name"
          placeholder="Enter name"
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-field">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="email@example.com"
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-field">
        <label>Role</label>
        <select name="role" onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

      <div className="input-field">
        <label>Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
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
              alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="input-field">
        <label>Confirm Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="••••••••"
            onChange={handleChange}
            required
            style={{ paddingRight: "40px", width: "100%" }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              alignItems: "center",
            }}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className="submit-button">
        Create Account
      </button>
    </form>
  );
}
