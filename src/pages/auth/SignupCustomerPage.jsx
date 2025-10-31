import React from "react";
import "./SignupCustomerPage.css";
import Input from "../../shared/ui/Input/Input";
import Button from "../../shared/ui/Button/Button";
import { signupCustomer, login } from "../../entities/auth/api";
import { uploadAvatar } from "../../entities/user/api"; // ✅ используем твой существующий API
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function SignupCustomerPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const returnTo = loc.state?.returnTo || "/orders/new";

  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    password2: "",
    agree: true,
  });

  // 🖼️ Фото
  const [photo, setPhoto] = React.useState(null);
  const [photoPreview, setPhotoPreview] = React.useState("");

  const [touched, setTouched] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  // 🔸 обработчик выбора фото
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Будь ласка, оберіть зображення");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Фото не повинно перевищувати 5 МБ");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // 🧩 Валидация
  const errs = {
    fullName: form.fullName.trim().length >= 3 ? "" : "Вкажіть ім’я",
    email: /\S+@\S+\.\S+/.test(form.email) ? "" : "Некоректний email",
    phoneNumber: form.phoneNumber.trim().length >= 7 ? "" : "Некоректний телефон",
    password: /(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}/.test(form.password)
      ? ""
      : "Мінімум 6 символів, літера ↑ і спецсимвол",
    password2: form.password && form.password === form.password2 ? "" : "Паролі не збігаються",
    agree: form.agree ? "" : "Потрібна згода",
  };
  const isValid = Object.values(errs).every((x) => !x);

  // 🟢 Сабмит
  const submit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ fullName: 1, email: 1, phoneNumber: 1, password: 1, password2: 1, agree: 1 });
      return;
    }

    try {
      setLoading(true);
      setErr("");
      setOk("");

      // 1️⃣ регистрация кастомера
      await signupCustomer({
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        rememberMe: true,
      });

      // 2️⃣ логин — чтобы иметь токен для uploadAvatar
      await login({ email: form.email, password: form.password });

      // 3️⃣ если есть фото — загружаем
      if (photo) {
        try {
          const res = await uploadAvatar(photo);
          console.log("✅ Аватар завантажено:", res);
        } catch (upErr) {
          console.warn("⚠️ Помилка при завантаженні фото:", upErr);
        }
      }

      // 4️⃣ сообщение и переход
      setOk("Обліковий запис створено. Увійдіть зі своїм логіном і паролем.");
      setTimeout(() => {
        nav("/login", { replace: true, state: { returnTo } });
      }, 700);
    } catch (e2) {
      let msg = e2?.message || "";
      try {
        const raw = msg.split("—")[1];
        const json = raw ? JSON.parse(raw) : null;
        msg = json?.message || "Не вдалося зареєструватися";
      } catch {}
      setErr(msg || "Не вдалося зареєструватися");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap container">
      <h1 className="auth-title">Реєстрація (замовник)</h1>

      <form className="auth-form" onSubmit={submit} noValidate>
        <Input
          label="ПІБ"
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.fullName && errs.fullName}
        />
        <Input
          label="Електронна пошта"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.email && errs.email}
        />
        <Input
          label="Телефон"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.phoneNumber && errs.phoneNumber}
        />
        <Input
          label="Пароль"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.password && errs.password}
        />
        <Input
          label="Підтвердження паролю"
          name="password2"
          type="password"
          value={form.password2}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.password2 && errs.password2}
        />

        {/* 🖼️ поле фото */}
        <div className="auth-photo">
          <label className="auth-photo__label">Фото профілю (необов’язково)</label>
          <input type="file" accept="image/*" onChange={onPhotoChange} />
          {photoPreview && (
            <div className="auth-photo__preview">
              <img src={photoPreview} alt="Прев'ю" />
            </div>
          )}
        </div>

        <label className="auth-check">
          <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} />
          <span>Погоджуюсь з умовами сервісу та політикою конфіденційності</span>
        </label>

        {err && <div className="auth-error">{err}</div>}
        {ok && <div className="auth-success">{ok}</div>}

        <Button type="submit" fullWidth disabled={!isValid || loading}>
          {loading ? "Збереження…" : "Зареєструватися"}
        </Button>

        <div className="auth-links">
          <Link to="/login">Вже є акаунт? Увійти</Link>
          <Link to="/">На головну</Link>
        </div>
      </form>
    </div>
  );
}
