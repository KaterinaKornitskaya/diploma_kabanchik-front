// src/widgets/city-select/CityMultiSelect.jsx
import React from "react";
import "./CityMultiSelect.css";
import { searchCities, topCities } from "../../entities/city";

/**
 * Пропсы:
 * - value: number[]                  // список выбранных cityId
 * - onChange: (ids:number[])         // колбэк
 * - placeholder?: string
 * - options?: {id:number,name:string}[]   // опционально: заранее переданные города (например, все)
 * - labelsMap?: Record<number,string>     // опционально: id -> name (быстрый доступ)
 */
export default function CityMultiSelect({
  value = [],
  onChange,
  placeholder = "Почніть вводити назву міста…",
  options = [],
  labelsMap = {},
}) {
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [items, setItems] = React.useState([]); // [{id,name}]

  // нормализованный список выбранных id
  const selectedIds = React.useMemo(
    () => (Array.isArray(value) ? value.map((x) => Number(x)) : []),
    [value]
  );

  // быстрый геттер названия по id (labelsMap -> options -> items -> #id)
  const labelOf = React.useCallback(
    (id) => {
      const key = Number(id);
      if (labelsMap && labelsMap[key]) return labelsMap[key];
      const fromOptions = Array.isArray(options)
        ? options.find((o) => Number(o.id) === key)
        : null;
      if (fromOptions?.name) return String(fromOptions.name);
      const fromItems = Array.isArray(items)
        ? items.find((o) => Number(o.id) === key)
        : null;
      if (fromItems?.name) return String(fromItems.name);
      return `#${id}`;
    },
    [labelsMap, options, items]
  );

  // первичная загрузка — ТОП городов (если options не передали)
  React.useEffect(() => {
    if (Array.isArray(options) && options.length > 0) {
      setItems(options);
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const list = await topCities(12);
        if (alive) setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        if (alive) setErr("Не вдалося завантажити міста");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [options]);

  // поиск по вводу (с задержкой)
  React.useEffect(() => {
    if (!q || q.trim().length < 2) {
      // если строки поиска нет — показываем либо options, либо ранее загруженные items
      if (Array.isArray(options) && options.length > 0) setItems(options);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr("");
        const list = await searchCities(q.trim(), 20);
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        setErr("Помилка пошуку міст");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, options]);

  const add = (id) => {
    if (!onChange) return;
    const key = Number(id);
    if (selectedIds.includes(key)) return;
    onChange([...selectedIds, key]);
  };

  const remove = (id) => {
    if (!onChange) return;
    const key = Number(id);
    onChange(selectedIds.filter((x) => x !== key));
  };

  // какие пункты показываем в списке — результаты поиска или options/top
  const listToShow = React.useMemo(() => {
    // если идёт поиск (q >= 2), items уже содержит результаты — их и показываем
    // если не ищем: приоритет options (если есть), иначе items (topCities)
    if (!q || q.trim().length < 2) {
      return Array.isArray(options) && options.length > 0 ? options : items;
    }
    return items;
  }, [q, options, items]);

  return (
    <div className="cmulti">
      <input
        className="cmulti__input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
      />

      <div className="cmulti__list">
        {loading && <div className="cmulti__muted">Завантаження…</div>}
        {err && <div className="cmulti__err">{err}</div>}
        {!loading && !err && (!listToShow || listToShow.length === 0) && (
          <div className="cmulti__muted">Нічого не знайдено</div>
        )}

        {Array.isArray(listToShow) && listToShow.length > 0 && (
          <ul>
            {listToShow.map((c) => {
              const id = Number(c.id);
              const checked = selectedIds.includes(id);
              return (
                <li key={id}>
                  <label className="cmulti__row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => (e.target.checked ? add(id) : remove(id))}
                    />
                    <span>{labelOf(id)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="cmulti__tags">
          {selectedIds.map((id) => (
            <span key={id} className="cmulti__tag">
              {labelOf(id)}
              <button
                type="button"
                onClick={() => remove(id)}
                aria-label="remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
