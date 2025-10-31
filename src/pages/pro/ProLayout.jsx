import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./ProLayout.css";

export default function ProLayout() {
  return (
    <div className="container pro-wrap" style={{padding:"24px 0"}}>
      <h1 style={{marginBottom:16}}>Кабінет фахівця</h1>

      <nav className="tabs" style={{display:"flex", gap:12, marginBottom:16}}>
        <NavLink end to="/pro" className="tab">Профіль</NavLink>
        <NavLink to="/pro/services" className="tab">Мої послуги</NavLink>
        <NavLink to="/pro/find" className="tab">Знайти замовлення</NavLink>
        <NavLink to="/pro/active" className="tab">Замовлення в роботі</NavLink>
        <NavLink to="/pro/done" className="tab">Виконані замовлення</NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
