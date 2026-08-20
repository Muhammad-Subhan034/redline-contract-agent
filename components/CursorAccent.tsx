"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Mirrors globals.css --delete / --insert exactly. Passed as literal hex
// (not var(--x)) because GSAP's color interpolation parses the string
// itself and can't resolve a CSS custom property reference.
const DELETE = "#ae2a1c";
const INSERT = "#1d4ed8";

/** A trailing ring alongside the native cursor (never replaces it — no
 *  `cursor: none`). Reads as a red pen by default, and switches to insertion
 *  blue over anything clickable — "this is where the edit lands." Fine-pointer
 *  devices only, and skipped entirely under reduced motion. */
export default function CursorAccent() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduceMotion || !finePointer) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const moveDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power2.out" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power2.out" });
    const moveRing = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    let visible = false;
    function show() {
      if (visible) return;
      visible = true;
      gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
    }

    function onMove(e: MouseEvent) {
      show();
      moveDot(e.clientX);
      moveDotY(e.clientY);
      moveRing(e.clientX);
      moveRingY(e.clientY);
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, [role='button'], input, textarea, [data-cursor-hover]"
      );
      gsap.to(ring, {
        scale: interactive ? 1.9 : 1,
        opacity: interactive ? 0.55 : 0.85,
        borderColor: interactive ? INSERT : DELETE,
        duration: 0.25,
        ease: "power2.out",
      });
      gsap.to(dot, {
        backgroundColor: interactive ? INSERT : DELETE,
        duration: 0.25,
      });
    }

    function onLeaveWindow() {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-delete opacity-0 md:block"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-delete opacity-0 md:block"
      />
    </>
  );
}
