import React from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../search-bar";
import { Button } from "../../shared/ui/Button";
import logo from "../../shared/assets/logo.png";
import imgLogin from "../../shared/assets/imgLogin.png";
import { authApi } from "../../entities/auth";

export default function Header({ searchValue, onChange, onSubmit }) {
  const nav = useNavigate();

  /* ===== Тема ===== */
  const [theme, setTheme] = React.useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  /* ===== Авторизація / ролі ===== */
  const [token, setToken] = React.useState(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [roles, setRoles] = React.useState([]);

  React.useEffect(() => {
    const onStorage = (e) => { if (e.key === "token") setToken(e.newValue); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) { setRoles([]); return; }
      try {
        const res = await authApi.me();
        if (!alive) return;
        const r = res?.data?.userRoles || res?.userRoles || res?.roles || [];
        setRoles(Array.isArray(r) ? r : []);
      } catch {
        setRoles([]);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const rolesLower = React.useMemo(
    () => (Array.isArray(roles) ? roles.map((r) => String(r).toLowerCase()) : []),
    [roles]
  );
  const isSpecialist = rolesLower.includes("specialist");
  const isCustomer   = rolesLower.includes("customer") || rolesLower.includes("client");

  const accountHref = isSpecialist ? "/pro" : "/account";

  // ✅ обновлённая логика "Створити замовлення"
  const goCreateOrder = (e) => {
    e.preventDefault();
    const t = localStorage.getItem("token");

    if (!t) {
      nav("/login", { state: { returnTo: "/orders/new" } });
      return;
    }
    if (isCustomer) {
      nav("/orders/new");
      return;
    }
    // 👇 теперь просто логин, а не customer-signup
    nav("/login", { state: { returnTo: "/orders/new" } });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    nav("/", { replace: true });
  };

  /* ===== Пошук у шапці ===== */
  const isControlled = searchValue !== undefined && typeof onChange === "function";
  const [qLocal, setQLocal] = React.useState("");
  const q = isControlled ? searchValue : qLocal;

  const handleSearchChange = (v) => {
    if (isControlled) onChange(v);
    else setQLocal(v);
  };

  const handleSearchSubmit = (v) => {
    const term = (v ?? q ?? "").trim();
    if (!term) return;
    if (typeof onSubmit === "function") onSubmit(term);
    else nav(`/pros?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="site-header" role="banner">
      <div className="header__inner container">
        <Link to="/" className="brand" aria-label="На головну">
          <img src={logo} alt="Логотип BusyBee" width={160} height={40} loading="lazy" />
        </Link>

        <div className="header__actions">
          <Button onClick={goCreateOrder} size="md" className="header-cta">
            Створити замовлення
          </Button>
        </div>

        <div className="header__search">
          <SearchBar
            className="search-form--header"
            value={q}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        </div>

        <div className="header__actions">
          {!token ? (
            <>
              <Link to="/login" className="icon-btn" aria-label="Вхід">
                <img src={imgLogin} alt="Login" width={16} height={16} loading="lazy" />
              </Link>
              <Link to="/auth/pro-signup/step-1">
                <Button variant="outline" size="sm">Стати фахівцем</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={accountHref} className="icon-btn" aria-label="Мій кабінет">
                <img src={imgLogin} alt="Account" width={16} height={16} loading="lazy" />
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>Вийти</Button>
            </>
          )}

          <button
            type="button"
            className="icon-btn theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Увімкнути темну тему" : "Увімкнути світлу тему"}
            title={theme === "light" ? "Темна тема" : "Світла тема"}
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-16v3m0 14v3m8-8h3M1 12h3m13.66 6.66 2.12 2.12M4.22 4.22 6.34 6.34m0 11.32-2.12 2.12m13.56-15.78-2.12 2.12"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
