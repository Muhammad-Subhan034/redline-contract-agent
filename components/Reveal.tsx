"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export default function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  delay?: number;
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
    gsap.set(el, { opacity: 0, y: 28 });

    let fired = false;
    const reveal = () => {
      if (fired) return;
      fired = true;
      gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay });
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
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
