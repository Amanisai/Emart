import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllProducts } from "../api/products";
import { getAllProducts } from "../data/allProducts";

export function useAllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchAllProducts({}).then(
      (list) => {
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        if (controller.signal.aborted) return;
        setError(err);
        // Fallback to bundled data so the UI still works without the API during dev.
        setProducts(getAllProducts());
        setLoading(false);
      }
    );

    return () => controller.abort();
  }, [rev]);

  const refresh = useCallback(() => setRev((r) => r + 1), []);

  return useMemo(() => ({ products, loading, error, refresh }), [products, loading, error, refresh]);
}
