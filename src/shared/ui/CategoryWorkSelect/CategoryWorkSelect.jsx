// src/shared/ui/CategoryWorkSelect/CategoryWorkSelect.jsx
import React from "react";
import "./CategoryWorkSelect.css";
import { categoryApi } from "../../../entities/category";

export default function CategoryWorkSelect({ value, onChange, labelCat = "Категорія", labelWork = "Робота" }) {
  const [cats, setCats] = React.useState([]);      // [{id,name,works:[{id,name},...]}]
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  // нормалізуємо пропси
  const categoryId = String(value?.categoryId ?? "");
  const workId = String(value?.workId ?? "");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr("");
        const list = await categoryApi.getCategoriesWithWorks();
        if (!alive) return;

        // очікуємо масив об’єктів { id, name, works:[{id,name}] }
        const normalized = (list || []).map(c => ({
          id: Number(c.id ?? c.Id),
          name: c.name ?? c.Name ?? "Категорія",
          works: (c.works ?? c.Works ?? []).map(w => ({
            id: Number(w.id ?? w.Id),
            name: w.name ?? w.Name ?? "Робота",
          })),
        })).filter(c => c.works && c.works.length > 0); // ← залишаємо лише з роботами

        setCats(normalized);
      } catch (e) {
        setErr("Не вдалося завантажити категорії");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleCat = (e) => {
    const nextCatId = e.target.value;
    // якщо змінилась категорія — скидаємо роботу
    onChange?.({ categoryId: nextCatId, workId: "" });
  };

  const handleWork = (e) => {
    const nextWorkId = e.target.value;
    onChange?.({ categoryId, workId: nextWorkId });
  };

  const cat = cats.find(c => String(c.id) === categoryId);
  const works = cat?.works ?? [];

  return (
    <div className="cw-grid">
      <div className="cw-field">
        <label className="cw-label">{labelCat}</label>
        <select
          className="cw-select"
          value={categoryId}
          onChange={handleCat}
          disabled={loading || cats.length === 0}
        >
          <option value="">— оберіть категорію —</option>
          {cats.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="cw-field">
        <label className="cw-label">{labelWork}</label>
        <select
          className="cw-select"
          value={workId}
          onChange={handleWork}
          disabled={!categoryId || works.length === 0}
        >
          <option value="">
            {!categoryId ? "Спочатку оберіть категорію" :
             works.length === 0 ? "Немає робіт" : "— оберіть роботу —"}
          </option>
          {works.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {loading && <div className="cw-muted">Завантаження…</div>}
      {err && <div className="cw-error">{err}</div>}
    </div>
  );
}
