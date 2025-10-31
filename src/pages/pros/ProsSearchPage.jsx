// src/pages/pros/ProsSearchPage.jsx
import React from "react";
import "./ProsSearchPage.css";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { offerApi } from "../../entities/offer/api";
import Button from "../../shared/ui/Button/Button";
import { Stars } from "../../shared/ui/Stars/Stars";

// общий резолвер URLов картинок (локальные пути → абсолютные)
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE || "";
const resolveUrl = (p) => (!p ? "" : /^https?:/i.test(p) ? p : `${API_BASE}${p.startsWith("/") ? p : "/" + p}`);

// лёгкая «белая» санитизация для описаний
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

export default function ProsSearchPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [q, setQ] = React.useState(params.get("q") || "");
  const nav = useNavigate();

  const run = async (term) => {
    const query = (term || "").trim();
    setError("");
    setLoading(true);
    try {
      const res = await offerApi.searchPublic({ q: query });
      const data = res?.data ?? res ?? [];
      setItems(Array.isArray(data) ? data : []);
      // синхронизируем URL, чтобы можно было шарить ссылку
      setParams(query ? { q: query } : {});
    } catch (e) {
      setError("Не вдалося завантажити список фахівців");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // если пользователь попал с /pros?q=..., прогоняем поиск;
  // и если q в адресной строке изменился извне — тоже.
  React.useEffect(() => {
    const urlQ = params.get("q") || "";
    setQ(urlQ);
    run(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const submit = (e) => {
    e.preventDefault();
    run(q);
  };

  return (
    <div className="container pros">
      <h1>Знайти фахівця</h1>

      <form className="pros__search" onSubmit={submit}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Що треба зробити? (манікюр, ремонт крана…)"
        />
        <Button type="submit">Знайти</Button>
      </form>

      {loading && <div>Завантаження…</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="muted">Нічого не знайдено</div>
      )}

      <ul className="pros__list">
        {items.map((card) => (
          <li key={`${card.offerId}-${card.specialistId}`} className="pros__item">
            <div className="pros__head">
              <div className="pros__who">
                {card.specialistAvatar && (
                  <img className="pros__ava" src={resolveUrl(card.specialistAvatar)} alt="" />
                )}
                <div>
                  <div className="pros__name">
                    <Link to={`/pros/${card.specialistId}`}>{card.specialistName}</Link>
                  </div>
                  <div className="pros__work">{card.workName}</div>
                  {/* рейтинг (если есть данные) */}
                  {(card.ratingCount > 0) && (
                    <div className="pros__rate">
                      <Stars value={Number(card.ratingAvg || 0)} showValue={false} />
                      <span className="pros__rate-count">({card.ratingCount})</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="pros__price">{card.price} ₴</div>
            </div>

            {!!card.photoUrls?.length && (
              <div className="pros__photos">
                {card.photoUrls.slice(0, 4).map((src, i) => (
                  <img key={i} src={resolveUrl(src)} alt="" />
                ))}
              </div>
            )}

            {card.description && (
              <div
                className="pros__desc"
                dangerouslySetInnerHTML={{ __html: sanitizeDesc(card.description) }}
              />
            )}

            <div className="pros__actions">
              
             
              <Link className="accp-btn accp-btn--ghost" to={`/pros/${card.specialistId}`}>
                Профіль фахівця
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
