import React, { useState } from 'react';
import './Auth.css';
import apiClient from '@/api/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigate, useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = credentials;

    // 1. Check if fields are empty
    if (!email || !password) {
      return alert("Email aur Password dono likhna zaroori hain!");
    }

    // Simple Email Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return alert("lease provide email with correct format");
    }



    try {
      const res = await apiClient.post('/auth/login/', credentials);
      const { user, access, refresh } = res.data;
      login(user, access, refresh);
      navigate("/");
    } catch (err: any) {
      alert("Invalid Email or Password");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-field"><label>Email Address</label>
        <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
      </div>
      <div className="input-field"><label>Password</label>
        <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
      </div>
      <button type="submit" className="submit-button">Login Now</button>
    </form>
  );
}