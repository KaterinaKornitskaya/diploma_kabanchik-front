import React from "react";
import Button from "../../shared/ui/Button/Button";
import { ordersApi } from "../../entities/orders";
import "./ProFindOrdersPage.css";

const STATUS_LABELS = {
  Pending:    { label: "Очікує",     className: "badge--pending" },
  InProgress: { label: "В роботі",   className: "badge--inprogress" },
  Completed:  { label: "Виконано",   className: "badge--completed" },
  Cancelled:  { label: "Скасовано",  className: "badge--cancelled" },
};

export default function ProActiveOrdersPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  // const load = async () => {
  //   try {
  //     setLoading(true); setErr("");
  //     const res = await ordersApi.myAssigned();
  //     setItems(res);
  //   } catch {
  //     setErr("Не вдалося завантажити ваші замовлення");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ...
  const load = async () => {
    try {
      setLoading(true); setErr("");
      const res = await ordersApi.myAssigned();
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      setItems(raw.filter(o => o.status === "InProgress" || o.status === "Pending"));
    } catch { setErr("Не вдалося завантажити ваші замовлення"); }
    finally { setLoading(false); }
  };
// ...


  const complete = async (id) => {
    if (!window.confirm("Позначити як виконане?")) return;
    try {
      await ordersApi.complete(id); // без тіла
      await load();
    } catch {
      alert("Не вдалося завершити замовлення");
    }
  };

  React.useEffect(() => { load(); }, []);

  if (loading) return <div>Завантаження…</div>;
  if (err) return <div className="error">{err}</div>;
  if (items.length === 0) return <div className="muted">У вас немає активних замовлень.</div>;

  return (
    <ul className="pro-find__list">
      {items.map(o => {
        const st = STATUS_LABELS[o.status] || { label: o.status, className: "" };
        const isActive = o.status === "InProgress";
        return (
          <li key={o.id} className="pro-find__item">
            <div className="pro-find__top">
              <div className="pro-find__title">{o.workName}</div>
              <div className="pro-find__price"><b>{o.price}</b> ₴</div>
            </div>

            <div className="pro-find__meta">
              <span>Замовник: {o.customerName}</span>
              <span>{new Date(o.createdAt).toLocaleString()}</span>
              <span className={`badge ${st.className}`}>{st.label}</span>
            </div>

            {o.description && <div className="pro-find__desc">{o.description}</div>}

            <div className="pro-find__actions">
              {isActive && (
                <Button size="sm" variant="outline" onClick={() => complete(o.id)}>
                  Позначити виконаним
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
