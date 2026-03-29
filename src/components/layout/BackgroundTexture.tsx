"use client";

import { useEffect, useState } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function BackgroundTexture() {
  const { x, y } = useMousePosition();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const w = mounted ? window.innerWidth : 1;
  const h = mounted ? window.innerHeight : 1;
  const offsetX = reduced ? 0 : (x / w - 0.5) * 8;
  const offsetY = reduced ? 0 : (y / h - 0.5) * 8;

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
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Floating ambient orbs */}
      {mounted && !reduced && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${120 + i * 60}px`,
                height: `${120 + i * 60}px`,
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 25}%`,
                background:
                  i % 2 === 0
                    ? "radial-gradient(circle, rgba(45,212,191,0.015) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(167,139,250,0.012) 0%, transparent 70%)",
                transform: `translate(${offsetX * (i + 1) * 0.3}px, ${offsetY * (i + 1) * 0.3}px)`,
                transition: "transform 0.3s ease-out",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
