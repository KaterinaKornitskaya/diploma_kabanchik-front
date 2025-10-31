import React from "react";
import { useParams, Link } from "react-router-dom";
import { categoryApi } from "../../entities/category";
import "./CategoryPage.css";

export default function CategoryPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const [subs, setSubs] = React.useState([]);
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) Название категории
        try {
          const catsRaw = await categoryApi.getAllCategories();
          const cats = Array.isArray(catsRaw)
            ? catsRaw
            : (catsRaw?.data ?? catsRaw?.items ?? catsRaw?.result ?? catsRaw?.value ?? []);
          const found = cats.find(c => Number(c.id ?? c.categoryId ?? c.CategoryId ?? c.Id) === id);
          if (alive && found) {
            const catName = found.name ?? found.Name ?? found.title ?? found.Title ?? "";
            setName(catName);
          }
        } catch (e) {
          console.debug("Category name fetch failed:", e);
        }

        // 2) Работы категории
        const data = await categoryApi.getWorksByCategoryId(id);
        const list = Array.isArray(data)
          ? data
          : (data?.data ?? data?.items ?? data?.result ?? data?.value ?? data?.Items ?? data?.Result ?? data?.Value ?? []);
        if (alive) setSubs(list);
      } catch (e) {
        console.error("Load subcategories error:", e);
        if (alive) setErr("Не вдалося завантажити підкатегорії");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [id]);

  return (
    <section className="category-page container">
      <h2 className="text-center">{name || (Number.isFinite(id) ? `Категорія #${id}` : "Категорія")}</h2>

      {loading && <p className="muted">Завантаження…</p>}
      {err && <p className="error">{err}</p>}

      {!loading && !err && (
        <>
          {Array.isArray(subs) && subs.length > 0 ? (
            <ul className="subs-list">
              {subs.map((sub) => {
                const subId =
                  typeof sub === "string"
                    ? sub
                    : sub?.id ?? sub?.Id ?? sub?.name ?? sub?.Name ?? sub?.title ?? sub?.Title;
                const subName =
                  typeof sub === "string"
                    ? sub
                    : sub?.name ?? sub?.Name ?? sub?.title ?? sub?.Title ?? "Підкатегорія";

                // ✅ теперь переход на /pros?q=<название>
                return (
                  <li key={subId || subName}>
                    <Link to={`/pros?q=${encodeURIComponent(subName)}`}>
                      {subName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Немає робіт у цій категорії.</p>
          )}
        </>
      )}
    </section>
  );
}
