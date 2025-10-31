import React from "react";
import "./Input.css";

export default function Input({ label, name, type="text", value, onChange, onBlur, placeholder, error }) {
  return (
    <div className="ui-field">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
      />
      {error && <div className="ui-error">{error}</div>}
    </div>
  );
}
