import React from "react";
import "../../features/profile/ProfileCard.css";
import { useNavigate, Link } from "react-router-dom";
import { ordersApi } from "../../entities/orders";
import ProfileCard from "../../features/profile/components/ProfileCard";
import { useUserProfile } from "../../features/profile/hooks/useUserProfile";


export default function AccountProfile() {
  const navigate = useNavigate();
  const { user, setUser, loading, err } = useUserProfile();
  const [stats, setStats] = React.useState({ total: 0, active: 0, done: 0, cancelled: 0 });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await ordersApi.my(); // замовлення користувача-замовника
        const total = list.length;
        const done = list.filter(x => String(x.status).includes("Completed")).length;
        const cancelled = list.filter(x => String(x.status).includes("Cancel")).length;
        const active = total - done - cancelled;
        if (alive) setStats({ total, active, done, cancelled });
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (loading) return <div className="accp-muted">Завантаження…</div>;
  if (err) return <div className="accp-error">{err}</div>;
  if (!user) return null;

  return (
    <div className="accp">
      <ProfileCard
        user={user}
        setUser={setUser}
        rightActions={
          <>
            <Link to="/orders/new" className="accp-add">Нове замовлення</Link>
            <button className="accp-btn" onClick={() => navigate("/account/orders")}>Мої замовлення</button>
            <button className="accp-btn accp-btn--ghost" onClick={logout}>Вийти</button>
          </>
        }
      />

      <div className="accp__grid-3">
        <div className="accp__stat"><div className="accp__stat-num">{stats.total}</div><div className="accp__stat-label">Усього замовлень</div></div>
        <div className="accp__stat"><div className="accp__stat-num">{stats.active}</div><div className="accp__stat-label">Активні</div></div>
        <div className="accp__stat">
          <div className="accp__stat-num">{stats.done}</div>
          <div className="accp__stat-sub">+ {stats.cancelled} скасовано</div>
          <div className="accp__stat-label">Виконані</div>
        </div>
      </div>
    </div>
  );
}
