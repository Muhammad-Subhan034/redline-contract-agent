"use client";

import { useEffect, useRef } from "react";

type Line = {
  y: number;
  xStart: number;
  width: number;
  flag: "none" | "delete" | "insert";
  markProgress: number;
};

// Mirrors globals.css tokens exactly — canvas fillStyle/strokeStyle can't
// read CSS custom properties, so the hexes are duplicated here as rgb().
const INK = "26, 26, 24";
const INK_SOFT = "87, 86, 79";
const DELETE = "174, 42, 28";
const INSERT = "29, 78, 216";

/** The hero's background — faint document rules being scanned top to bottom,
 *  the way Redline actually works: clause by clause, down the page. Most
 *  lines stay quiet ink-soft; every so often the scan settles on one and
 *  marks it — a short red strike or a blue underline — echoing the real
 *  redline card next to it instead of a decorative, unrelated animation. */
export default function ClauseScanField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let lines: Line[] = [];
    let scanY = -60;

    function layout() {
      const rowH = 15;
      const count = Math.ceil(height / rowH);
      lines = Array.from({ length: count }, (_, i) => {
        const margin = 24 + Math.random() * 40;
        const w = Math.max(40, width - margin * 2 - Math.random() * width * 0.35);
        return { y: i * rowH + rowH / 2, xStart: margin, width: w, flag: "none", markProgress: 0 };
      });
    }

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }

    resize();
    window.addEventListener("resize", resize);

    function drawStaticFrame() {
      ctx!.clearRect(0, 0, width, height);
      for (const line of lines) {
        ctx!.strokeStyle = `rgba(${INK}, 0.05)`;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(line.xStart, line.y);
        ctx!.lineTo(line.xStart + line.width, line.y);
        ctx!.stroke();
      }
    }

    if (reduceMotion) {
      drawStaticFrame();
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    let last = performance.now();
    const speed = 26; // px/sec

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      scanY += speed * dt;
      if (scanY > height + 60) {
        scanY = -60;
        for (const line of lines) {
          line.flag = "none";
          line.markProgress = 0;
        }
      }

      ctx!.clearRect(0, 0, width, height);

      for (const line of lines) {
        const distToScan = Math.abs(line.y - scanY);
        const passed = scanY > line.y;

        ctx!.strokeStyle = `rgba(${INK}, 0.05)`;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(line.xStart, line.y);
        ctx!.lineTo(line.xStart + line.width, line.y);
        ctx!.stroke();

        if (distToScan < 40) {
          const alpha = (1 - distToScan / 40) * 0.3;
          ctx!.strokeStyle = `rgba(${INK_SOFT}, ${alpha})`;
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.moveTo(line.xStart, line.y);
          ctx!.lineTo(line.xStart + line.width, line.y);
          ctx!.stroke();
        }

        if (passed && line.flag === "none" && Math.random() < 0.006) {
          line.flag = Math.random() < 0.55 ? "delete" : "insert";
        }
        if (line.flag !== "none") {
          line.markProgress = Math.min(1, line.markProgress + dt * 1.6);
          const markW = line.width * 0.4 * line.markProgress;
          const color = line.flag === "delete" ? DELETE : INSERT;
          ctx!.strokeStyle = `rgba(${color}, 0.5)`;
          ctx!.lineWidth = line.flag === "delete" ? 1.5 : 2;
          ctx!.beginPath();
          const markY = line.flag === "delete" ? line.y : line.y + 5;
          ctx!.moveTo(line.xStart, markY);
          ctx!.lineTo(line.xStart + markW, markY);
          ctx!.stroke();
        }
      }

      ctx!.strokeStyle = `rgba(${DELETE}, 0.16)`;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, scanY);
      ctx!.lineTo(width, scanY);
      ctx!.stroke();

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
