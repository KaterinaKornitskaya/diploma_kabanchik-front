// CategoryGrid - логика загрузки категорий/подкатегорий
import "./CategoryGrid.css";
import React from "react";
import { Link } from "react-router-dom";
import { categoryApi } from "../../entities/category";

export default function CategoryGrid() {
  const [categories, setCategories] = React.useState([]);
  const [subsByCat, setSubsByCat] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  // утилита нормализации ответов API
  const unbox = (res) =>
    Array.isArray(res)
      ? res
      : res?.data ?? res?.items ?? res?.result ?? res?.value ?? res?.Data ?? res?.Items ?? [];

  // 👇 утилита: строим тот же URL, что и SearchBar
  const toProsQuery = (name) => {
    const q = (name || "").trim();
    return q ? `/pros?q=${encodeURIComponent(q)}` : "/pros";
  };

  // 1) грузим все категории
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await categoryApi.getAllCategories();
        const items = unbox(data);
        if (alive) setCategories(items);
      } catch (e) {
        if (alive) {
          setErr("Не вдалося завантажити категорії");
          console.error(e);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 2) ПОСЛЕДОВАТЕЛЬНО грузим подкатегории для каждой категории
  React.useEffect(() => {
    if (!categories?.length) return;
    let alive = true;

    (async () => {
      if (alive) setSubsByCat({}); // сброс

      for (const cat of categories) {
        if (!alive) break;
        const rawId = cat?.id ?? cat?.categoryId ?? cat?.CategoryId ?? cat?.Id;
        const id = Number(rawId);

        if (!Number.isFinite(id) || id <= 0) {
          if (alive) setSubsByCat((prev) => ({ ...prev, [rawId ?? ""]: [] }));
          continue;
        }

        try {
          const res = await categoryApi.getWorksByCategoryId(id);
          const subs = unbox(res);
          if (alive) setSubsByCat((prev) => ({ ...prev, [id]: subs }));
        } catch (e) {
          console.error("Load subcategories error for category", id, e);
          if (alive) setSubsByCat((prev) => ({ ...prev, [id]: [] }));
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [categories]);

  return (
    <section className="categories">
      <h2 id="categories-title">Категорії</h2>

      {loading && <p className="categories-loading">Завантаження…</p>}
      {err && <p className="categories-error">{err}</p>}

      {!loading && !err && categories.length === 0 && (
        <p className="categories-empty">Поки що немає категорій.</p>
      )}

      {categories.length > 0 && (
        <div className="categories-grid" role="list">
          {categories.map((catRaw) => {
            const rawId = catRaw?.id ?? catRaw?.categoryId ?? catRaw?.CategoryId ?? catRaw?.Id;
            const id = Number(rawId);
            const name =
              catRaw?.name ?? catRaw?.Name ?? catRaw?.title ?? catRaw?.Title ?? "Без назви";
            const subs = subsByCat[id];

            return (
              <article key={id || name} className="category-card" role="listitem">
                <h3 className="category-title">{name}</h3>

                <ul className="subcategory-list">
                  {subs === undefined && <li className="show-more">Завантаження…</li>}

                  {Array.isArray(subs) && subs.length === 0 && (
                    <li className="no-subs">Немає робіт у цій категорії</li>
                  )}

                  {Array.isArray(subs) &&
                    subs.length > 0 &&
                    subs.slice(0, 5).map((sub) => {
                      const subId =
                        typeof sub === "string"
                          ? sub
                          : sub?.id ?? sub?.Id ?? sub?.name ?? sub?.Name ?? sub?.title ?? sub?.Title;
                      const subName =
                        typeof sub === "string"
                          ? sub
                          : sub?.name ?? sub?.Name ?? sub?.title ?? sub?.Title ?? "Підкатегорія";

                      return (
                        <li key={subId || subName}>
                          {/*  клика ведёт на /pros?q=<назва> */}
                          <Link className="subcategory-link" to={toProsQuery(subName)}>
                            {subName}
                          </Link>
                        </li>
                      );
                    })}

                  {Array.isArray(subs) && subs.length > 2 && (
                    <li className="show-more">
                      {/* можно оставить как есть или тоже вести на поиск по назві категорії: to={toProsQuery(name)} */}
                      <Link to={`/categories/${encodeURIComponent(id)}`}>Показати ще</Link>
                    </li>
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
