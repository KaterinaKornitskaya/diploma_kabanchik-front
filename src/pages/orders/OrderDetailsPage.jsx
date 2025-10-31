import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Button from "../../shared/ui/Button/Button";
import "./OrderDetailsPage.css";

import { http } from "../../api";
import { ordersApi } from "../../entities/orders";
import { feedbackApi } from "../../entities/feedback/api";

/** Человеческая метка и css-модификатор для статуса */
function statusInfo(st) {
  const s = (st || "").toString().toLowerCase();
  if (s.includes("completed")) return { label: "Виконано", mod: "completed" };
  if (s.includes("inprogress") || s.includes("in_progress")) return { label: "В роботі", mod: "inprogress" };
  if (s.includes("pending") || s.includes("new")) return { label: "Очікує", mod: "pending" };
  if (s.includes("cancel")) return { label: "Скасовано", mod: "cancelled" };
  return { label: st || "—", mod: "neutral" };
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  // feedback
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        let data = null;
        if (ordersApi?.get) {
          const res = await ordersApi.get(Number(id));
          data = res?.data ?? res ?? null;
        } else {
          const res = await http.get(`/api/Order/${id}`);
          data = res?.data ?? res ?? null;
        }
        if (alive) setOrder(data);
      } catch (e) {
        if (alive) setErr("Не вдалося завантажити замовлення");
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="container order-details"><div className="od-muted">Завантаження…</div></div>;
  if (err) return <div className="container order-details"><div className="od-error">{err}</div></div>;
  if (!order) return <div className="container order-details"><div className="od-muted">Замовлення не знайдено</div></div>;

  const idNum = order.id ?? order.Id;
  const workName =
    order.workName ?? order.WorkName ?? order.work?.name ?? order.Work?.Name ?? "Послуга";
  const desc = order.description ?? order.Description ?? "";
  const price = order.price ?? order.Price ?? 0;
  const specialistName =
    order.specialistName ?? order.SpecialistName ??
    order.specialist?.user?.fullName ?? order.Specialist?.User?.FullName ??
    order.specialist?.name ?? order.Specialist?.Name ?? null;

  const { label: statusLabel, mod: statusMod } = statusInfo(order.status ?? order.Status);

  const canLeaveFeedback =
    !!order && /completed/i.test(order?.status || "") && !done;

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!order) return;
    try {
      setSending(true);
      await feedbackApi.createForOrder({
        orderId: Number(idNum),
        rating: Number(rating),
        comment: comment?.trim() || null,
      });
      setDone(true);
      alert("Дякуємо! Відгук додано.");
    } catch (ex) {
      console.error(ex);
      alert("Не вдалося додати відгук.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container order-details">
      {/* Шапка */}
      <header className="od-head">
        <h1 className="od-title">Замовлення #{idNum}</h1>
        <span className={`od-badge od-badge--${statusMod}`}>{statusLabel}</span>
      </header>

      {/* Карточка деталей */}
      <section className="od-card" aria-labelledby="od-details-title">
        <h2 id="od-details-title" className="visually-hidden">Деталі замовлення</h2>
        <div className="od-row"><span className="od-key">Послуга</span><span className="od-val">{workName}</span></div>
        <div className="od-row"><span className="od-key">Опис</span><span className="od-val">{desc || "—"}</span></div>
        <div className="od-row"><span className="od-key">Бюджет</span><span className="od-val">{price} ₴</span></div>
        {specialistName && (
          <div className="od-row"><span className="od-key">Виконавець</span><span className="od-val">{specialistName}</span></div>
        )}
      </section>

      {/* Відгук */}
      {canLeaveFeedback ? (
        <form className="od-feedback" onSubmit={submitFeedback} noValidate>
          <h3>Залишити відгук</h3>

          <div className="stars-input" role="radiogroup" aria-label="Оцінка">
            {[1,2,3,4,5].map(v => (
              <label key={v} className={`star ${v <= rating ? "star--on" : ""}`}>
                <input
                  type="radio"
                  name="rating"
                  value={v}
                  checked={rating === v}
                  onChange={() => setRating(v)}
                />
                ★
              </label>
            ))}
          </div>

          <textarea
            className="od-textarea"
            rows={4}
            placeholder="Короткий коментар (необов'язково)…"
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
          />

          <div className="od-actions">
            <Button type="submit" disabled={sending}>
              {sending ? "Надсилаємо…" : "Надіслати відгук"}
            </Button>
            <Button type="button" variant="outline" onClick={()=>nav("/account/orders")}>
              До моїх замовлень
            </Button>
          </div>
        </form>
      ) : (
        <div className="od-actions od-actions--solo">
          <Button href="/account/orders" variant="outline">До моїх замовлень</Button>
        </div>
      )}
    </div>
  );
}
