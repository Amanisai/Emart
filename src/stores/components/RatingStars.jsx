import React from "react";

const Star = ({ filled }) => (
  <span className={filled ? "star star-filled" : "star"} aria-hidden="true">★</span>
);

export default function RatingStars({ rating = 0 }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <div className="rating" aria-label={`Rating ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= rounded} />
      ))}
      <span className="rating-num">{Number(rating).toFixed(1)}</span>
    </div>
  );
}
