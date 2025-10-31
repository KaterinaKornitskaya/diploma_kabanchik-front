import React from "react";
import { useLocation } from "react-router-dom";
import Button from "../../shared/ui/Button/Button";
import "./OrderCreatedPage.css";

export default function OrderCreatedPage() {
  const location = useLocation();
  const newId = location?.state?.newId ?? null;

  return (
    <section className="order-created container">
      <div className="success-card">
        <div className="success-head">
          <div className="check-badge" aria-hidden="true">✓</div>
          <div className="titles">
            <h1>Замовлення створено</h1>
            <p className="subtitle">
              Дякуємо! Ми повідомимо фахівцям у вашому місті.
            </p>
            {newId && (
              <p className="order-id">
                Номер вашого замовлення:
                <span className="chip">#{newId}</span>
              </p>
            )}
          </div>
        </div>

        <div className="order-created__actions">
          {newId && (
            <Button
              href={`/account/orders/${newId}`}
              size="lg"
              className="order-btn"
            >
              Перейти в деталі замовлення
            </Button>
          )}
          <Button href="/" variant="outline" size="lg" className="order-btn">
            На головну
          </Button>
          <Button href="/orders/new" size="lg" className="order-btn">
            Створити ще одне
          </Button>
          <Button href="/pros/search" size="lg" className="order-btn">
            Знайти фахівця
          </Button>
        </div>
      </div>
    </section>
  );
}
