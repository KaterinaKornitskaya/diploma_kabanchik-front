import React from "react";
import Button from "../../../shared/ui/Button/Button";
import "./styles.css";

export default function ProSignUpSuccessPage() {
  const handleLogin = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <section className="pro-success container">
      <div className="pro-success-card">
        <div className="check-badge" aria-hidden="true">✓</div>
        <h1 className="title">Реєстрацію завершено!</h1>
        <p className="text">
          Ваш обліковий запис <b>фахівця</b> успішно створено.
          Тепер ви можете увійти під своїм логіном і паролем.
        </p>
        <Button size="lg" onClick={handleLogin}>Увійти</Button>
      </div>
    </section>
  );
}
