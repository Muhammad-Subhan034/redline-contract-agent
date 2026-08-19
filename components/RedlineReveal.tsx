"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function RedlineReveal() {
  const strikeRef = useRef<HTMLSpanElement>(null);
  const insertRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(strikeRef.current, { scaleX: 1 });
      gsap.set(insertRef.current, { opacity: 1, y: 0 });
      gsap.set(badgeRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(strikeRef.current, { scaleX: 0 });
    gsap.set(insertRef.current, { opacity: 0, y: 4 });
    gsap.set(badgeRef.current, { opacity: 0, y: 6 });

    const tl = gsap.timeline({ delay: 0.6 });
    tl.to(strikeRef.current, { scaleX: 1, duration: 0.7, ease: "power2.inOut" })
      .to(insertRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "+=0.2")
      .to(badgeRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.1");

    const failsafe = window.setTimeout(() => {
      if (tl.progress() < 1) tl.progress(1);
    }, 3500);

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
    };
  }, []);

  return (
    <div className="w-full max-w-md rounded-sm border border-ink/15 bg-white p-7">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
        Clause 8.2 — Limitation of Liability
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink">
        In no event shall either party&rsquo;s liability exceed{" "}
        <span className="relative inline-block">
          <span className="relative z-10">the total fees paid in the prior 12 months</span>
          <span
            ref={strikeRef}
            className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left bg-delete"
            aria-hidden="true"
          />
        </span>
        .
      </p>
      <span ref={insertRef} className="mt-2 block text-[15px] leading-relaxed text-insert">
        In no event shall either party&rsquo;s liability exceed{" "}
        <strong>two times the total fees paid in the prior 12 months</strong>.
      </span>
      <div
        ref={badgeRef}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-risk-medium-soft px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-risk-medium"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-risk-medium" />
        Medium risk — below playbook floor
      </div>
    </div>
  );
}
