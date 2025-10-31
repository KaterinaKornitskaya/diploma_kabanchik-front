import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AccountLayout() {
  return (
    <div className="container" style={{padding:"24px 0"}}>
      <h1 style={{marginBottom:16}}>Мій кабінет</h1>

      <nav className="tabs" style={{display:"flex", gap:12, marginBottom:16}}>
        <NavLink to="/account" end className="tab">Профіль</NavLink>
        <NavLink to="/account/orders" className="tab">Мої замовлення</NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
