"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

type Variant = "fade-up" | "scale-in" | "clip-wipe";

const FROM: Record<Variant, gsap.TweenVars> = {
  "fade-up": { opacity: 0, y: 28 },
  "scale-in": { opacity: 0, scale: 0.94, y: 12 },
  // Reads as a redline pen drawing left-to-right across the line — the same
  // gesture as the strikethrough in RedlineReveal, reused as a page-wide motif.
  "clip-wipe": { opacity: 1, clipPath: "inset(0 100% 0 0)" },
};

const TO: Record<Variant, gsap.TweenVars> = {
  "fade-up": { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
  "scale-in": { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.6)" },
  "clip-wipe": { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power4.inOut" },
};

export default function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  variant = "fade-up",
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  delay?: number;
  variant?: Variant;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // CSS default is already the fully-visible end state

    // Hide it ourselves, synchronously, right before wiring up the reveal —
    // matches Hero.tsx's approach so a visitor without JS just sees the
    // finished layout rather than a permanently-hidden one.
    gsap.set(el, FROM[variant]);

    let fired = false;
    const reveal = () => {
      if (fired) return;
      fired = true;
      gsap.to(el, { ...TO[variant], delay });
    };

    // IntersectionObserver fires immediately for elements already in view on
    // mount — unlike ScrollTrigger's onEnter, which only fires on a transition
    // into view, so already-visible content wouldn't otherwise reveal itself
    // without an actual scroll event.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);

    // Safety net: guarantee visibility even if the observer never fires.
    const failsafe = window.setTimeout(reveal, 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delay, variant]);

  return (
    <Tag ref={ref} className={`reveal ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
