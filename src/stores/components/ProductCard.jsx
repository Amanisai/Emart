import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiHeart, FiShoppingCart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import RatingStars from "./RatingStars";
import QuickViewModal from "./QuickViewModal";
import { deriveProductMeta, formatCurrency, getProductTitle, parsePrice } from "../utils/product";

export default function ProductCard({ product, onAddToCart, onToggleWishlist, wished }) {
  const [quickOpen, setQuickOpen] = useState(false);

  const meta = useMemo(() => deriveProductMeta(product), [product]);
  const price = parsePrice(product.price);
  const discounted = meta.discountPercent ? price * (1 - meta.discountPercent / 100) : price;

  return (
    <div className="productCard">
      <Link to={`/product/${product.__sourceType}/${product.id}`} className="custom-link">
        <div className="cardImg">
          <img src={product.image} alt={getProductTitle(product)} loading="lazy" decoding="async" />
        </div>
      </Link>

      <div className="cardContent">
        <div className="cardTitle" title={getProductTitle(product)}>
          {getProductTitle(product)}
        </div>

        <div className="priceRow">
          <span className="priceNow">{formatCurrency(discounted)}</span>
          {meta.discountPercent ? (
            <>
              <span className="priceOld">{formatCurrency(price)}</span>
              <span className="discountBadge">-{meta.discountPercent}%</span>
            </>
          ) : null}
        </div>

        <RatingStars rating={meta.rating} />

        <div className={meta.inStock ? "stock in" : "stock out"}>
          {meta.inStock ? "In Stock" : "Out of Stock"}
        </div>

        <div className="cardActions">
          <button className="btnPrimary" type="button" onClick={() => onAddToCart?.(product)} disabled={!meta.inStock}>
            <FiShoppingCart aria-hidden="true" /> Add to Cart
          </button>
          <button className="btnGhost" type="button" onClick={() => onToggleWishlist?.(product)}>
            {wished ? <FaHeart aria-hidden="true" /> : <FiHeart aria-hidden="true" />} Wishlist
          </button>
          <button className="btnGhost" type="button" onClick={() => setQuickOpen(true)}>
            <FiEye aria-hidden="true" /> Quick View
          </button>
        </div>
      </div>

      <QuickViewModal
        open={quickOpen}
        product={product}
        onClose={() => setQuickOpen(false)}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        wished={wished}
      />
    </div>
  );
}
