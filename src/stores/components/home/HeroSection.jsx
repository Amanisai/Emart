import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiLock, FiRefreshCw, FiShoppingBag, FiTruck, FiZap } from "react-icons/fi";

const TEXTS = [
  "Fast delivery.",
  "Smart deals.",
  "Trending picks.",
];

export default function HeroSection() {
  const [textIdx, setTextIdx] = useState(0);
  const [typed, setTyped] = useState("");

  const current = useMemo(() => TEXTS[textIdx], [textIdx]);

  useEffect(() => {
    let i = 0;
    setTyped("");

    const typeTimer = window.setInterval(() => {
      i += 1;
      setTyped(current.slice(0, i));
      if (i >= current.length) {
        window.clearInterval(typeTimer);
        window.setTimeout(() => setTextIdx((x) => (x + 1) % TEXTS.length), 900);
      }
    }, 55);

    return () => window.clearInterval(typeTimer);
  }, [current]);

  return (
    <section className="hero">
      <div className="heroBg">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="particle" style={{ "--i": i }} />
        ))}
      </div>

      <div className="heroContent">
        <div className="heroInner">
          <div className="heroLeft">
            <h1>Your One-Stop Smart Shopping Platform</h1>

            <div className="heroTagline">
              <span className="tagItem"><FiZap aria-hidden="true" /> Fast Delivery</span>
              <span className="tagSep" aria-hidden="true">|</span>
              <span className="tagItem"><FiLock aria-hidden="true" /> Secure Payments</span>
              <span className="tagSep" aria-hidden="true">|</span>
              <span className="tagItem"><FiShoppingBag aria-hidden="true" /> Best Deals</span>
            </div>

            <p className="heroTyping" aria-label="Hero highlights">
              <span className="typed">{typed}</span>
              <span className="cursor" aria-hidden="true" />
            </p>

            <div className="heroCtas">
              <Link to="/products" className="custom-link">
                <button type="button" className="btnPrimary btnHeroPrimary">
                  Shop Now <FiArrowRight aria-hidden="true" />
                </button>
              </Link>
              <button
                type="button"
                className="btnGhost btnHeroGhost"
                onClick={() => document.getElementById("home-categories")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Categories
              </button>
            </div>

            <div className="heroTrust" aria-label="Store trust features">
              <div className="trustItem"><FiLock aria-hidden="true" /> Secure Payments</div>
              <div className="trustItem"><FiShoppingBag aria-hidden="true" /> 10K+ Products</div>
              <div className="trustItem"><FiTruck aria-hidden="true" /> Fast Delivery</div>
              <div className="trustItem"><FiRefreshCw aria-hidden="true" /> Easy Returns</div>
            </div>
          </div>

          <div className="heroVisual" aria-hidden="true">
            <div className="heroCollage">
              <img src="/assets/Landing/B1/1.jpg" alt="" loading="lazy" decoding="async" />
              <img src="/assets/Landing/B9/2.jpg" alt="" loading="lazy" decoding="async" />
              <img src="/assets/Landing/B7/1.jpg" alt="" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
