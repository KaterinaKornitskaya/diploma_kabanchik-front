import React from "react";
import "./LoginPage.css";
import Input from "../../shared/ui/Input/Input";
import Button from "../../shared/ui/Button/Button";
import { authApi } from "../../entities/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();

  // токен у сховищі (вже авторизований?)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [form, setForm] = React.useState({
    email: "",
    password: "",
    remember: true,
  });
  const [touched, setTouched] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  // Ролі користувача (якщо вже є токен)
  const [roles, setRoles] = React.useState([]);
  const [meLoading, setMeLoading] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) return;
      try {
        setMeLoading(true);
        const me = await authApi.me();
        if (!alive) return;
        const r =
          me?.data?.userRoles ||
          me?.userRoles ||
          me?.data?.roles ||
          me?.roles ||
          [];
        setRoles(Array.isArray(r) ? r : []);
      } catch {
        localStorage.removeItem("token"); // битий токен
        setRoles([]);
      } finally {
        if (alive) setMeLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };
  const onBlur = (e) =>
    setTouched((t) => ({ ...t, [e.target.name]: true }));

  const errs = {
    email: /\S+@\S+\.\S+/.test(form.email) ? "" : "Некоректний email",
    password: form.password.length >= 6 ? "" : "Мінімум 6 символів",
  };
  const isValid = Object.values(errs).every((x) => !x);

  // куди вести в залежності від ролей
  const destByRoles = (rs) =>
  (rs || []).includes("specialist") ? "/pro" : "/account";   // <-- было "/orders/new"
  //const destByRoles = (rs) =>
   // (rs || []).includes("specialist") ? "/pro" : "/orders/new";

  const submit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ email: true, password: true });
      return;
    }
    try {
      setLoading(true);
      setErr("");

      // 1) логін
      const resp = await authApi.login({
        email: form.email,
        password: form.password,
      });
      const tok = resp?.data || resp;
      if (typeof tok !== "string" || tok.length === 0) {
        setErr("Не вдалося увійти. Спробуйте ще раз.");
        return;
      }
      localStorage.setItem("token", tok);

      // 2) тягнемо ролі (якщо недоступно — не критично)
      let rs = [];
      try {
        const me = await authApi.me();
        rs =
          me?.data?.userRoles ||
          me?.userRoles ||
          me?.data?.roles ||
          me?.roles ||
          [];
      } catch {}

      // 3) пріоритетно — повернення туди, звідки прийшли
      const returnTo = loc.state?.returnTo || loc.state?.from;
      const dest = returnTo || destByRoles(rs);
      nav(dest, { replace: true });
    } catch (e2) {
      localStorage.removeItem("token");
      let msg = "Невірний логін або пароль";
      try {
        const raw = (e2?.message || "").split("—")[1];
        const json = raw ? JSON.parse(raw) : null;
        msg = json?.message || msg;
      } catch {}
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap container">
      <h1 className="auth-title">Вхід</h1>

      {token ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div
            className="auth-error"
            style={{
              background: "#fff7d6",
              borderColor: "#f0d76b",
              color: "#6b5600",
            }}
          >
            Ви вже увійшли в систему.
          </div>

          {/* якщо нас сюди прислали з returnTo — запропонуємо продовжити */}
          {loc.state?.returnTo && (
            <Button
              onClick={() => nav(loc.state.returnTo, { replace: true })}
              fullWidth
            >
              Продовжити, створити замовлення
            </Button>
          )}


          <Button
            onClick={() => nav(destByRoles(roles))}
            fullWidth
            disabled={meLoading}
          >
            {meLoading ? "Завантаження…" : "Перейти до кабінету"}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("token");
              nav(0);
            }}
            fullWidth
          >
            Вийти та увійти іншим акаунтом
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="auth-form">
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
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            onBlur={onBlur}
            error={touched.password && errs.password}
          />

          <label className="auth-check">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={onChange}
            />
            <span>Запам’ятати мене</span>
          </label>

          {err && <div className="auth-error">{err}</div>}

          <Button type="submit" fullWidth disabled={!isValid || loading}>
            {loading ? "Вхід…" : "Увійти"}
          </Button>

          <div className="auth-links">
            <Link to="/">На головну</Link>
            <Link to="/signup" state={{ returnTo: loc.state?.returnTo || "/orders/new" }}>
              Зареєструватися як замовник
            </Link>
            <Link to="/auth/pro-signup/step-1">Стати фахівцем</Link>
          </div>
        </form>
      )}
    </div>
  );
}
