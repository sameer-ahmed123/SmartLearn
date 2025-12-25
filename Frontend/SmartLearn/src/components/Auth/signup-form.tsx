import React, { useState } from 'react';
import axios from 'axios';
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

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return console.log("Passwords donot match!");
    }

    const registeration_data = {
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      role: formData.role
    }
    try {

      await apiClient.post('/auth/register/', registeration_data);

      const login_response = await apiClient.post('/auth/login/', { email: registeration_data.email, password: registeration_data.password })
      const { user, access, refresh } = login_response.data;
      login(user, access, refresh);
      navigate("/")
    } catch (err: any) {
      console.log(err.response?.data?.error || "Signup not successful!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-field"><label>Full Name</label>
        <input type="text" name="full_name" placeholder="Enter name" onChange={handleChange} required />
      </div>
      <div className="input-field"><label>Email</label>
        <input type="email" name="email" placeholder="email@example.com" onChange={handleChange} required />
      </div>
      <div className="input-field"><label>Role</label>
        <select name="role" onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>
      <div className="input-field"><label>Password</label>
        <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
      </div>
      <div className="input-field"><label>Confirm Password</label>
        <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
      </div>
      <button type="submit" className="submit-button">Create Account</button>
    </form>
  );
}