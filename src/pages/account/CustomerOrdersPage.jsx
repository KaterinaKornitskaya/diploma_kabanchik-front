import React from "react";
import { ordersApi } from "../../entities/orders";
import Button from "../../shared/ui/Button/Button";
import "./CustomerOrdersPage.css";
import { useNavigate, Link } from "react-router-dom";

// маппинг статусов → метка + класс бейджа
const STATUS_LABELS = {
  Pending:    { label: "Очікує",    className: "badge--pending" },
  InProgress: { label: "В роботі",  className: "badge--inprogress" },
  Completed:  { label: "Виконано",  className: "badge--completed" },
  Cancelled:  { label: "Скасовано", className: "badge--cancelled" },
};

// вкладки
const TABS = [
  { key: "all",        title: "Усі" },
  { key: "Pending",    title: "Очікує" },
  { key: "InProgress", title: "В роботі" },
  { key: "Completed",  title: "Виконано" },
  { key: "Cancelled",  title: "Скасовано" },
];

export default function CustomerOrdersPage() {
  const navigate = useNavigate();

  const isPending   = (o) => String(o.status || "").toLowerCase().includes("pending");
  const isCancelled = (o) => String(o.status || "").toLowerCase().includes("cancel");
  const isCompleted = (s) => /completed|виконано/i.test(String(s || ""));

  // === дані ===
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  // === UI-состояния ===
  const [tab, setTab] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState("dateDesc");

  // === пагинация ===
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  // === модалка "редагувати" ===
  const [editItem, setEditItem] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ description: "", price: "" });
  const [saving, setSaving] = React.useState(false);

  // відкрити модалку
  const openEdit = (order) => {
    setEditItem(order);
    setEditForm({
      description: order.description || "",
      price: String(order.price ?? 0),
    });
  };

  // зберегти зміни
  const saveEdit = async () => {
    if (!editItem) return;

    const priceNum = Number(editForm.price || 0);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      alert("Ціна має бути невід’ємним числом");
      return;
    }
    if (!editForm.description.trim()) {
      alert("Опишіть завдання");
      return;
    }

    try {
      setSaving(true);
      await ordersApi.update(editItem.id, {
        description: editForm.description.trim(),
        price: priceNum,
      });

      // оновлюємо локально
      setItems(list =>
        list.map(o => o.id === editItem.id
          ? { ...o, description: editForm.description.trim(), price: priceNum }
          : o
        )
      );

      setEditItem(null);
    } catch {
      alert("Не вдалося оновити замовлення");
    } finally {
      setSaving(false);
    }
  };

  // === загрузка замовлень ===
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr("");
        const res = await ordersApi.my();
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (alive) setItems(list);
      } catch {
        if (alive) setErr("Не вдалося завантажити замовлення");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // === counters для вкладок ===
  const counters = React.useMemo(() => {
    const c = { all: items.length, Pending:0, InProgress:0, Completed:0, Cancelled:0 };
    for (const o of items) c[String(o.status)] = (c[String(o.status)] ?? 0) + 1;
    return c;
  }, [items]);

  // === фільтрація + пошук + сортування ===
  const filtered = React.useMemo(() => {
    let list = [...items];

    if (tab !== "all") list = list.filter(o => String(o.status) === tab);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(o => {
        const name = o.work?.name || o.workName || "";
        return (
          name.toLowerCase().includes(q) ||
          String(o.description || "").toLowerCase().includes(q) ||
          String(o.id).includes(q)
        );
      });
    }

    switch (sort) {
      case "dateAsc":   list.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)); break;
      case "dateDesc":  list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); break;
      case "priceAsc":  list.sort((a,b)=>(a.price??0)-(b.price??0)); break;
      case "priceDesc": list.sort((a,b)=>(b.price??0)-(a.price??0)); break;
      case "status":    list.sort((a,b)=>String(a.status).localeCompare(String(b.status))); break;
      default: break;
    }
    return list;
  }, [items, tab, query, sort]);

  React.useEffect(() => { setPage(1); }, [tab, query, sort, pageSize]);

  // === пагинация ===
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, pages);
  const start = (clampedPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const cancelOrder = async (id) => {
    if (!window.confirm("Скасувати це замовлення?")) return;
    try {
      await ordersApi.cancel(id);
      // не видаляємо зі списку — міняємо статус на Cancelled
      setItems(list => list.map(o => o.id === id ? { ...o, status: "Cancelled" } : o));
    } catch {
      alert("Не вдалося скасувати");
    }
  };

  const restoreOrder = async (id) => {
    try {
      await ordersApi.restore(id);
      setItems(list => list.map(o => o.id === id ? { ...o, status: "Pending", completedAt: null } : o));
    } catch {
      alert("Не вдалося відновити");
    }
  };

  return (
    <div className="acc container">
      <div className="acc__head">
        <h1>Мої замовлення</h1>

        {/* пошук + сортування */}
        <div className="acc__controls">
          <input
            className="acc__search"
            placeholder="Пошук за описом або роботою…"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
          <div className="acc__sort">
            <label>Сортувати:</label>
            <select value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option value="dateDesc">Новіші спочатку</option>
              <option value="dateAsc">Старіші спочатку</option>
              <option value="priceDesc">Ціна: від більшої</option>
              <option value="priceAsc">Ціна: від меншої</option>
              <option value="status">За статусом</option>
            </select>
          </div>
        </div>
      </div>

      {/* вкладки */}
      <div className="tabs tabs--line acc__tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.title}
            <span className="tab__count">{counters[t.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {err && <div className="acc__error">{err}</div>}
      {loading && <div className="acc__muted">Завантаження…</div>}

      {!loading && filtered.length === 0 && (
        <div className="acc__empty">Нічого не знайдено за поточними фільтрами.</div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <ul className="acc__list">
            {pageItems.map((o) => {
              const st = STATUS_LABELS[o.status] || { label:o.status, className:"" };
              const workName = o.work?.name || o.workName || "Робота";

              return (
                <li key={o.id} className="acc__item">
                  <div className="acc__row acc__row--top">
                    <span className="acc__date">від {new Date(o.createdAt).toLocaleString()}</span>
                    <div className="acc__top-right">
                      <b>{(o.price ?? 0).toLocaleString()} ₴</b>
                      <span className={`badge ${st.className}`}>{st.label}</span>
                    </div>
                  </div>

                  <div className="acc__row">
                    <span><b>Замовлення:</b> {workName}</span>
                  </div>

                  {o.description && <div className="acc__row">{o.description}</div>}

                  <div className="acc__row">
                    {o.specialistName ? (
                      o.specialistId ? (
                        <span>
                          <b>Виконавець:</b>{" "}
                          <Link to={`/pros/${o.specialistId}`}>{o.specialistName}</Link>
                        </span>
                      ) : (
                        <span><b>Виконавець:</b> {o.specialistName}</span>
                      )
                    ) : (
                      <span className="acc__muted">Ще не призначено</span>
                    )}
                  </div>

                  {/* Блок навигации: Деталі + Відгук (для виконаних) */}
                  <div className="acc__actions" style={{gap:8, flexWrap:"wrap"}}>
                    <Link className="accp-btn accp-btn--ghost" to={`/account/orders/${o.id}`}>
                      Деталі
                    </Link>
                    {isCompleted(o.status) && o.specialistId && (
                      <Link className="accp-btn" to={`/account/orders/${o.id}#feedback`}>
                        Залишити відгук
                      </Link>
                    )}
                  </div>

                  {(isPending(o) || isCancelled(o)) && (
                    <div className="acc__actions">
                      {isPending(o) && (
                        <Button size="sm" variant="outline" onClick={() => openEdit(o)}>
                          Змінити замовлення
                        </Button>
                      )}

                      {isCancelled(o) && (
                        <Button size="sm" variant="outline" onClick={() => restoreOrder(o.id)}>
                          Відновити
                        </Button>
                      )}

                      {isPending(o) && (
                        <Button size="sm" variant="danger" onClick={() => cancelOrder(o.id)}>
                          Скасувати
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* пагинація */}
          <div className="pager">
            <div className="pager__left">
              Показано {start + 1}-{Math.min(start + pageSize, total)} з {total}
            </div>

            <div className="pager__center">
              <button
                className="pager__btn"
                disabled={clampedPage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >‹</button>

              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pager__btn ${p === clampedPage ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              ))}

              <button
                className="pager__btn"
                disabled={clampedPage >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
              >›</button>
            </div>

            <div className="pager__right">
              <select
                value={pageSize}
                onChange={(e)=>setPageSize(Number(e.target.value))}
                className="pager__size"
              >
                <option value={5}>5 / стор.</option>
                <option value={10}>10 / стор.</option>
                <option value={20}>20 / стор.</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* === МОДАЛЬНЕ ВІКНО === */}
      {editItem && (
        <div className="modal">
          <div className="modal__box">
            <h3>Змінити замовлення</h3>

            <label className="modal__label">Опис</label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={(e)=>setEditForm(f=>({...f, description:e.target.value}))}
            />

            <label className="modal__label">Ціна, ₴</label>
            <input
              type="number"
              min="0"
              value={editForm.price}
              onChange={(e)=>setEditForm(f=>({...f, price:e.target.value}))}
            />

            <div className="modal__actions">
              <Button variant="ghost" onClick={()=>setEditItem(null)} disabled={saving}>
                Скасувати
              </Button>
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? "Зберігаємо…" : "Зберегти"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
