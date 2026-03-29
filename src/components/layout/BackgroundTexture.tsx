"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function BackgroundTexture() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightX = useSpring(mouseX, { stiffness: 50, damping: 18 });
  const spotlightY = useSpring(mouseY, { stiffness: 50, damping: 18 });
  const orbRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => setMounted(true), []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (reduced) return;
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const normX = (e.clientX / w - 0.5) * 2;
      const normY = (e.clientY / h - 0.5) * 2;
      orbRefs.current.forEach((orb, i) => {
        if (!orb) return;
        const speed = (i + 1) * 18;
        orb.style.transform = `translate(${normX * speed}px, ${normY * speed}px)`;
      });
    },
    [reduced, mouseX, mouseY]
  );

  useEffect(() => {
    if (!mounted || reduced) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted, reduced, handleMouseMove]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 30%, #0a0e1a 0%, #050609 50%, #020204 100%)",
      }} />

      {/* Hex grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2322d3ee' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 52px",
      }} />

      {/* Scan line */}
      {mounted && !reduced && (
        <div className="absolute inset-x-0 top-0 h-[2px] scan-line pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.15), rgba(34,211,238,0.1), transparent)" }}
        />
      )}

      {/* Mouse spotlight - large, visible */}
      {mounted && !reduced && (
        <motion.div className="absolute pointer-events-none" style={{
          width: 700, height: 700, x: spotlightX, y: spotlightY,
          marginLeft: -350, marginTop: -350,
          background: "radial-gradient(circle, rgba(45,212,191,0.07) 0%, rgba(34,211,238,0.03) 30%, rgba(167,139,250,0.015) 50%, transparent 70%)",
          borderRadius: "50%",
        }} />
      )}

      {/* Bright ambient orbs */}
      {mounted && !reduced && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { size: 400, left: "5%", top: "10%", color: "45,212,191", opacity: 0.12 },
            { size: 300, left: "75%", top: "15%", color: "167,139,250", opacity: 0.1 },
            { size: 450, left: "40%", top: "55%", color: "34,211,238", opacity: 0.08 },
            { size: 250, left: "85%", top: "65%", color: "167,139,250", opacity: 0.12 },
            { size: 350, left: "15%", top: "75%", color: "59,130,246", opacity: 0.06 },
            { size: 200, left: "55%", top: "85%", color: "45,212,191", opacity: 0.09 },
          ].map((orb, i) => (
            <div key={i}
              ref={(el) => { if (el) orbRefs.current[i] = el; }}
              className="absolute rounded-full will-change-transform"
              style={{
                width: orb.size, height: orb.size, left: orb.left, top: orb.top,
                background: `radial-gradient(circle, rgba(${orb.color},${orb.opacity}) 0%, rgba(${orb.color},${orb.opacity * 0.2}) 50%, transparent 70%)`,
                transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
                filter: "blur(4px)",
              }}
            />
          ))}
        </div>
      )}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.06) 0%, transparent 60%)" }} />
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: "linear-gradient(225deg, rgba(167,139,250,0.06) 0%, transparent 60%)" }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
        style={{ background: "linear-gradient(45deg, rgba(34,211,238,0.04) 0%, transparent 60%)" }} />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "256px 256px",
      }} />
    </div>
  );
}
