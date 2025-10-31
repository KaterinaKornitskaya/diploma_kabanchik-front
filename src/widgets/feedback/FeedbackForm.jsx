// src/widgets/feedback/FeedbackForm.jsx
import React from "react";
import { feedbackApi } from "../../entities/feedback/api";
import { Stars } from "../../shared/ui/Stars/Stars";
import Button from "../../shared/ui/Button/Button";

export default function FeedbackForm({ orderId, onSaved, onCancel }) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setErr("");
      await feedbackApi.create({ orderId, rating, comment: comment.trim() || null });
      onSaved?.();
    } catch (e2) {
      setErr("Не вдалося зберегти відгук");
      console.error(e2);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{minWidth:320}}>
      <div style={{marginBottom:8}}>Оцініть роботу</div>
      <Stars value={rating} onChange={setRating} size={28} readOnly={false} />
      <div style={{marginTop:10}}>
        <textarea
          rows={4}
          placeholder="Коментар (необов’язково)"
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          style={{width:"100%"}}
        />
      </div>
      {err && <div className="error" style={{marginTop:8}}>{err}</div>}
      <div style={{display:"flex", gap:8, marginTop:12, justifyContent:"flex-end"}}>
        <Button type="button" variant="ghost" onClick={onCancel}>Скасувати</Button>
        <Button type="submit" disabled={loading}>{loading ? "Зберігаємо…" : "Надіслати"}</Button>
      </div>
    </form>
  );
}
