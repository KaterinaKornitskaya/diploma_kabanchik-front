import "./Button.css";

/**
 * Універсальна кнопка.
 * Варіанти:
 *  - variant: primary | outline | ghost
 *  - size: sm | md | lg
 *  - fullWidth: розтягнути на всю ширину
 *
 * Приклади:
 *  <Button onClick={...}>Зберегти</Button>
 *  <Button href="/tasks" variant="outline">До завдань</Button>
 */
export default function Button({
  href,          // '/tasks' або 'https://...'
  onClick,       // дія при кліку, якщо це кнопка
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
