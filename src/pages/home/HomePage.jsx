// src/pages/home/HomePage.jsx
import React, { useState } from "react";
import "./HomePage.css";
import { Hero } from "../../widgets/hero";
import { CategoryGrid } from "../../widgets/category-grid";
import { SearchBar } from "../../widgets/search-bar";
import { HowItWorks } from "../../widgets/how-it-works";
import { CtaBanner } from "../../widgets/cta-banner";
import { useNavigate } from "react-router-dom";
import { GeoMap } from "../../widgets/geo-map";

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (valueOrEvent) => {
    const q = typeof valueOrEvent === "string" ? valueOrEvent : searchValue;
    const trimmed = (q || "").trim();
    if (!trimmed) return;
    navigate(`/pros?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="homepage">
      <main id="main" className="container">
        <Hero value={searchValue} onChange={setSearchValue} onSubmit={handleSubmit} />
        <CategoryGrid />
        <section className="search2Sect">
          <h3 className="text-center">Не знайшли потрібну послугу? Використовуйте пошук!</h3>
          <SearchBar value={searchValue} onChange={setSearchValue} onSubmit={handleSubmit} />
        </section>
        <HowItWorks />
        <GeoMap/>
        <CtaBanner />
      </main>
    </div>
  );
}
