import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAllProducts } from "../hooks/useAllProducts";
import { createProduct, deleteProduct } from "../api/products";
import { formatCurrency, parsePrice } from "../utils/product";
import { PRODUCT_SOURCES } from "../data/allProducts";

export default function AdminPage() {
  const { listUsers, setUserRole, token } = useAuth();
  const { showToast } = useToast();

  const location = useLocation();
  const navigate = useNavigate();

  const routeTab = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/admin/users")) return "users";
    if (p.startsWith("/admin/dashboard")) return "analytics";
    return "products";
  }, [location.pathname]);

  const [tab, setTab] = useState(routeTab);

  useEffect(() => {
    setTab(routeTab);
  }, [routeTab]);

  useEffect(() => {
    // When mounted at /admin, redirect to /admin/dashboard for a clear entry point.
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  const { products: allProducts, refresh: refreshProducts } = useAllProducts();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [form, setForm] = useState({
    type: "mobiles",
    id: "",
    title: "",
    brand: "",
    model: "",
    price: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    let alive = true;
    if (tab !== "users") return;
    if (!token) return;

    setUsersLoading(true);
    listUsers()
      .then((list) => {
        if (!alive) return;
        setUsers(Array.isArray(list) ? list : []);
        setUsersLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setUsers([]);
        setUsersLoading(false);
        showToast(e?.message || "Failed to load users", "error");
      });

    return () => {
      alive = false;
    };
  }, [tab, token, listUsers, showToast]);

  const analytics = useMemo(() => {
    const totalProducts = allProducts.length;
    const totalUsers = users.length;
    const inventoryValue = allProducts.reduce((sum, p) => sum + parsePrice(p.price), 0);
    return { totalProducts, totalUsers, inventoryValue };
  }, [allProducts, users.length]);

  return (
    <>
      <AdminNavbar />
      <div className="productsWrap">
        <div className="adminHeader">
          <div>
            <div className="adminTitleRow">
              <h2>Admin Panel</h2>
              <span className="adminBadge">Admin</span>
            </div>
            <div className="muted">Manage products and users.</div>
          </div>

          <div className="adminChips" aria-label="Admin summary">
            <div className="adminChip">
              <div className="adminChipLabel">Products</div>
              <div className="adminChipValue">{analytics.totalProducts}</div>
            </div>
            <div className="adminChip">
              <div className="adminChipLabel">Users</div>
              <div className="adminChipValue">{analytics.totalUsers}</div>
            </div>
            <div className="adminChip">
              <div className="adminChipLabel">Catalog value</div>
              <div className="adminChipValue">{formatCurrency(analytics.inventoryValue)}</div>
            </div>
          </div>
        </div>

        <div className="adminLayout">
          <aside className="adminMenu" aria-label="Admin navigation">
            <NavLink to="/admin/dashboard" className="custom-link">
              <button type="button" className={tab === "analytics" ? "adminMenuBtn active" : "adminMenuBtn"}>Dashboard</button>
            </NavLink>
            <NavLink to="/admin/products" className="custom-link">
              <button type="button" className={tab === "products" ? "adminMenuBtn active" : "adminMenuBtn"}>Products</button>
            </NavLink>
            <NavLink to="/admin/users" className="custom-link">
              <button type="button" className={tab === "users" ? "adminMenuBtn active" : "adminMenuBtn"}>Users</button>
            </NavLink>
            <NavLink to="/admin/orders" className="custom-link">
              <button type="button" className="adminMenuBtn">Orders</button>
            </NavLink>
          </aside>

          <main className="adminPanel">
            {tab === "products" ? (
              <div className="adminGrid">
                <div className="adminCard">
                  <h3>Add Product</h3>
                  <div className="adminForm">
                <label>
                  Type
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {PRODUCT_SOURCES.map((s) => (
                      <option key={s.type} value={s.type}>
                        {s.label}
                      </option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                </label>
                <label>
                  Product ID (optional)
                  <input value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} placeholder="auto-generated if empty" />
                </label>
                <label>
                  Title
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Apple iPhone 13 Pro" />
                </label>
                <label>
                  Brand
                  <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
                </label>
                <label>
                  Model
                  <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
                </label>
                <label>
                  Price
                  <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </label>
                <label>
                  Image URL
                  <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="/assets/... or https://..." />
                </label>
                <label>
                  Description
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                </label>

                <button
                  className="btnPrimary"
                  type="button"
                  onClick={async () => {
                    try {
                      if (!token) {
                        showToast("Please login as admin", "error");
                        return;
                      }
                      const priceNum = Number(form.price);
                      if (!form.title || !Number.isFinite(priceNum)) {
                        showToast("Title and valid price are required", "error");
                        return;
                      }
                      const id = form.id?.trim() || `a-${Date.now()}`;
                      const type = form.type === "custom" ? "custom" : form.type;
                      await createProduct(token, {
                        type,
                        id,
                        title: form.title,
                        brand: form.brand || null,
                        model: form.model || null,
                        description: form.description || null,
                        image:
                          form.image && !form.image.startsWith("/") && !form.image.startsWith("http")
                            ? `/${form.image}`
                            : form.image || null,
                        price: priceNum,
                      });
                      setForm({ type: "mobiles", id: "", title: "", brand: "", model: "", price: "", image: "", description: "" });
                      showToast("Product added", "success");
                      refreshProducts();
                    } catch (e) {
                      showToast(e?.message || "Failed to add product", "error");
                    }
                  }}
                >
                  Add
                </button>
                  </div>
                </div>

                <div className="adminCard">
                  <h3>Manage Products</h3>
                  {allProducts.length === 0 ? (
                    <div className="muted">No products found.</div>
                  ) : (
                    <div className="adminList">
                      {allProducts.slice(0, 80).map((p) => (
                        <div key={p.key || `${p.__sourceType}-${p.id}`} className="adminRow">
                          <div className="adminRowTitle">{p.title || p.model || "Product"}</div>
                          <div className="muted">{formatCurrency(parsePrice(p.price))}</div>
                          <button
                            type="button"
                            className="btnGhost"
                            onClick={async () => {
                              try {
                                if (!token) {
                                  showToast("Please login as admin", "error");
                                  return;
                                }
                                await deleteProduct(token, p.key || `${p.__sourceType}:${p.id}`);
                                showToast("Product deleted", "success");
                                refreshProducts();
                              } catch (e) {
                                showToast(e?.message || "Failed to delete", "error");
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {tab === "users" ? (
              <div className="adminCard">
                <h3>Manage Users</h3>
                <div className="adminList">
                  {usersLoading ? (
                    <div className="muted">Loading users…</div>
                  ) : (
                    users.map((u) => (
                      <div key={u.id} className="adminRow">
                        <div className="adminRowTitle">
                          {u.name} <span className="muted">({u.email})</span>
                        </div>
                        <select
                          value={u.role}
                          onChange={async (e) => {
                            try {
                              await setUserRole(u.id, e.target.value);
                              showToast("Role updated", "success");
                            } catch (err) {
                              showToast(err?.message || "Failed to update role", "error");
                            }
                          }}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    ))
                  )}
                </div>
                <div className="authHint">Users and roles are managed by the backend API.</div>
              </div>
            ) : null}

            {tab === "analytics" ? (
              <div className="adminCard">
                <h3>Analytics</h3>
                <div className="analyticsGrid">
                  <div className="metric"><div className="metricLabel">Total products</div><div className="metricValue">{analytics.totalProducts}</div></div>
                  <div className="metric"><div className="metricLabel">Users</div><div className="metricValue">{analytics.totalUsers}</div></div>
                  <div className="metric"><div className="metricLabel">Catalog value</div><div className="metricValue">{formatCurrency(analytics.inventoryValue)}</div></div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
