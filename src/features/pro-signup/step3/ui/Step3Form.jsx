import React from "react";
import "./Step3Form.css";
import Button from "../../../../shared/ui/Button/Button";
import ImageUpload from "../../../../shared/ui/ImageUpload/ImageUpload";
import { useProOnboarding } from "../../../../processes/pro-onboarding/model";
import { categoryApi } from "../../../../entities/category";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../../entities/auth";
import { userApi } from "../../../../entities/user";
import { offerApi } from "../../../../entities/offer";


export default function Step3Form() {
  const navigate = useNavigate();
  const { data, update } = useProOnboarding();

  const [me, setMe] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState("");

  const [avatar, setAvatar] = React.useState(null);

  // категории (оставим как было; позже добавим отправку picked → Offers)
  const [cats, setCats] = React.useState([]);
  const [subsByCat, setSubsByCat] = React.useState({});
  const [picked, setPicked] = React.useState(data.__step3?.picked ?? []);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  // при маунте: если токен есть — подтянуть me; если нет — отправить на Step1
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setAuthLoading(true);
        setAuthError("");

        const hasToken = !!localStorage.getItem("token");
        if (!hasToken) {
          setAuthError("Сесію не знайдено. Увійдіть або зареєструйтесь.");
          navigate("/auth/pro-signup/step-1");
          return;
        }

        const meRes = await authApi.me();
        if (!alive) return;
        const user = meRes?.data ?? meRes;
        setMe(user);
      } catch (e) {
        if (!alive) return;
        setAuthError(e?.message || "Не вдалося авторизуватися");
      } finally {
        if (alive) setAuthLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [navigate]);

  // категории
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr("");
        const raw = await categoryApi.getAllCategories();
        const items = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? raw?.result ?? raw?.value ?? []);
        if (alive) setCats(items);
      } catch (e) {
        if (alive) setErr("Не вдалося завантажити категорії");
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const ensureSubs = async (catId) => {
    if (subsByCat[catId]) return;
    try {
      const data = await categoryApi.getWorksByCategoryId(catId);
      const subs = Array.isArray(data) ? data : (data?.data ?? data?.items ?? data?.result ?? data?.value ?? []);
      setSubsByCat(s => ({ ...s, [catId]: subs }));
    } catch {
      setSubsByCat(s => ({ ...s, [catId]: [] }));
    }
  };

  const toggle = (catId, catName, subId, subName) => {
    setPicked(prev => {
      const key = `${catId}:${subId}`;
      return prev.some(p => p.key === key)
        ? prev.filter(p => p.key !== key)
        : [...prev, { key, catId, catName, subId, subName }];
    });
  };
  const isPicked = (catId, subId) => picked.some(p => p.catId === catId && String(p.subId) === String(subId));

  // валидация только по аватару (категории подключим позже)
  const errs = {
    avatar: avatar ? "" : "Додайте фото",
  };
  const isValid = Object.values(errs).every(e => !e);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    // гарантируем токен
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError("Сесію не знайдено. Увійдіть або зареєструйтесь.");
      navigate("/auth/pro-signup/step-1");
      return;
    }

    // 1) upload avatar
    try {
      const maybeFile = avatar?.file || avatar;
      if (maybeFile instanceof File) {
        await userApi.uploadAvatar(maybeFile); // поле "File" у формі
        console.log("✅ avatar uploaded");
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      // можно показать мягкое сообщение — але не валимо весь крок
    }

    // 2) збережемо вибране локально (avatar як File зберігати не обов'язково)
    update({ __step3: { avatar: null, picked } });

    const workIds = picked.map(p => Number(p.subId)).filter(Number.isFinite);

    // offer
    if (workIds.length) {
      try {
        await offerApi.createOffersForWorks(workIds, {
          price: 0,
          description: "",
          plannedDurationIso: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          cityIds: []
        });
        console.log("Offers saved successfully");
      } catch (err) {
        console.error("Failed to save offers:", err);
      }
    }


    // 3) перехід на успіх (пізніше додамо створення Offers перед success)
    navigate("/auth/pro-signup/success");
  };

  return (
    <form className="s3-form" onSubmit={submit}>
      {authLoading && <div className="s3-muted" style={{marginBottom:12}}>Авторизація…</div>}
      {authError && <div className="s3-err" style={{marginBottom:12}}>{authError}</div>}
      {me && (
        <div className="s3-muted" style={{marginBottom:12}}>
          Ви увійшли як: {me.fullName || me.userName || me.email || "користувач"}
        </div>
      )}

      {/* 1) Фото */}
      <ImageUpload label="Фото профілю" value={avatar} onChange={setAvatar} />
      {errs.avatar && <div className="s3-err">{errs.avatar}</div>}

      {/* 2) Категорії/підкатегорії (логіка лишається; збереження на бек — наступним етапом) */}
      <div className="s3-box">
        <div className="s3-cats">
          {loading && <div className="s3-muted">Завантаження…</div>}
          {err && <div className="s3-err">{err}</div>}
          {!loading && !err && cats.map(cat => {
            const catId = Number(cat.id ?? cat.categoryId ?? cat.CategoryId ?? cat.Id);
            const catName = cat.name ?? cat.Name ?? cat.title ?? cat.Title ?? "Категорія";
            const subs = subsByCat[catId];

            return (
              <details key={catId || catName} className="s3-cat" onToggle={e => e.target.open && ensureSubs(catId)}>
                <summary>{catName}</summary>
                <ul className="s3-subs">
                  {subs === undefined && <li className="s3-muted">Завантаження…</li>}
                  {Array.isArray(subs) && subs.length === 0 && <li className="s3-muted">Немає підкатегорій</li>}
                  {Array.isArray(subs) && subs.map(sub => {
                    const subId = typeof sub === "string"
                      ? sub
                      : (sub.id ?? sub.Id ?? sub.name ?? sub.Name ?? sub.title ?? sub.Title);
                    const subName = typeof sub === "string"
                      ? sub
                      : (sub.name ?? sub.Name ?? sub.title ?? sub.Title ?? "Підкатегорія");
                    const checked = isPicked(catId, subId);
                    return (
                      <li key={`${catId}:${subId}`}>
                        <label className="s3-chip">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(catId, catName, subId, subName)}
                          />
                          <span>{subName}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>

        <div className="s3-picked">
          <h4>Обране</h4>
          {picked.length === 0 && <div className="s3-muted">Поки нічого не вибрано</div>}
          {picked.length > 0 && (
            <ul className="s3-picked-list">
              {picked.map(p => (
                <li key={p.key} className="s3-picked-item">
                  <strong>{p.subName}</strong>
                  <span className="s3-catname">{p.catName}</span>
                  <button type="button" className="s3-remove" onClick={() => toggle(p.catId, p.catName, p.subId, p.subName)}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="s3-actions">
        <Button kind="ghost" type="button" onClick={() => navigate("/auth/pro-signup/step-1")}>
          Назад
        </Button>
        <Button type="submit" variant="orange" fullWidth>
          Завершити реєстрацію
        </Button>
      </div>
    </form>
  );
}
