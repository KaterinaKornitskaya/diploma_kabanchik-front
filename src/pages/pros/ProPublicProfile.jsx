// src/pages/pros/ProPublicProfile.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { offerApi } from "../../entities/offer/api";
import "./ProPublicProfile.css";
import Button from "../../shared/ui/Button/Button";
import { feedbackApi } from "../../entities/feedback/api";
import { Stars } from "../../shared/ui/Stars/Stars";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "";

const url = (p) => (!p ? "" : /^https?:/i.test(p) ? p : `${API_BASE}${p.startsWith("/") ? p : "/" + p}`);

// лёгкая санитизация описаний
function sanitizeDesc(html) {
  if (!html) return "";
  html = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\S+/gi, "");
  const ALLOWED = /^(b|i|u|strong|em|br|p|ul|ol|li)$/i;
  return html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (m, tag) => (ALLOWED.test(tag) ? m : ""));
}

export default function ProPublicProfile() {
  const { id } = useParams();
  const nav = useNavigate();

  // профиль + ошибки
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");

  // сводка рейтинга
  const [summary, setSummary] = React.useState(null);

  // отзывы (пагинация)
  const TAKE = 5;
  const [reviews, setReviews] = React.useState([]);
  const [skip, setSkip] = React.useState(0);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  // ✅ флаг, чтобы 1-я загрузка не срабатывала дважды в StrictMode
  const initialLoadDoneRef = React.useRef(false);

  // ====== загрузка публичного профиля ======
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        const res = await offerApi.getPublicSpecialist(id);
        const dto = res?.data ?? res ?? null;
        if (alive) setData(dto);
      } catch {
        if (alive) setErr("Не вдалося завантажити профіль фахівця");
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ====== сводка рейтинга ======
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await feedbackApi.summary(id);
        const s = res?.data ?? res ?? null;
        if (alive) setSummary(s);
      } catch {
        /* ок, без summary */
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ====== загрузка отзывов порциями ======
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const res = await feedbackApi.listForSpecialist(id, { skip, take: TAKE });
      const arr = res?.data?.items ?? [];
      setReviews((prev) => [...prev, ...arr]);
      setSkip((prev) => prev + arr.length);
      setHasMore(arr.length >= TAKE);
    } finally {
      setLoadingMore(false);
    }
  };

  // 🔄 сброс списка отзывов при смене специалиста
  React.useEffect(() => {
    setReviews([]);
    setSkip(0);
    setHasMore(true);
    // Сбрасываем флаг, чтобы первая порция загрузилась ровно один раз
    initialLoadDoneRef.current = false;
  }, [id]);

  // ▶️ первая порция — ровно один раз (без дублей)
  React.useEffect(() => {
    if (!initialLoadDoneRef.current && skip === 0 && reviews.length === 0) {
      initialLoadDoneRef.current = true;
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, reviews.length]);

  if (err) return <div className="container error">{err}</div>;
  if (!data) return <div className="container">Завантаження…</div>;

  // рейтинг: summary -> data (fallback)
  const ratingAvg = Number(summary?.avg ?? data?.ratingAvg ?? 0);
  const ratingCount = Number(summary?.count ?? data?.ratingCount ?? 0);

  return (
    <div className="container pros">
      {/* ======= ШАПКА ======= */}
      <div className="pros__header">
        <div className="pros__who">
          {data.avatarUrl && <img className="pros__ava pros__ava--lg" src={url(data.avatarUrl)} alt="" />}
          <div>
            <div className="pros__name pros__name--lg">{data.name}</div>

            {ratingCount > 0 && (
              <div className="pros__rate">
                <Stars value={ratingAvg} size={22} showValue={false} />
                <span className="pros__rate-count">({ratingCount})</span>
              </div>
            )}

            {data.email && (
              <div>
                <a href={`mailto:${data.email}`}>{data.email}</a>
              </div>
            )}
            {data.phone && (
              <div>
                <a href={`tel:${data.phone}`}>{data.phone}</a>
              </div>
            )}
          </div>
        </div>

        
      </div>

      {/* ======= УСЛУГИ (2 в ряд) ======= */}
      <h3 className="pros__section-title">Послуги фахівця</h3>

      <ul className="pros__list">
        {(data.offers || []).map((of) => (
          <li key={of.offerId} className="pros__item">
            <div className="pros__head">
              <div className="pros__work">{of.workName}</div>
              <div className="pros__price">{(of.price ?? 0).toLocaleString()} ₴</div>
            </div>

            {!!of.photoUrls?.length && (
              <div className="pros__photos">
                {of.photoUrls.slice(0, 6).map((src, i) => (
                  <img key={`${of.offerId}-${i}`} src={url(src)} alt="" />
                ))}
              </div>
            )}

            {of.description && (
              <div className="pros__desc" dangerouslySetInnerHTML={{ __html: sanitizeDesc(of.description) }} />
            )}

            {/* Кнопка заказа можно вернуть тут, если нужна */}
            {/* <div className="pros__actions">
              <Button variant="outline" onClick={() => nav(`/orders/new?workId=${of.workId}`)}>
                Створити замовлення для «{of.workName}»
              </Button>
            </div> */}
          </li>
        ))}
      </ul>

      {/* ======= ОТЗЫВЫ ======= */}
      <h3 className="pros__section-title">Відгуки</h3>

      {reviews.length === 0 ? (
        <div className="muted" style={{ marginBottom: 8 }}>
          Поки що немає відгуків
        </div>
      ) : (
        <ul className="pros__list1">
          {reviews.map((x) => (
            <li key={x.id} className="pros__item">
              <div className="pros__head">
                <div className="pros__work">
                  <Stars value={x.rating} size={16} />
                </div>
                <div className="muted">{new Date(x.createdAt).toLocaleDateString()}</div>
              </div>

              {x.workName && (
                <div className="muted" style={{ marginBottom: 6 }}>
                  Робота: {x.workName}
                </div>
              )}

              {x.comment && (
                <div className="pros__desc" style={{ whiteSpace: "pre-wrap" }}>
                  {x.comment}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Завантаження…" : "Показати ще"}
          </Button>
        </div>
      )}
    </div>
  );
}
