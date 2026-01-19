import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProductKey, parsePrice } from "../utils/product";

const CartContext = createContext();

const STORAGE_KEY = "ecommerce.cart";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setCartItems(parsed);
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    const key = getProductKey(product);
    const quantity = Math.max(1, Number(qty) || 1);
    setCartItems((prev) => {
      const existing = prev.find((x) => x.key === key);
      if (!existing) return [...prev, { key, item: product, quantity }];
      return prev.map((x) => (x.key === key ? { ...x, quantity: x.quantity + quantity } : x));
    });
  };

  const removeFromCart = (productOrKey) => {
    const key = typeof productOrKey === "string" ? productOrKey : getProductKey(productOrKey);
    setCartItems((prev) => prev.filter((x) => x.key !== key));
  };

  const increaseQty = (productOrKey, by = 1) => {
    const key = typeof productOrKey === "string" ? productOrKey : getProductKey(productOrKey);
    const inc = Math.max(1, Number(by) || 1);
    setCartItems((prev) => prev.map((x) => (x.key === key ? { ...x, quantity: x.quantity + inc } : x)));
  };

  const decreaseQty = (productOrKey, by = 1) => {
    const key = typeof productOrKey === "string" ? productOrKey : getProductKey(productOrKey);
    const dec = Math.max(1, Number(by) || 1);
    setCartItems((prev) =>
      prev
        .map((x) => (x.key === key ? { ...x, quantity: x.quantity - dec } : x))
        .filter((x) => x.quantity > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, x) => sum + parsePrice(x?.item?.price) * (x.quantity || 0), 0);
    return { subtotal };
  }, [cartItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, x) => sum + (x.quantity || 0), 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        totals,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
