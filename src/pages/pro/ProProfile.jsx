// src/pages/pro/ProProfile.jsx
import * as React from "react";
import { useNavigate } from "react-router-dom";

import "../../features/profile/ProfileCard.css";
import ProfileCard from "../../features/profile/components/ProfileCard";
import { useUserProfile } from "../../features/profile/hooks/useUserProfile";
import { ordersApi } from "../../entities/orders";

export default function ProProfile() {
  const navigate = useNavigate();
  const { user, setUser, loading, err } = useUserProfile();
  const [stats, setStats] = React.useState({
    inWork: 0,
    done: 0,
    cancelled: 0,
    // services: null, // ← можно включить позже, если появится API
  });

  React.useEffect(() => {
    let alive = true;

    const unbox = (x) => {
      const arr =
        Array.isArray(x)
          ? x
          : (x?.data ?? x?.Data ?? x?.items ?? x?.Items ?? x?.result ?? x?.Result ?? []);
      return Array.isArray(arr) ? arr : [];
    };

    const load = async () => {
      try {
        if (!user?.id) return;

        // 1) Получаем «мои как виконавець» — что доступно из API
        let raw = [];
        try {
          if (ordersApi.myAssigned) {
            raw = unbox(await ordersApi.myAssigned());
          } else if (ordersApi.myAsPerformer) {
            raw = unbox(await ordersApi.myAsPerformer());
          } else if (ordersApi.my) {
            raw = unbox(await ordersApi.my());
          }
        } catch {
          raw = [];
        }

        // 2) Если API вернул «все», отфильтруем по текущему виконавцю
        const uid = String(
          user?.id ?? user?.Id ?? user?.userId ?? user?.UserId ?? user?.specialistId ?? ""
        );

        if (uid) {
          raw = raw.filter((o) => {
            const pid = String(
              o?.performerId ?? o?.specialistId ?? o?.SpecialistId ?? o?.PerformerId ?? ""
            );
            // если pid пустой, не фильтруем (значит, API уже вернул только мои)
            return !pid || pid === uid;
          });
        }

        // 3) Нормализация статуса
        const getStatus = (o) => {
          const s = String(o?.status ?? o?.Status ?? "").trim();
          if (s) return s;
          if (o?.completedAt || o?.CompletedAt) return "Completed";
          return ""; // неизвестно
        };

        const isDone = (o) => {
          const s = getStatus(o).toLowerCase();
          return s === "completed" || /completed|done|finished/.test(s) || !!(o?.completedAt || o?.CompletedAt);
        };
        const isCancelled = (o) => {
          const s = getStatus(o).toLowerCase();
          return s === "cancelled" || /cancel/.test(s) || !!(o?.cancelledAt || o?.CancelledAt);
        };
        const isInWork = (o) => {
          const s = getStatus(o).toLowerCase();
          return s === "inprogress" || s === "pending" || s === "accepted" || s === "assigned";
        };

        const done = raw.filter(isDone).length;
        const cancelled = raw.filter(isCancelled).length;
        const inWork = raw.filter(isInWork).length;

        if (alive) setStats((s) => ({ ...s, inWork, done, cancelled }));
      } catch {
        if (alive) setStats((s) => ({ ...s, inWork: 0, done: 0, cancelled: 0 }));
      }
    };

    load();
    return () => { alive = false; };
  }, [user?.id, ordersApi]);


  if (loading) return <div className="accp-muted">Завантаження…</div>;
  if (err) return <div className="accp-error">{err}</div>;
  if (!user) return null;

  const extra = [{ key: "Роль:", value: "фахівець" }];

  return (
    <div className="accp">
      <ProfileCard
        user={user}
        setUser={setUser}
        extraLines={extra}
        rightActions={
          <>
            <button className="accp-btn" onClick={() => navigate("/pro/find")}>
              Знайти замовлення
            </button>
            <button className="accp-btn" onClick={() => navigate("/pro/active")}>
              Замовлення в роботі
            </button>
            <button className="accp-btn" onClick={() => navigate("/pro/done")}>
              Виконані замовлення
            </button>
            <button className="accp-btn accp-btn--ghost" onClick={() => navigate("/pro/services")}>
              Мої послуги
            </button>
          </>
        }
      />

      <div className="accp__grid-3">
        {/* Если позже появится services — добавишь карточку здесь */}
        <div className="accp__stat">
          <div className="accp__stat-num">{stats.inWork}</div>
          <div className="accp__stat-label">У роботі</div>
        </div>
        <div className="accp__stat">
          <div className="accp__stat-num">{stats.done}</div>
          <div className="accp__stat-sub">+ {stats.cancelled} скасовано</div>
          <div className="accp__stat-label">Виконані</div>
        </div>
        
      </div>
    </div>
  );
}
