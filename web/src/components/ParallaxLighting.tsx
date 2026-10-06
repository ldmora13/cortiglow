// components/ParallaxLighting.tsx
import { useGSAP } from "@gsap/react";
import { useRef, useEffect, useState } from "react";
import { gsap } from "../lib/gsap";

interface ParallaxLightingProps {
  children: React.ReactNode;
  lightColor?: string;
  intensity?: number;
  speed?: number;
  className?: string;
}

export function ParallaxLighting({
  children,
  lightColor = "rgba(251, 146, 60, 0.4)",
  intensity = 100,
  speed = 0.5,
  className = "",
}: ParallaxLightingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
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
    if (!containerRef.current || !lightRef.current || reducedMotion) return;

    const container = containerRef.current;
    const light = lightRef.current;

    // Create parallax light movement on scroll
    gsap.to(light, {
      y: -intensity,
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Parallax horizontal light shift
    gsap.to(light, {
      x: intensity * 0.3,
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  }, [intensity, speed, reducedMotion]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {children}
      <div
        ref={lightRef}
        className="absolute pointer-events-none rounded-full blur-[120px]"
        style={{
          width: "400px",
          height: "400px",
          background: `radial-gradient(circle, ${lightColor}, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}