import React from "react";
import { ordersApi } from "../../entities/orders";

const statusLabel = (s) => {
  // на бекенді enum: Pending / InProgress / Completed / Cancelled
  const key = String(s || "").toLowerCase();
  if (key.includes("inprogress")) return "В роботі";
  if (key.includes("completed"))  return "Завершено";
  if (key.includes("cancel"))     return "Скасовано";
  return "Очікує";
};

export default function AccountOrders() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  const load = async () => {
    try {
      setLoading(true); setErr("");
      const list = await ordersApi.my();
      setItems(list);
    } catch {
      setErr("Не вдалося завантажити замовлення");
    } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm("Скасувати це замовлення?")) return;
    try {
      await ordersApi.cancel(id);
      await load();
    } catch {
      alert("Не вдалося скасувати");
    }
  };

  if (loading) return <div>Завантаження…</div>;
  if (err) return <div className="form-error">{err}</div>;
  if (items.length === 0) return <div className="muted">У вас ще немає замовлень.</div>;

  return (
    <div className="list">
      {items.map(o => {
        const canCancel = String(o.status).toLowerCase().includes("pending");
        return (
          <div key={o.id} className="card" style={{marginBottom:12}}>
            <div style={{display:"flex", justifyContent:"space-between", gap:8}}>
              <div>
                <div style={{fontWeight:600}}>
                  {o.work?.name || "Робота"}
                </div>
                <div className="muted">
                  від {new Date(o.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div><b>{(o.price ?? 0).toLocaleString()} ₴</b></div>
                <div className="badge">{statusLabel(o.status)}</div>
              </div>
            </div>

            {o.description && <div style={{marginTop:8}}>{o.description}</div>}

            {canCancel && (
              <div style={{marginTop:8}}>
                <button className="btn btn--ghost" onClick={() => cancel(o.id)}>
                  Скасувати
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
