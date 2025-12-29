import React, { useState } from 'react';
import './Auth.css';
import apiClient from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState(''); // Error state add ki

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Purana error clear karein

    const { email, password } = credentials;

    // 1. Fields empty check
    if (!email || !password) {
      return setError("Email and Password are required!");
    }

    // 2. Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email address.");
    }

    try {
      const res = await apiClient.post('/auth/login/', credentials);
      const { user, access, refresh } = res.data;
      login(user, access, refresh);
      navigate("/");
    } catch (err: any) {
      // Alert ki jagah UI par error dikhayein
      setError("Invalid Email or Password. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Error Message UI par dikhane ke liye box */}
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
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="submit-button">Login Now</button>
    </form>
  );
}