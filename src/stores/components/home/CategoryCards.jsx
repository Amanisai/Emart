import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiShoppingCart, FiSmartphone, FiWatch } from "react-icons/fi";

const CATS = [
  { title: "Electronics", hint: "Mobiles, Computers, TV", to: "/mobiles", Icon: FiSmartphone },
  { title: "Fashion", hint: "Men & Women", to: "/men", Icon: FiWatch },
  { title: "Groceries", hint: "Kitchen essentials", to: "/kitchen", Icon: FiShoppingCart },
  { title: "Home", hint: "Furniture & More", to: "/furniture", Icon: FiHome },
];

export default function CategoryCards() {
  return (
    <section className="catSection" id="home-categories">
      <h2 className="catHeading">Explore by Category</h2>
      <div className="catGrid">
        {CATS.map((c) => (
          <Link key={c.title} to={c.to} className="custom-link">
            <div className="catCard">
              <div className="catIcon" aria-hidden="true"><c.Icon /></div>
              <div className="catTitle">{c.title}</div>
              <div className="catHint">{c.hint}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
