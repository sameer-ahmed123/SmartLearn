import React, { useState } from 'react';
import './Auth.css';
import apiClient from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

type FormDataType = {
  full_name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
};

export function SignupForm() {
  const [formData, setFormData] = useState<FormDataType>({
    full_name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState(''); // Error message dikhane ke liye state
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Naye submit par purana error clear karein

    const { full_name, email, role, password, confirmPassword } = formData;

    // 1. Empty Fields Check
    if (!full_name || !email || !role || !password || !confirmPassword) {
      return setError("All fields are required!");
    }

    // 2. Email validation (Rule #3)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please provide a valid email format.");
    }

    // 3. Must be at least 8 characters (Rule #1)
    if (password.length < 8) {
      return setError("Password should be at least 8 characters long.");
    }

    // 4. At least one number (Rule #5)
    if (!/\d/.test(password)) {
      return setError("Password should contain at least one number.");
    }

    // 5. Special characters check (Rule #4)
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return setError("Password should contain at least one special character.");
    }

    // 6. Same password and confirmation (Rule #2)
    if (password !== confirmPassword) {
      return setError("Password and Confirm Password must be the same.");
    }

    const registration_data = { email, password, full_name, role };

    try {
      await apiClient.post('/auth/register/', registration_data);
      const login_response = await apiClient.post('/auth/login/', { email, password });
      const { user, access, refresh } = login_response.data;
      login(user, access, refresh);
      navigate("/");
    } catch (err: any) {
      // Backend se aane wala error UI par dikhana
      setError(err.response?.data?.error || "Signup failed! Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Agar error ho toh yahan red text mein nazar aaye */}
      {error && (
        <div className="error-box" style={{
          color: '#ff4d4d',
          backgroundColor: '#ffe6e6',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          fontSize: '14px',
          textAlign: 'center',
          border: '1px solid #ffcccc'
        }}>
          {error}
        </div>
      )}

      <div className="input-field">
        <label>Full Name</label>
        <input type="text" name="full_name" placeholder="Enter name" onChange={handleChange} required />
      </div>

      <div className="input-field">
        <label>Email</label>
        <input type="email" name="email" placeholder="email@example.com" onChange={handleChange} required />
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
        <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
      </div>

      <div className="input-field">
        <label>Confirm Password</label>
        <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
      </div>

      <button type="submit" className="submit-button">Create Account</button>
    </form>
  );
}