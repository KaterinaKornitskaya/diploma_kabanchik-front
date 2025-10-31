export default function RoleBadge({ role }) {
  const r = String(role || "").toLowerCase();
  return (
    <span className={`acc-badge acc-badge--${r}`}>
      {r === "specialist" ? "фахівець" : r === "admin" ? "адмін" : "customer"}
    </span>
  );
}
