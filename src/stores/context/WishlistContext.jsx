import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProductKey } from "../utils/product";

const WishlistContext = createContext(null);

const STORAGE_KEY = "ecommerce.wishlist";

export function WishlistProvider({ children }) {
  const [wishlistKeys, setWishlistKeys] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setWishlistKeys(parsed);
    } catch {
      setWishlistKeys([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistKeys));
  }, [wishlistKeys]);

  const value = useMemo(() => {
    const has = (productOrKey) => {
      const key = typeof productOrKey === "string" ? productOrKey : getProductKey(productOrKey);
      return wishlistKeys.includes(key);
    };

    const add = (product) => {
      const key = getProductKey(product);
      setWishlistKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    };

    const remove = (productOrKey) => {
      const key = typeof productOrKey === "string" ? productOrKey : getProductKey(productOrKey);
      setWishlistKeys((prev) => prev.filter((k) => k !== key));
    };

    const toggle = (product) => {
      const key = getProductKey(product);
      setWishlistKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    };

    return {
      wishlistKeys,
      wishlistCount: wishlistKeys.length,
      has,
      add,
      remove,
      toggle,
    };
  }, [wishlistKeys]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
