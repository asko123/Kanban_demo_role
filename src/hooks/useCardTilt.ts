"use client";

import { useRef, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "./useReducedMotion";

export function useCardTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxTilt = 3;
      const tiltX = -((e.clientY - centerY) / (rect.height / 2)) * maxTilt;
      const tiltY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;
      rotateX.set(tiltX);
      rotateY.set(tiltY);
    },
    [reduced, rotateX, rotateY]
  );

  const onMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return { ref, springX, springY, onMouseMove, onMouseLeave };
}
