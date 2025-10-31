import React from "react";
import "./SearchBar.css";
import { Button } from "../../shared/ui/Button";

/**
 * Універсальний компонент пошуку.
 * <SearchBar value={value} onChange={setValue} onSubmit={(v)=>...} />
 */
export default function SearchBar({
  value = "",
  onChange = () => {},
  onSubmit,                 // (value) => void
  placeholder = "Що треба зробити?",
  autoFocus = false,
  disabled = false,
  className = "",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form
      className={`search-form ${className}`.trim()}
      role="search"
      aria-label="Пошук"
      onSubmit={handleSubmit}
    >
      <input
        type="search"                 // семантика + системная кнопка очистки
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={placeholder}
        autoComplete="off"
        inputMode="search"
      />

      <Button
        type="submit"
        variant="primary"
        className="search-submit"
        disabled={disabled}
      >
        <span className="icon-left" aria-hidden="true">
          🔍
        </span>
        Знайти фахівця
      </Button>

    </form>
  );
}
