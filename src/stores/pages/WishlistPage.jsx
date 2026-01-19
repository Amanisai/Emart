import React, { useMemo } from "react";
import Navbar from "../components/Navbar";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getProductKey } from "../utils/product";
import { useAllProducts } from "../hooks/useAllProducts";

export default function WishlistPage() {
  const { wishlistKeys, has, remove, toggle } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const { products: all } = useAllProducts();

  const wishlistProducts = useMemo(() => {
    const keySet = new Set(wishlistKeys);
    return all.filter((p) => keySet.has(getProductKey(p)));
  }, [all, wishlistKeys]);

  return (
    <>
      <Navbar />
      <div className="productsWrap">
        <div className="productsHeader">
          <h2>Wishlist</h2>
        </div>

        {wishlistKeys.length === 0 ? (
          <div className="emptyState">
            <div className="emptyAnim" />
            <h3>Your wishlist is empty</h3>
            <p>Add items you love and come back here.</p>
          </div>
        ) : (
          <div className="productsGrid">
            {wishlistProducts.map((p) => (
              <ProductCard
                key={`${p.__sourceType}-${p.id}`}
                product={p}
                wished={has(p)}
                onToggleWishlist={(prod) => {
                  toggle(prod);
                  showToast("Updated wishlist", "info");
                }}
                onAddToCart={(prod) => {
                  addToCart(prod, 1);
                  remove(prod);
                  showToast("Moved to cart", "success");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
