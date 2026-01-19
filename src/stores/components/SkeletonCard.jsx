import React from "react";

export default function SkeletonCard() {
  return (
    <div className="productCard skeleton">
      <div className="cardImg sk" />
      <div className="cardContent">
        <div className="sk sk-line" />
        <div className="sk sk-line short" />
        <div className="sk sk-line" />
        <div className="sk sk-btn" />
      </div>
    </div>
  );
}
