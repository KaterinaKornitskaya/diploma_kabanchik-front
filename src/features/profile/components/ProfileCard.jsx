import * as React from "react";
import RoleBadge from "./RoleBadge";
import AvatarUploader from "./AvatarUploader";
import { Stars } from "../../../shared/ui/Stars/Stars";

export default function ProfileCard({
  user, setUser,
  rightActions,     // ReactNode (кнопки/лінки праворуч)
  extraLines,       // масив додаткових рядків [{key, value}]
  titleRight,       // ReactNode (праворуч від імені — бейдж/статуси)
  ratingAvg = 0,
  ratingCount = 0,
}) {
  if (!user) return null;
  const role = Array.isArray(user.userRoles) && user.userRoles.length ? user.userRoles[0] : "customer";
  const displayName = user.fullName || user.userName || user.email;

  return (
    <div className="accp-card">
      <div className="accp-left">
        <AvatarUploader user={user} setUser={setUser} />
      </div>

      <div className="accp-body">
        <div className="accp-title">
          <h2 className="accp-name">{displayName}</h2>
          {titleRight ?? <RoleBadge role={role} />}
        </div>

        {/* ⭐ блок рейтингу: показуємо ТІЛЬКИ коли є відгуки */}
        {(Number(ratingCount) > 0) && (
          <div className="accp-rating">
            <Stars value={Number(ratingAvg) || 0} showValue={false} />
            <span className="accp-rating-count">({ratingCount})</span>
          </div>
        )}

        <ul className="accp-lines">
          <li className="accp-line"><span className="accp-key">Email:</span><span className="accp-val">{user.email}</span></li>
          <li className="accp-line"><span className="accp-key">Телефон:</span><span className="accp-val">{user.phoneNumber || "—"}</span></li>
          <li className="accp-line"><span className="accp-key">Логін:</span><span className="accp-val">{user.userName}</span></li>
          {(extraLines || []).map((l, i) => (
            <li key={i} className="accp-line">
              <span className="accp-key">{l.key}</span>
              <span className="accp-val">{l.value}</span>
            </li>
          ))}
        </ul>

        <div className="accp-actions">
          {rightActions}
        </div>
      </div>
    </div>
  );
}
