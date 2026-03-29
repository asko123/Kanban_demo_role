"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function BackgroundTexture() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX = useSpring(mouseX, { stiffness: 40, damping: 15 });
  const spotY = useSpring(mouseY, { stiffness: 40, damping: 15 });
  const orbRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => setMounted(true), []);

  const handleMouse = useCallback(
    (e: MouseEvent) => {
      if (reduced) return;
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;
      orbRefs.current.forEach((orb, i) => {
        if (!orb) return;
        orb.style.transform = `translate(${nx * (i + 1) * 20}px, ${ny * (i + 1) * 20}px)`;
      });
    },
    [reduced, mouseX, mouseY]
  );

  useEffect(() => {
    if (!mounted || reduced) return;
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mounted, reduced, handleMouse]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030306]">
      {/* Aurora mesh gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(45,212,191,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 70%, rgba(34,211,238,0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, #050508 0%, #030306 100%)
          `,
          animation: mounted && !reduced ? "aurora 20s ease-in-out infinite" : "none",
        }}
      />

      {/* Hex grid */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2322d3ee' stroke-width='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 52px",
      }} />

      {/* Scan line */}
      {mounted && !reduced && (
        <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ animation: "scan-sweep 5s linear infinite" }}>
          <div className="h-[1px] w-full" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(45,212,191,0.25) 30%, rgba(34,211,238,0.15) 50%, rgba(167,139,250,0.25) 70%, transparent 95%)" }} />
          <div className="h-8 w-full" style={{ background: "linear-gradient(180deg, rgba(45,212,191,0.03), transparent)" }} />
        </div>
      )}

      {/* Giant mouse spotlight */}
      {mounted && !reduced && (
        <motion.div className="absolute pointer-events-none" style={{
          width: 900, height: 900, x: spotX, y: spotY, marginLeft: -450, marginTop: -450,
          background: "radial-gradient(circle, rgba(45,212,191,0.08) 0%, rgba(34,211,238,0.04) 25%, rgba(167,139,250,0.02) 45%, transparent 65%)",
          borderRadius: "50%", filter: "blur(10px)",
        }} />
      )}

      {/* Bright orbs */}
      {mounted && !reduced && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { size: 500, left: "8%", top: "8%", c1: "45,212,191", c2: "34,211,238", o: 0.15 },
            { size: 400, left: "72%", top: "12%", c1: "167,139,250", c2: "139,92,246", o: 0.12 },
            { size: 550, left: "35%", top: "55%", c1: "34,211,238", c2: "45,212,191", o: 0.1 },
            { size: 300, left: "82%", top: "60%", c1: "167,139,250", c2: "192,132,252", o: 0.14 },
            { size: 350, left: "12%", top: "72%", c1: "59,130,246", c2: "34,211,238", o: 0.08 },
          ].map((orb, i) => (
            <div key={i}
              ref={(el) => { if (el) orbRefs.current[i] = el; }}
              className="absolute rounded-full will-change-transform"
              style={{
                width: orb.size, height: orb.size, left: orb.left, top: orb.top,
                background: `radial-gradient(circle, rgba(${orb.c1},${orb.o}) 0%, rgba(${orb.c2},${orb.o * 0.3}) 40%, transparent 70%)`,
                transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
                filter: "blur(8px)",
              }}
            />
          ))}
        </div>
      )}

      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
      }} />
    </div>
  );
}
