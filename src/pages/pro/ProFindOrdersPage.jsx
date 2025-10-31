// src/pages/pro/ProFindOrdersPage.jsx
import React from "react";
import Button from "../../shared/ui/Button/Button";
import { ordersApi } from "../../entities/orders";
import { offerApi } from "../../entities/offer/api";
import "./ProFindOrdersPage.css";

export default function ProFindOrdersPage() {
  const [myWorks, setMyWorks] = React.useState([]);   // [{id,name}]
  const [myLoading, setMyLoading] = React.useState(false);

  const [selectedWorkId, setSelectedWorkId] = React.useState(""); // одна моя робота
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [respondingId, setRespondingId] = React.useState(null);

  // Завантажити "мої роботи" з офферів
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMyLoading(true);
        const raw = await offerApi.getMyOffers();
        const list = Array.isArray(raw?.data ?? raw) ? (raw?.data ?? raw) : [];
        const m = new Map();
        for (const ofr of list) {
          const id = Number(ofr.workId ?? ofr.WorkId);
          const name = ofr.workName ?? ofr.WorkName ?? "Робота";
          if (id && !m.has(id)) m.set(id, { id, name });
        }
        if (alive) setMyWorks([...m.values()]);
      } finally {
        if (alive) setMyLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Знайти по одній роботі або по всіх моїх
  const find = async () => {
    setErr("");
    setLoading(true);
    try {
      if (selectedWorkId) {
        const res = await ordersApi.findOpen({ workId: Number(selectedWorkId) });
        setItems(res);
      } else {
        // по всіх моїх роботах
        const ids = myWorks.map(w => w.id).filter(Boolean);
        if (ids.length === 0) { setItems([]); return; }
        const results = await Promise.allSettled(ids.map(id => ordersApi.findOpen({ workId: id })));
        const seen = new Set();
        const merged = [];
        for (const r of results) {
          if (r.status === "fulfilled" && Array.isArray(r.value)) {
            for (const o of r.value) {
              if (!seen.has(o.id)) { seen.add(o.id); merged.push(o); }
            }
          }
        }
        merged.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItems(merged);
      }
    } catch {
      setErr("Не вдалося завантажити відкриті замовлення");
    } finally {
      setLoading(false);
    }
  };

  // Перший показ: якщо є мої роботи — шукаємо по всіх
  React.useEffect(() => {
    if (!myLoading && myWorks.length > 0) find();
  }, [myLoading]); // eslint-disable-line

  const respond = async (id) => {
    try {
      setRespondingId(id);
      await ordersApi.accept(id);
      await find(); // оновити список
    } catch {
      alert("Не вдалося прийняти замовлення");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <section className="pro-find">
      <div className="pro-find__filters">
        <Button
          variant="outline"
          onClick={() => { setSelectedWorkId(""); find(); }}
          disabled={myLoading || myWorks.length === 0}
        >
          {myLoading ? "Мої роботи…" : `Мої роботи${myWorks.length ? ` (${myWorks.length})` : ""}`}
        </Button>

        {myWorks.length > 0 && (
          <select
            className="cw-select"
            value={selectedWorkId}
            onChange={(e) => setSelectedWorkId(e.target.value)}
          >
            <option value="">— одна моя робота —</option>
            {myWorks.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        )}

        <Button onClick={find} disabled={myLoading || (myWorks.length === 0 && !selectedWorkId)}>
          Знайти
        </Button>
      </div>

      {loading && <div>Завантаження…</div>}
      {err && <div className="error">{err}</div>}
      {!loading && !err && items.length === 0 && (
        <div className="muted">Немає відкритих замовлень.</div>
      )}

      <br/>
      <ul className="pro-find__list">
        {items.map(o => (
          <li key={o.id} className="pro-find__item">
            <div className="pro-find__top">
              <div className="pro-find__title">{o.workName}</div>
              <div className="pro-find__price"><b>{o.price}</b> ₴</div>
            </div>
            <div className="pro-find__meta">
              <span>Замовник: {o.customerName || "—"}</span>
              <span>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</span>
            </div>
            {o.description && <div className="pro-find__desc">{o.description}</div>}
            <div className="pro-find__actions">
              <Button size="sm" onClick={() => respond(o.id)} disabled={respondingId === o.id}>
                {respondingId === o.id ? "Надсилаємо…" : "Відгукнутися"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
