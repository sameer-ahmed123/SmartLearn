import React from 'react';
import styles from './Textarea.module.css';

interface TextareaProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  name: string;
  rows?: number; // Number of visible text lines
  required?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  name, 
  rows = 4, 
  required = false 
}) => {
  const textareaId = `textarea-${name}`;

  return (
    <div className={styles.control}>
      <label htmlFor={textareaId} className={styles.label}>{label}</label>
      <textarea
        className={styles.textarea}
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    </div>
  );
};

export default Textarea;