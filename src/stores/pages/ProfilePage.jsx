import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { formatCurrency } from "../utils/product";
import { listOrders } from "../api/orders";

export default function ProfilePage() {
  const { user, logout, token, role } = useAuth();
  const { wishlistCount } = useWishlist();
  const [section, setSection] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!token) return;

    setOrdersLoading(true);
    listOrders(token)
      .then((data) => {
        if (!alive) return;
        setOrders(Array.isArray(data) ? data : []);
        setOrdersLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setOrders([]);
        setOrdersLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <>
      <Navbar />
      <div className="productsWrap">
        <div className="profileHeader">
          <h2>User Profile Dashboard</h2>
          <div className="profileMeta">
            <div><strong>{user?.name || "User"}</strong></div>
            <div className="muted">{user?.email}</div>
          </div>
        </div>

        <div className="profileLayout">
          <aside className="profileMenu">
            {role === "admin" ? (
              <Link to="/admin" className="custom-link">
                <button type="button" className="menuBtn">Open Admin Panel</button>
              </Link>
            ) : null}
            <button type="button" className={section === "orders" ? "menuBtn active" : "menuBtn"} onClick={() => setSection("orders")}>
              My Orders
            </button>
            <button type="button" className={section === "addr" ? "menuBtn active" : "menuBtn"} onClick={() => setSection("addr")}>
              Saved Addresses
            </button>
            <button type="button" className={section === "wish" ? "menuBtn active" : "menuBtn"} onClick={() => setSection("wish")}>
              Wishlist ({wishlistCount})
            </button>
            <button type="button" className="menuBtn" onClick={logout}>
              Logout
            </button>
          </aside>

          <main className="profilePanel">
            {section === "orders" ? (
              <div>
                <h3>My Orders</h3>
                {ordersLoading ? (
                  <p className="muted">Loading orders…</p>
                ) : orders.length === 0 ? (
                  <p className="muted">No orders yet. Complete checkout to see orders here.</p>
                ) : (
                  <div className="adminList">
                    {orders.map((o) => (
                      <div key={o.id} className="adminRow">
                        <div className="adminRowTitle">{o.id}</div>
                        <div className="muted">{o.status} • {formatCurrency(Number(o.total || 0))}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {section === "addr" ? (
              <div>
                <h3>Saved Addresses</h3>
                <p className="muted">Address book (demo placeholder).</p>
              </div>
            ) : null}

            {section === "wish" ? (
              <div>
                <h3>Wishlist</h3>
                <p className="muted">Go to Wishlist page to manage items.</p>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
