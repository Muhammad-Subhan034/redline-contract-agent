"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";

/** Tilt + sheen-sweep + accent glow for genuinely clickable cards — reserved
 *  for real links/buttons so the affordance stays honest. The glow color is
 *  passed in per instance (delete/insert/ink) so each surface reads with
 *  Redline's own restrained two-color accent system, never a foreign hue. */
export default function TiltCard({
  children,
  className,
  glow = "var(--ink)",
  tilt = 5,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  tilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion || coarsePointer) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: py * -tilt,
      rotateY: px * tilt,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 900,
    });
  }

  function onMouseLeave() {
    const card = ref.current;
    if (!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ "--glow-color": glow } as CSSProperties}
      className={`tilt-card group relative [transform-style:preserve-3d] ${className ?? ""}`}
    >
      <span aria-hidden="true" className="tilt-sheen" />
      {children}
    </div>
  );
}
