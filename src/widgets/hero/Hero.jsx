import "./Hero.css";
import { SearchBar } from "../search-bar";
import imgHouse from "../../shared/assets/imgHouse.png";
import imgDelivery from "../../shared/assets/imgDelivery.png";
import imgFreelance from "../../shared/assets/imgFreelance.png";
import imgTeachers from "../../shared/assets/imgTeachers.png";
import imgBusiness from "../../shared/assets/imgBusiness.png";
import imgCategories from "../../shared/assets/imgCategories.png";

export default function Hero({ value, onChange, onSubmit }) {
  return (
    <section className="hero-group">
      <section className="hero">
        {/* Плавающие ромбы */}
        <div className="hero-floating">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={`float-diamond diamond-${i + 1}`} />
          ))}
        </div>

        <div className="hero-center hero-panel">
          <h1 className="text-orange">Замовляй та надавай послуги з комфортом</h1>
          <h2 className="text-orange">Разом нас не зупинити. Ми з Україною</h2>
          <SearchBar value={value} onChange={onChange} onSubmit={onSubmit} />
        </div>
      </section>

      <section className="hero-icons">
        <div className="hero-icons__inner">
          {[imgHouse, imgDelivery, imgFreelance, imgTeachers, imgBusiness, imgCategories].map((src, i) => (
            <a key={i} href="/">
              <img src={src} alt="" width={44} height={56} loading="lazy" />
            </a>
          ))}
        </div>
      </section>
    </section>
  );
}
