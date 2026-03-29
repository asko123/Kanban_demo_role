"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function BackgroundTexture() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const spotlightY = useSpring(mouseY, { stiffness: 60, damping: 20 });
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
        const speed = (i + 1) * 12;
        const tx = normX * speed;
        const ty = normY * speed;
        orb.style.transform = `translate(${tx}px, ${ty}px)`;
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
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #0F1117 0%, #080A0E 100%)",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Mouse-following spotlight */}
      {mounted && !reduced && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: 500,
            height: 500,
            x: spotlightX,
            y: spotlightY,
            marginLeft: -250,
            marginTop: -250,
            background:
              "radial-gradient(circle, rgba(45,212,191,0.04) 0%, rgba(45,212,191,0.015) 30%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      )}

      {/* Floating ambient orbs that follow mouse */}
      {mounted && !reduced && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { size: 280, left: "10%", top: "15%", color: "45,212,191", opacity: 0.07 },
            { size: 200, left: "70%", top: "20%", color: "167,139,250", opacity: 0.06 },
            { size: 340, left: "35%", top: "60%", color: "45,212,191", opacity: 0.05 },
            { size: 180, left: "80%", top: "70%", color: "167,139,250", opacity: 0.07 },
            { size: 240, left: "20%", top: "80%", color: "59,130,246", opacity: 0.04 },
          ].map((orb, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) orbRefs.current[i] = el;
              }}
              className="absolute rounded-full will-change-transform"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.left,
                top: orb.top,
                background: `radial-gradient(circle, rgba(${orb.color},${orb.opacity}) 0%, rgba(${orb.color},${orb.opacity * 0.3}) 40%, transparent 70%)`,
                transition: "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
                filter: "blur(2px)",
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle grid lines */}
      {mounted && (
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}
    </div>
  );
}
