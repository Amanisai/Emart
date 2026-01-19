import React, { useEffect, useState } from "react";

const OFFERS = [
  "New Year Deals: Up to 15% off",
  "Free delivery on selected items",
  "Limited-time offers — grab them now",
];

export default function OfferBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setIdx((i) => (i + 1) % OFFERS.length), 2800);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="offerBanner" role="region" aria-label="Offers">
      <div className="offerInner">{OFFERS[idx]}</div>
    </div>
  );
}
