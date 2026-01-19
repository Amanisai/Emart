import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { adminListOrders } from "../api/orders";
import { formatCurrency } from "../utils/product";

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!token) return;

    setLoading(true);
    adminListOrders(token)
      .then((list) => {
        if (!alive) return;
        setOrders(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setOrders([]);
        setLoading(false);
        showToast(e?.message || "Failed to load orders", "error");
      });

    return () => {
      alive = false;
    };
  }, [token, showToast]);

  return (
    <>
      <AdminNavbar />
      <div className="productsWrap">
        <div className="adminHeader">
          <div>
            <div className="adminTitleRow">
              <h2>Orders</h2>
              <span className="adminBadge">Admin</span>
            </div>
            <div className="muted">All customer orders (read-only).</div>
          </div>
        </div>

        <div className="adminLayout">
          <aside className="adminMenu" aria-label="Admin navigation">
            <NavLink to="/admin/dashboard" className="custom-link">
              <button type="button" className="adminMenuBtn">Dashboard</button>
            </NavLink>
            <NavLink to="/admin/products" className="custom-link">
              <button type="button" className="adminMenuBtn">Products</button>
            </NavLink>
            <NavLink to="/admin/users" className="custom-link">
              <button type="button" className="adminMenuBtn">Users</button>
            </NavLink>
            <NavLink to="/admin/orders" className="custom-link">
              <button type="button" className="adminMenuBtn active">Orders</button>
            </NavLink>
          </aside>

          <main className="adminPanel">
            <div className="adminCard">
              <h3>All Orders</h3>
              {loading ? (
                <div className="muted">Loading orders…</div>
              ) : orders.length === 0 ? (
                <div className="muted">No orders found.</div>
              ) : (
                <div className="adminList">
                  {orders.map((o) => (
                    <div key={o.id} className="adminRow">
                      <div>
                        <div className="adminRowTitle">#{o.id}</div>
                        <div className="muted">
                          {o.user?.email} • {o.status}
                          {o.paymentStatus ? ` • ${o.paymentStatus}` : ""}
                        </div>
                      </div>
                      <div style={{ fontWeight: 900 }}>{formatCurrency(Number(o.total || 0))}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
