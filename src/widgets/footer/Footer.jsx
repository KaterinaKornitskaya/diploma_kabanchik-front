import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import logo from "../../shared/assets/logo.png";

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      {/* Верхняя узкая полоска */}
      <div className="sf-topbar">
        <div className="sf-container">
          <div className="sf-topbar-left">Маленька праця для великих людей!</div>
          <div className="sf-topbar-right">
            <span>follow us</span>
            <a href="#" aria-label="Google" className="sf-ico g">G</a>
            <a href="#" aria-label="Facebook" className="sf-ico f">f</a>
            <a href="#" aria-label="Instagram" className="sf-ico i">◎</a>
            <a href="#" aria-label="Twitter" className="sf-ico t">t</a>
          </div>
        </div>
      </div>

      {/* Основной блок */}
      <div className="sf-main">
        <div className="sf-container sf-grid">
          <div className="sf-logo">
            <img src={logo} alt="Логотип BusyBee" width={180} height={44} loading="lazy" />
          </div>

          <nav className="sf-col">
            <h4>Про нас</h4>
            <Link to="#">Про проєкт</Link>
            <Link to="#">Контакти</Link>
            <Link to="#">Мобільний додаток</Link>
            <Link to="#">Наші партнери</Link>
          </nav>

          <nav className="sf-col">
            <h4>Сервіси</h4>
            <Link to="#">Блог/корисні поради</Link>
            <Link to="#">Робота у регіонах</Link>
            <Link to="#">Подарункові сертифікати</Link>
            <Link to="#">Повний офер</Link>
          </nav>

          <nav className="sf-col">
            <h4>Як це працює</h4>
            <Link to="#">Як замовити послугу</Link>
            <Link to="#">Робота з фахівцями</Link>
            <Link to="#">Поради для компаній</Link>
            <Link to="#">Безпека угод</Link>
            <Link to="#">Ціни і тарифи</Link>
            <Link to="#">Останні відгуки</Link>
            <Link to="#">Топ виконавці</Link>
          </nav>

          <nav className="sf-col">
            <h4>Допомога</h4>
            <Link to="#">Питання та відповіді</Link>
            <Link to="#">Публічний офер</Link>
            <Link to="#">Політика конфіденційності</Link>
            <Link to="#">Служба підтримки</Link>
          </nav>
        </div>
      </div>

      {/* Низкая подложка с копирайтом */}
      <div className="sf-bottombar">
        <div className="sf-container sf-bottom-inner">
          <small>© {new Date().getFullYear()} BusyBee. Усі права захищено.</small>
          <div className="sf-bottom-links">
            <Link to="#">Умови користування</Link>
            <span aria-hidden="true">•</span>
            <Link to="#">Політика конфіденційності</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
