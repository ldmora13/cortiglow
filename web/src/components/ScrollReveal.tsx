// components/ScrollReveal.tsx
import { useGSAP } from "@gsap/react";
import { useRef, useEffect, useState } from "react";
import { gsap } from "../lib/gsap";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  y = 30,
  scale = 1,
  stagger = 0,
  className = "",
  once = true,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    checkReducedMotion();
    window.addEventListener("change", checkReducedMotion);
    return () => window.removeEventListener("change", checkReducedMotion);
  }, []);

  useGSAP(() => {
    if (!ref.current || reducedMotion) return;

    const element = ref.current;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y,
        scale,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: once ? "play none none none" : "play reverse play reverse",
        },
      }
    );

    return () => {
      gsap.killChildTweensOf(element);
    };
  }, [delay, duration, y, scale, once, threshold, reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}