import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import ProductCard from "../ProductCard";
import SkeletonCard from "../SkeletonCard";
import { PRODUCT_SOURCES } from "../../data/allProducts";
import { deriveProductMeta, parsePrice } from "../../utils/product";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import { useAllProducts } from "../../hooks/useAllProducts";

export default function CategoryTemplate({ type: fixedType }) {
  const params = useParams();
  const type = fixedType || params.type || "all";

  const sourceLabel =
    PRODUCT_SOURCES.find((s) => s.type === type)?.label ||
    (type === "all" ? "All Products" : type);

  const { addToCart } = useCart();
  const { has: isWished, toggle: toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [view, setView] = useState("grid");
  const [availability, setAvailability] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [priceMax, setPriceMax] = useState(3000);
  const [sort, setSort] = useState("newest");
  const [q, setQ] = useState("");

  const { products: all, loading } = useAllProducts();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = all.filter((p) => {
    if (type !== "all" && p.__sourceType !== type) return false;
      const meta = deriveProductMeta(p);
      if (availability === "in" && !meta.inStock) return false;
      if (availability === "out" && meta.inStock) return false;
      if (meta.rating < minRating) return false;
      const price = parsePrice(p.price);
      if (price > priceMax) return false;
      if (query) {
        const hay = `${p.company || ""} ${p.brand || ""} ${p.model || ""} ${p.title || ""} ${p.category || ""}`
          .toLowerCase()
          .trim();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    const sorted = [...base];
    if (sort === "price-low") sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sort === "rating") sorted.sort((a, b) => deriveProductMeta(b).rating - deriveProductMeta(a).rating);
    if (sort === "newest") sorted.sort((a, b) => Number(b.id) - Number(a.id));

    return sorted;
  }, [all, availability, minRating, priceMax, q, sort, type]);

  return (
    <>
      <Navbar />
      <div className="productsWrap">
        <div className="productsHeader">
          <h2>{sourceLabel}</h2>
          <div className="catalogRight">
            <input
              className="catalogSearch"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
            />
            <div className="viewToggle">
              <button
                type="button"
                className={view === "grid" ? "toggleBtn active" : "toggleBtn"}
                onClick={() => setView("grid")}
              >
                Grid
              </button>
              <button
                type="button"
                className={view === "list" ? "toggleBtn active" : "toggleBtn"}
                onClick={() => setView("list")}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="productsLayout">
          <aside className="filters">
            <h3>Filters</h3>

            <label className="filterRow">
              Price up to: ${priceMax}
              <input
                type="range"
                min={0}
                max={3000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
              />
            </label>

            <label className="filterRow">
              Ratings ⭐
              <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
                <option value={0}>All</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={5}>5</option>
              </select>
            </label>

            <label className="filterRow">
              Availability
              <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </label>

            <label className="filterRow">
              Sorting
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="price-low">Price Low → High</option>
                <option value="newest">Newest</option>
                <option value="rating">Best Rating</option>
              </select>
            </label>
          </aside>

          <main className={view === "grid" ? "productsGrid" : "productsList"}>
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : filtered.length === 0 ? (
              <div className="emptyState">
                <div className="emptyAnim" />
                <h3>No products found</h3>
                <p>Try changing filters/search.</p>
              </div>
            ) : (
              filtered.map((p) => (
                <ProductCard
                  key={`${p.__sourceType}-${p.id}`}
                  product={p}
                  wished={isWished(p)}
                  onToggleWishlist={(prod) => {
                    const wasWished = isWished(prod);
                    toggleWishlist(prod);
                    showToast(wasWished ? "Removed from wishlist" : "Added to wishlist", "info");
                  }}
                  onAddToCart={(prod) => {
                    addToCart(prod, 1);
                    showToast("Added to cart", "success");
                  }}
                />
              ))
            )}
          </main>
        </div>
      </div>
    </>
  );
}
