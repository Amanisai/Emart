import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import RatingStars from "../components/RatingStars";
import { deriveProductMeta, formatCurrency, getProductTitle, parsePrice } from "../utils/product";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { useAllProducts } from "../hooks/useAllProducts";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

export default function ProductDetailsPage() {
  const { type, id } = useParams();
  const { products: all, loading } = useAllProducts();
  const product = all.find((p) => p.__sourceType === type && String(p.id) === String(id));

  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { showToast } = useToast();

  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("desc");
  const [qty, setQty] = useState(1);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="productsWrap">
          <div className="emptyState">
            <h3>Loading product…</h3>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="productsWrap">
          <div className="emptyState">
            <h3>Product not found</h3>
          </div>
        </div>
      </>
    );
  }

  const meta = deriveProductMeta(product);
  const price = parsePrice(product.price);
  const discounted = meta.discountPercent ? price * (1 - meta.discountPercent / 100) : price;

  const images = product.images && product.images.length ? product.images : [product.image];

  const related = all
    .filter((p) => p.__sourceType === product.__sourceType && p.id !== product.id)
    .slice(0, 6);

  return (
    <>
      <Navbar />
      <div className="productsWrap">
        <div className="detailsLayout">
          <div className="detailsLeft">
            <div className="zoomBox">
              <img src={images[activeImg]} alt={getProductTitle(product)} />
            </div>
            <div className="thumbRow">
              {images.map((src, idx) => (
                <button
                  key={src + idx}
                  type="button"
                  className={idx === activeImg ? "thumb active" : "thumb"}
                  onClick={() => setActiveImg(idx)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="detailsRight">
            <h2>{getProductTitle(product)}</h2>
            <RatingStars rating={meta.rating} />

            <div className="priceRow big">
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

            <div className="qtyRow">
              <span>Quantity</span>
              <div className="qtyControl">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>

            <div className="detailsActions">
              <button
                className="btnPrimary"
                type="button"
                disabled={!meta.inStock}
                onClick={() => {
                  addToCart(product, qty);
                  showToast("Added to cart", "success");
                }}
              >
                <FiShoppingCart aria-hidden="true" /> Add to Cart
              </button>
              <button
                className="btnGhost"
                type="button"
                onClick={() => {
                  const wasWished = has(product);
                  toggle(product);
                  showToast(wasWished ? "Removed from wishlist" : "Added to wishlist", "info");
                }}
              >
                {has(product) ? <FaHeart aria-hidden="true" /> : <FiHeart aria-hidden="true" />} {has(product) ? "Wishlisted" : "Wishlist"}
              </button>
            </div>

            <div className="tabs">
              <button type="button" className={tab === "desc" ? "tab active" : "tab"} onClick={() => setTab("desc")}>
                Description
              </button>
              <button type="button" className={tab === "spec" ? "tab active" : "tab"} onClick={() => setTab("spec")}>
                Specifications
              </button>
              <button type="button" className={tab === "rev" ? "tab active" : "tab"} onClick={() => setTab("rev")}>
                Reviews
              </button>
            </div>

            {tab === "desc" ? <p className="tabPanel">{product.description || ""}</p> : null}
            {tab === "spec" ? (
              <div className="tabPanel">
                <ul className="specList">
                  <li>Category: {product.category || product.__sourceLabel}</li>
                  <li>Model: {product.model || product.title || ""}</li>
                </ul>
              </div>
            ) : null}
            {tab === "rev" ? (
              <div className="tabPanel">
                <p>No reviews yet.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relatedWrap">
          <h3>Related products</h3>
          <div className="productsGrid">
            {related.map((p) => (
              <div key={`${p.__sourceType}-${p.id}`} className="relatedCard">
                <Link to={`/product/${p.__sourceType}/${p.id}`} className="custom-link">
                  <img src={p.image} alt={getProductTitle(p)} />
                  <div className="relatedTitle">{getProductTitle(p)}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
