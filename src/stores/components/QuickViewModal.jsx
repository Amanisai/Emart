import React, { useEffect } from "react";
import RatingStars from "./RatingStars";
import { deriveProductMeta, formatCurrency, getProductTitle, parsePrice } from "../utils/product";

export default function QuickViewModal({ open, product, onClose, onAddToCart, onToggleWishlist, wished }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !product) return null;

  const meta = deriveProductMeta(product);
  const price = parsePrice(product.price);
  const discounted = meta.discountPercent ? price * (1 - meta.discountPercent / 100) : price;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modalClose" type="button" onClick={onClose} aria-label="Close">×</button>
        <div className="modalBody">
          <div className="modalImg">
            <img src={product.image} alt={getProductTitle(product)} />
          </div>
          <div className="modalInfo">
            <h3 className="cardTitle">{getProductTitle(product)}</h3>
            <RatingStars rating={meta.rating} />
            <div className="priceRow">
              <span className="priceNow">{formatCurrency(discounted)}</span>
              {meta.discountPercent ? (
                <>
                  <span className="priceOld">{formatCurrency(price)}</span>
                  <span className="discountBadge">-{meta.discountPercent}%</span>
                </>
              ) : null}
            </div>
            <div className={meta.inStock ? "stock in" : "stock out"}>
              {meta.inStock ? "In Stock" : "Out of Stock"}
            </div>
            <p className="modalDesc">{product.description || ""}</p>
            <div className="cardActions">
              <button className="btnPrimary" type="button" onClick={() => onAddToCart?.(product)} disabled={!meta.inStock}>
                🛒 Add to Cart
              </button>
              <button className="btnGhost" type="button" onClick={() => onToggleWishlist?.(product)}>
                {wished ? "❤️ Wishlisted" : "❤️ Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
