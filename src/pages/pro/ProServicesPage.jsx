// src/pages/pro/ProServicesPage.jsx
// ...всё как у тебя, меняем только отмеченные места 👇

import React from "react";
import "./ProServicesPage.css";

import Button from "../../shared/ui/Button/Button";
import Input from "../../shared/ui/Input/Input";
import CategoryWorkSelect from "../../shared/ui/CategoryWorkSelect/CategoryWorkSelect";
import { offerApi } from "../../entities/offer/api";
import RTE from "../../shared/ui/RTE/RTE";

import CityMultiSelect from "../../widgets/city-select/CityMultiSelect";
import "../../widgets/city-select/CityMultiSelect.css";
import { getAllCities } from "../../entities/city/api";

// ===== helpers (оставь как было у тебя, если уже вставляли) =====
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "";

function resolveUrl(p) {
  if (!p) return "";
  if (/^https?:/i.test(p)) return p;
  return `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`;
}
function sanitizeDesc(html) {
  if (!html) return "";
  html = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\S+/gi, "");
  const ALLOWED = /^(b|i|u|strong|em|br|p|ul|ol|li|h1|h2|h3)$/i;
  return html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (m, tag) =>
    ALLOWED.test(tag) ? m : ""
  );
}

// лёгкий лайтбокс (оставь, если уже есть)
function usePhotoViewer() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState([]); // string[]
  const [idx, setIdx] = React.useState(0);
  const show = (arr, i = 0) => { setItems(arr); setIdx(i); setOpen(true); };
  const close = () => setOpen(false);
  const next = () => setIdx((i) => (i + 1) % items.length);
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);
  const ui = !open ? null : (
    <div className="phv" onClick={close}>
      <img className="phv__img" src={items[idx]} alt="" onClick={(e)=>e.stopPropagation()} />
      {items.length > 1 && (
        <div className="phv__ctrls" onClick={(e)=>e.stopPropagation()}>
          <button className="phv__btn" onClick={prev}>‹</button>
          <button className="phv__btn" onClick={next}>›</button>
        </div>
      )}
      <button className="phv__btn phv__close" onClick={close}>✕</button>
    </div>
  );
  return { show, ui };
}

export default function ProServicesPage() {
  const [offers, setOffers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const viewer = usePhotoViewer();

  // модалка
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null); // ← хранит весь оффер для редактирования
  const [form, setForm] = React.useState({
    categoryId: "", workId: "", price: "", desc: "", cityIds: [],
  });

  // фото при создании
  const [photos, setPhotos] = React.useState([]);      // File[]
  const [previews, setPreviews] = React.useState([]);  // { id, url }[]

  // справочник городов
  const [allCities, setAllCities] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      try {
        const list = await getAllCities();
        setAllCities(
          Array.isArray(list)
            ? list.map(c => ({ id: Number(c.id ?? c.Id), name: (c.name ?? c.Name ?? "").toString() }))
            : []
        );
      } catch { setAllCities([]); }
    })();
  }, []);

  // быстрый доступ: id -> name (для тэгов и для мультиселекта)
  const cityNameById = React.useMemo(
    () => Object.fromEntries(allCities.map(c => [Number(c.id), c.name])),
    [allCities]
  );

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr("");
        const resp = await offerApi.getMyOffers();
        const data = resp?.data ?? resp ?? [];
        setOffers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("Не вдалося завантажити ваші послуги");
      } finally { setLoading(false); }
    })();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ categoryId: "", workId: "", price: "", desc: "", cityIds: [] });
    setPhotos([]); setPreviews([]); setModalOpen(true);
  };

  const openEdit = (of) => {
    setEditing(of); // ← сохраним весь оффер, чтобы видеть его фото
    setForm({
      categoryId: "",
      workId: String(of.workId),
      price: String(of.price ?? ""),
      desc: of.description ?? "",
      cityIds: of.cityIds ?? [],
    });
    setPhotos([]); setPreviews([]); setModalOpen(true);
  };

  const onPickPhotos = (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const next = [...photos, ...files];
    setPhotos(next);
    const newPreviews = files.map((f, i) => ({ id: `${Date.now()}_${i}`, url: URL.createObjectURL(f) }));
    setPreviews(p => [...p, ...newPreviews]);
    e.target.value = "";
  };
  const removePhotoIdx = (idx) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  // 👇 добавление фото в режиме редактирования
  const addMorePhotos = async (files) => {
    if (!editing || !files?.length) return;
    await offerApi.uploadOfferPhotos(editing.id, Array.from(files));
    // обновим локально карточку (добавим хвост к photoUrls)
    const newUrls = Array.from(files).map((_, i) => null); // реальный URL вернётся при refetch — сделаем refetch
    await refetchOffersAndPatchEditing();
  };

  // 👇 удаление одного фото (по имени файла в URL)
  const deletePhoto = async (fileUrl) => {
    if (!editing) return;
    const fileName = (fileUrl || "").split("/").pop(); // last segment
    if (!fileName) return;
    await offerApi.deleteOfferPhoto(editing.id, fileName).catch(()=>{});
    await refetchOffersAndPatchEditing();
  };

  const refetchOffersAndPatchEditing = async () => {
    const resp = await offerApi.getMyOffers();
    const data = resp?.data ?? resp ?? [];
    setOffers(Array.isArray(data) ? data : []);
    if (editing) {
      const fresh = Array.isArray(data) ? data.find(x => x.id === editing.id) : null;
      if (fresh) setEditing(fresh);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const resp = await offerApi.updateOffer(editing.id, {
          price: Number(form.price || 0),
          description: form.desc || "",
          plannedDuration: null,
          cityIds: form.cityIds || [],
        });
        const updated = resp?.data ?? resp;
        setOffers(list => list.map(o => o.id === editing.id ? updated : o));
      } else {
        const resp = await offerApi.createOffer({
          workId: Number(form.workId),
          price: Number(form.price || 0),
          description: form.desc || "",
          plannedDuration: null,
          cityIds: form.cityIds || [],
        });
        const created = resp?.data ?? null;
        if (created) {
          if (photos.length > 0 && offerApi.uploadOfferPhotos) {
            await offerApi.uploadOfferPhotos(created.id, photos);
          }
          await refetchOffersAndPatchEditing();
        }
      }
      setModalOpen(false);
    } catch (e2) {
      console.error(e2);
      alert("Помилка збереження. Деталі в консолі.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Видалити послугу?")) return;
    try {
      await offerApi.deleteOffer(id);
      setOffers(list => list.filter(o => o.id !== id));
    } catch (e) {
      console.error(e);
      alert("Не вдалося видалити");
    }
  };

  return (
    <div className="pro-wrap container">
      <h1>Кабінет фахівця</h1>

      <div className="pro-actions">
        <Button onClick={openCreate}>Додати послугу</Button>
      </div>

      {loading && <div>Завантаження…</div>}
      {err && <div className="error">{err}</div>}
      {!loading && !err && offers.length === 0 && <div className="muted">Поки немає жодної послуги</div>}

      {offers.length > 0 && (
        <ul className="offer-list">
          {offers.map((of) => (
            <li key={of.id} className="offer-item">
              <div className="offer-main">
                <div className="offer-title">{of.workName}</div>
                <div className="offer-price">{of.price} ₴</div>
              </div>

              {Array.isArray(of.photoUrls) && of.photoUrls.length > 0 && (
                <div className="offer-photos">
                  {of.photoUrls.slice(0, 8).map((src, i) => {
                    const url = resolveUrl(src);
                    return (
                      <img
                        key={i}
                        src={url}
                        alt={`photo-${i}`}
                        className="offer-photo"
                        onClick={() => viewer.show(of.photoUrls.map(resolveUrl), i)}
                        onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                      />
                    );
                  })}
                </div>
              )}

              {of.description && (
                <div
                  className="offer-desc"
                  dangerouslySetInnerHTML={{ __html: sanitizeDesc(of.description) }}
                />
              )}

              {Array.isArray(of.cityIds) && of.cityIds.length > 0 && (
                <div className="city-tags" style={{ marginTop: 6 }}>
                  {of.cityIds.map((id) => (
                    <span key={id} className="city-tag">
                      {cityNameById[id] || `Місто #${id}`}
                    </span>
                  ))}
                </div>
              )}

              <div className="offer-actions">
                <Button size="sm" variant="outline" onClick={() => openEdit(of)}>Редагувати</Button>
                <Button size="sm" variant="danger" onClick={() => remove(of.id)}>Видалити</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewer.ui}

      {modalOpen && (
        <div className="modal">
          <form className="modal-box" onSubmit={submit}>
            <h3>{editing ? "Редагування послуги" : "Нова послуга"}</h3>

            {!editing && (
              <CategoryWorkSelect
                value={{ categoryId: form.categoryId, workId: form.workId }}
                onChange={(next) => setForm((s) => ({ ...s, ...next }))}
                labelCat="Категорія"
                labelWork="Підкатегорія"
              />
            )}

            <label className="lbl">Міста обслуговування</label>
            {/* ⬇️ передаём опции/маппер, чтобы в чипсах были ИМЕНА, а не #id */}
            <CityMultiSelect
              value={form.cityIds}
              onChange={(ids) => setForm((s) => ({ ...s, cityIds: ids }))}
              options={allCities}                 // [{id,name}]
              labelsMap={cityNameById}            // если компонент поддерживает — покажет имена
            />

            <label className="lbl">Ціна, ₴</label>
            <Input
              name="price"
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
            />

            <label className="lbl">Опис</label>
            <RTE
              value={form.desc}
              onChange={(html) => setForm((s) => ({ ...s, desc: html }))}
              placeholder="Опишіть деталі, додайте списки, виділіть важливе…"
            />

            {/* === Фото в режиме СОЗДАНИЯ === */}
            {!editing && (
              <>
                <label className="lbl">Фото (необов’язково)</label>
                <input type="file" accept="image/*" multiple onChange={onPickPhotos} />
                {previews.length > 0 && (
                  <div className="photos-grid">
                    {previews.map((p, idx) => (
                      <div key={p.id} className="photo-item">
                        <img src={p.url} alt={`photo-${idx}`} />
                        <button type="button" className="photo-remove" onClick={() => removePhotoIdx(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* === Фото в режиме РЕДАКТИРОВАНИЯ === */}
            {editing && (
              <>
                <label className="lbl">Фото</label>
                {Array.isArray(editing.photoUrls) && editing.photoUrls.length > 0 ? (
                  <div className="offer-photos">
                    {editing.photoUrls.map((src, i) => {
                      const url = resolveUrl(src);
                      return (
                        <div key={i} style={{ position: "relative" }}>
                          <img
                            src={url}
                            alt={`photo-${i}`}
                            className="offer-photo"
                            onClick={() =>
                              viewer.show((editing.photoUrls || []).map(resolveUrl), i)
                            }
                          />
                          <button
                            type="button"
                            className="photo-remove"
                            onClick={() => deletePhoto(src)}
                            title="Видалити фото"
                            style={{ position: "absolute", top: 6, right: 8 }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="muted">Фото поки немає</div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <label className="accp-btn" style={{ cursor: "pointer" }}>
                    Додати фото
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => addMorePhotos(e.target.files)}
                      hidden
                    />
                  </label>
                </div>
              </>
            )}

            <div className="modal-actions" style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Скасувати</Button>
              <Button type="submit" disabled={!editing && (!form.categoryId || !form.workId)}>
                {editing ? "Зберегти" : "Додати"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
