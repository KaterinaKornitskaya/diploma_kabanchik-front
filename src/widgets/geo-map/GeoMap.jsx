import "./GeoMap.css";
import geoMapImg from "../../shared/assets/geo.svg"; 

export default function GeoMap() {
  return (
    <section className="geo-map">
      <div className="geo-map__image-wrap">
        <img
          src={geoMapImg}
          alt="Карта України — географія Пчілки"
          className="geo-map__image"
          loading="lazy"
        />
      </div>
    </section>
  );
}
