// src/components/UI/Input/Input.tsx

import React from 'react';
import styles from './Input.module.css';

// Define the types for the component's props
interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  name: string; // Added 'name' for form handling, a key TS best practice
}

const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  name
}) => {
  const inputId = `input-${name}`;

  return (
    <div className={styles.control}>
      <label htmlFor={inputId} className={styles.label}>{label}</label>
      <input
        className={styles.input}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default Input;