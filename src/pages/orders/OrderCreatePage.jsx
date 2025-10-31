// src/pages/orders/OrderCreatePage.jsx
import React from "react";
import "./OrderCreatePage.css";

import Input from "../../shared/ui/Input/Input";
import Button from "../../shared/ui/Button/Button";
import CategoryWorkSelect from "../../shared/ui/CategoryWorkSelect/CategoryWorkSelect";
import CitySelect from "../../widgets/city-select/CitySelect";
import { ordersApi } from "../../entities/orders";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OrderCreatePage() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  // форма
  const [city, setCity] = React.useState(null); // { id, name }
  const [cw, setCW] = React.useState({ categoryId: "", workId: "" });
  const [desc, setDesc] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // если пришли из профиля/поиска с заранее выбранной роботой
  React.useEffect(() => {
    const wid = params.get("workId");
    if (wid && !cw.workId) setCW((s) => ({ ...s, workId: String(wid) }));
  }, [params, cw.workId]);

  // валідація
  const fieldErr = {
    city: city?.id ? "" : "Оберіть місто зі списку",
    work: cw?.workId ? "" : "Оберіть роботу",
    desc: desc.trim().length ? "" : "Опишіть завдання",
  };
  const isValid = !fieldErr.city && !fieldErr.work && !fieldErr.desc;

  const submit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    try {
      setLoading(true);
      const body = {
        workId: Number(cw.workId),
        cityId: Number(city.id),
        description: desc.trim(),
        price: price ? Number(price) : 0,
      };

      const res = await ordersApi.create(body);
      const newId = res?.data?.id ?? res?.Data?.id ?? res?.id ?? null;

      nav("/orders/created", { replace: true, state: { newId } });
    } catch (err) {
      let msg = "Помилка створення замовлення";
      const raw = err?.message?.split("—")[1];
      try {
        const json = raw ? JSON.parse(raw) : null;
        msg = json?.status?.message || json?.message || msg;
      } catch {}
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ordnew">
      <h1 className="ordnew__title">Створити замовлення</h1>

      <div className="ordnew__card">
        <form className="ordnew__form" onSubmit={submit} noValidate>
          {/* Місто */}
          <div className="form-block">
            <label className="form-label" htmlFor="city">
             
            </label>
            <CitySelect id="city" value={city} onChange={setCity} />
            {fieldErr.city && <div className="form-error">{fieldErr.city}</div>}
          </div>

          {/* Категорія/Робота */}
          <div className="form-block">
            <label className="form-label" htmlFor="work">
              
            </label>
            <CategoryWorkSelect id="work" value={cw} onChange={setCW} />
            {fieldErr.work && <div className="form-error">{fieldErr.work}</div>}
          </div>

          {/* Опис завдання (textarea) */}
          <div className="form-block col-span-2">
            <label className="form-label" htmlFor="desc">
              Короткий опис
            </label>
            <textarea
              id="desc"
              name="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Опишіть деталі завдання…"
              className="input-textarea"
              rows="4"
            />
            {fieldErr.desc && <div className="form-error">{fieldErr.desc}</div>}
          </div>

          {/* Бюджет (необов’язково) */}
          <div className="form-block">
            <Input
              label="Орієнтовний бюджет (необов’язково)"
              name="price"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Напр., 1500"
            />
          </div>

          {/* Кнопки */}
          <div className="form-actions col-span-2">
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? "Створюємо…" : "Створити замовлення"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
