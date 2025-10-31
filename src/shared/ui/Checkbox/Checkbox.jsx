import React from "react";
import "./Checkbox.css";

export default function Checkbox({ name, checked, onChange, onBlur, children, error }) {
  return (
    <div className="ui-checkbox">
      <label>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} onBlur={onBlur} />
        <span>{children}</span>
      </label>
      {error && <div className="ui-error">{error}</div>}
    </div>
  );
}
