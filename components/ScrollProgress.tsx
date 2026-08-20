"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** A thin bar that draws itself across the top as you scroll — literally a
 *  redline being struck through the page, the site's own reading progress. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const setWidth = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = `${pct}%`;
    };

    setWidth();
    ScrollTrigger.addEventListener("scrollEnd", setWidth);
    window.addEventListener("scroll", setWidth, { passive: true });
    window.addEventListener("resize", setWidth);

    return () => {
      ScrollTrigger.removeEventListener("scrollEnd", setWidth);
      window.removeEventListener("scroll", setWidth);
      window.removeEventListener("resize", setWidth);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-[70] h-[2px] w-full bg-transparent" aria-hidden="true">
      <div ref={barRef} className="h-full bg-delete transition-[width] duration-100 ease-out" />
    </div>
  );
}
