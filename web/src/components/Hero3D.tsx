// components/Hero3D.tsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";

interface Hero3DProps {
  children: React.ReactNode;
  rotationX?: number;
  rotationY?: number;
  perspective?: number;
  intensity?: number;
  className?: string;
}

gsap.registerPlugin(gsap.ScrollTrigger);

export function Hero3D({
  children,
  rotationX = 0,
  rotationY = 0,
  perspective = 1000,
  intensity = 1,
  className = "",
}: Hero3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(() => {
    if (!ref.current || reduceMotion) return;

    const element = ref.current;

    // Initial entrance animation
    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
        rotationX: rotationX + 15,
        rotationY: rotationY + 15,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX,
        rotationY,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Continuous floating effect
    gsap.to(element, {
      y: -15,
      duration: 4,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, [rotationX, rotationY, perspective, intensity, reduceMotion]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}