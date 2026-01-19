import React from "react";

export default function SoftCursor() {
  const [enabled, setEnabled] = React.useState(false);
  const cursorRef = React.useRef(null);
  const targetRef = React.useRef({ x: 0, y: 0 });
  const posRef = React.useRef({ x: 0, y: 0 });
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    const canUseFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    setEnabled(Boolean(canUseFinePointer));
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    const onMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      rafRef.current = 0;
      const el = cursorRef.current;
      if (!el) return;

      const target = targetRef.current;
      const pos = posRef.current;

      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      posRef.current = pos;

      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div className="softCursor" ref={cursorRef} aria-hidden="true" />;
}
