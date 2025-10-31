import * as React from "react";
import { uploadAvatar } from "../../../entities/user/api";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "https://localhost:7004";

function resolveUrl(p) {
  if (!p) return "";
  if (/^https?:/i.test(p)) return p;
  return p.startsWith("/") ? `${API_BASE}${p}` : `${API_BASE}/${p}`;
}

export default function AvatarUploader({ user, setUser }) {
  const [upLoading, setUpLoading] = React.useState(false);
  const fileRef = React.useRef();
  const avatarSrc = resolveUrl(user?.avatarUrl);
  const displayName = user?.fullName || user?.userName || user?.email || "";
  const initials = React.useMemo(() => {
    const src = displayName;
    return src
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";
  }, [displayName]);

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Оберіть зображення"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Фото до 5 МБ"); return; }

    try {
      setUpLoading(true);
      await uploadAvatar(file);
      // рефетч з беку бажано, але якщо немає окремого ендпойнта — приймемо optimistic update:
      setUser((prev) => ({ ...prev, avatarUrl: `${prev?.avatarUrl || ""}?ts=${Date.now()}` }));
    } catch {
      alert("Не вдалося завантажити фото");
    } finally {
      setUpLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div  className="accp-left">
         <div className="accp-avatar" title={displayName}>
            {avatarSrc ? <img src={avatarSrc} alt="avatar"/> : <span className="accp-initials">{initials}</span>}
        </div>

        <button className="accp-avatar-btn accp-avatar-btn--below" onClick={onPickFile} disabled={upLoading}>
            {upLoading ? "Завантаження…" : "Змінити фото"}
        </button>

        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} hidden />
   </div>
  );
}
