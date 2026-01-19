import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_SOURCES, getAllProducts } from "../../data/allProducts";
import ProductCard from "../ProductCard";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";

function Row({ type, title, items }) {
  const { addToCart } = useCart();
  const { has: isWished, toggle: toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  return (
    <section className="homeRow">
      <div className="homeRowHead">
        <h3>{title}</h3>
        <Link to={`/category/${type}`} className="custom-link">
          <span className="seeAll">See all</span>
        </Link>
      </div>
      <div className="homeRowScroll">
        {items.slice(0, 8).map((p) => (
          <div key={`${p.__sourceType}-${p.id}`} className="homeRowCard">
            <ProductCard
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
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomeCatalogRows() {
  const all = useMemo(() => getAllProducts(), []);

  const picks = PRODUCT_SOURCES.filter((s) =>
    ["mobiles", "computers", "men", "woman", "watch"].includes(s.type)
  );

  return (
    <div className="homeRowsWrap">
      {picks.map((s) => (
        <Row
          key={s.type}
          type={s.type}
          title={s.label}
          items={all.filter((p) => p.__sourceType === s.type)}
        />
      ))}
    </div>
  );
}
