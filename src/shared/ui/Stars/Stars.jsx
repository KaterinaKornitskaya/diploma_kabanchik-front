// src/shared/ui/Stars/Stars.jsx
import React from "react";
import "./Stars.css";

/**
 * Универсальный компонент звёзд рейтинга
 * @param {number} value - рейтинг (0..5)
 * @param {number} size - размер шрифта (px)
 * @param {boolean} showValue - показать цифру рядом
 */
export function Stars({ value = 0, size = 16, showValue = true }) {
  const full = Math.round(value);
  const stars = "★".repeat(full) + "☆".repeat(5 - full);

  return (
    <span className="stars" style={{ fontSize: size }}>
      <span className="stars__icons">{stars}</span>
      {showValue && (
        <span className="stars__value">
          {" "}
          {value?.toFixed ? value.toFixed(1) : value}/5
        </span>
      )}
    </span>
  );
}
