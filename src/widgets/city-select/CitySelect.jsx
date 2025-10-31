import React from "react";
import { api } from "../../shared/api";
import "./CitySelect.css";

const DEBOUNCE = 300;

export default function CitySelect({ value, onChange, label = "Місто" }) {
  const [q, setQ] = React.useState(value?.name || "");
  const [items, setItems] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const inputRef = React.useRef(null);
  const boxRef = React.useRef(null);
  const timerRef = React.useRef(null);

  // закрити дропдаун при кліку поза
  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // синхронізувати зовнішнє value -> інпут
  React.useEffect(() => {
    if (value?.name && value?.id) setQ(value.name);
  }, [value?.id, value?.name]);

  // дебаунсований пошук міст
  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // якщо ввели рівно назву вибраного — не шукати
    if (value?.name && q.trim() === value.name) {
      setItems([]);
      setOpen(false);
      setErr("");
      return;
    }

    if (!q.trim()) {
      setItems([]);
      setOpen(false);
      setErr("");
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setErr("");
        // бек підтримує і q, і query
        const res = await api(`/api/City/search?q=${encodeURIComponent(q)}&limit=20`);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setItems(list);
        setOpen(true);
        setActive(list.length ? 0 : -1);
      } catch (e) {
        setItems([]);
        setOpen(true); // показати “нема результатів/помилка”
        setActive(-1);
        setErr("Не вдалося завантажити список міст");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const choose = (item) => {
    setQ(item.name);
    setOpen(false);
    setActive(-1);
    onChange?.({ id: item.id, name: item.name, region: item.region ?? "" });
    // зняти фокус, щоб не “залипав” курсор у полі
    setTimeout(() => inputRef.current?.blur(), 0);
  };

  const clear = () => {
    setQ("");
    setItems([]);
    setOpen(false);
    setActive(-1);
    onChange?.(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && items[active]) {
        e.preventDefault();
        choose(items[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      // дати можливість піти далі по формі
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="citysel" ref={boxRef}>
      <label className="citysel__label">{label}</label>
      <div className="citysel__inputwrap">
        <input
          ref={inputRef}
          className="citysel__input"
          placeholder="Почніть вводити назву міста…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            // при ручній правці розв’язуємо вибір
            if (value) onChange?.(null);
          }}
          onFocus={() => q.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
        {value && (
          <button type="button" className="citysel__clear" onClick={clear} aria-label="Очистити">
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="citysel__dropdown">
          {loading && <div className="citysel__hint">Завантаження…</div>}
          {!loading && err && <div className="citysel__hint citysel__hint--err">{err}</div>}
          {!loading && !err && items.length === 0 && (
            <div className="citysel__hint">Нічого не знайдено</div>
          )}
          {!loading && !err && items.length > 0 && (
            <ul className="citysel__list" role="listbox">
              {items.map((c, i) => (
                <li
                  key={c.id}
                  role="option"
                  aria-selected={active === i}
                  className={`citysel__item ${active === i ? "is-active" : ""}`}
                  onMouseDown={(e) => e.preventDefault()} // щоб не втратити фокус до click
                  onClick={() => choose(c)}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="citysel__name">{c.name}</span>
                  {c.region ? <span className="citysel__region">, {c.region}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {value && (
        <div className="citysel__chosen">
          Обрано: <strong>{value.name}</strong>
          {value.region ? <span className="citysel__region">, {value.region}</span> : null}
          <button className="citysel__chip-close" type="button" onClick={clear} aria-label="Прибрати">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
