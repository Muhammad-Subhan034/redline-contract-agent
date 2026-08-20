"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import RedlineReveal from "./RedlineReveal";
import ClauseScanField from "./ClauseScanField";

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const masks = rootRef.current?.querySelectorAll<HTMLElement>(".mask i") ?? [];
    const rest = rootRef.current?.querySelectorAll<HTMLElement>("[data-hero-fade]") ?? [];

    if (reduceMotion) return;

    gsap.set(masks, { yPercent: 110 });
    gsap.set(rest, { opacity: 0, y: 16 });

    document.documentElement.style.overflow = "hidden";
    const release = () => {
      document.documentElement.style.overflow = "";
    };

    const tl = gsap.timeline({ delay: 0.15, onComplete: release });
    tl.to(masks, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.045 });
    tl.fromTo(
      rest,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 },
      "-=0.6"
    );

    const failsafe = window.setTimeout(() => {
      if (tl.progress() < 1) tl.progress(1);
      release();
    }, 2500);

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
      release();
    };
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden">
      <ClauseScanField />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p
              data-hero-fade
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-delete" />
              Every suggestion cites its source clause
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl">
              <span className="mask">
                <i>Redlines that</i>
              </span>
              <br />
              <span className="mask">
                <i>cite their source.</i>
              </span>
            </h1>
            <p data-hero-fade className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
              Redline classifies every clause against your playbook, scores its
              risk, and drafts a suggested edit — linked back to the exact
              standard it deviates from. No black-box opinions.
            </p>
            <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/review"
                className="group relative overflow-hidden rounded-sm bg-ink px-6 py-3 font-mono text-[13px] uppercase tracking-wide text-paper transition-transform hover:-translate-y-0.5"
              >
                <span className="tilt-sheen" aria-hidden="true" />
                <span className="relative">Review a contract →</span>
              </Link>
              <Link
                href="/playbook"
                className="group relative overflow-hidden rounded-sm border border-ink/25 px-6 py-3 font-mono text-[13px] uppercase tracking-wide text-ink transition-colors hover:bg-paper-dim"
              >
                <span className="tilt-sheen" aria-hidden="true" />
                <span className="relative">View the playbook</span>
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <RedlineReveal />
          </div>
        </div>
      </div>
    </section>
  );
}
