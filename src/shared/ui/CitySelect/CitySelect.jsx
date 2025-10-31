import React from "react";
import "./CitySelect.css";
import { http } from "../../../api";

export default function CitySelect({ value, onChange, label = "Місто" }) {
  const [q, setQ] = React.useState("");
  const [list, setList] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // дебаунс пошуку
  React.useEffect(() => {
    if (!q || q.length < 2) { setList([]); return; }
    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await http.get(`/api/City/search?query=${encodeURIComponent(q)}`);
        const items = res?.data ?? res?.items ?? res ?? [];
        setList(Array.isArray(items) ? items : []);
        setOpen(true);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const pick = (item) => {
    onChange?.(item); // {id, name, region?}
    setQ(item.name);
    setOpen(false);
  };

  return (
    <div className="citysel">
      <label className="citysel__label">{label}</label>
      <input
        className="citysel__input"
        placeholder="Почніть вводити місто…"
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => { if (list.length) setOpen(true); }}
      />
      {loading && <div className="citysel__hint">Завантаження…</div>}
      {open && list.length > 0 && (
        <ul className="citysel__dropdown">
          {list.map(c => (
            <li key={c.id} onMouseDown={() => pick(c)}>
              {c.name}{c.region ? `, ${c.region}` : ""}
            </li>
          ))}
        </ul>
      )}
      {value?.id && (
        <div className="citysel__picked">
          Обрано: {value.name}{value.region ? `, ${value.region}` : ""}
        </div>
      )}
    </div>
  );
}

// компонент вибору міста з автопідказкою