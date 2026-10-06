// hooks/useGSAPAnimations.ts
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import type { ReactNode } from "react";

gsap.registerPlugin(gsap.ScrollTrigger);

interface GSAPAnimationsProps {
  children: ReactNode;
  className?: string;
}

interface ScrollRevealOptions {
  threshold?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
}

interface LightingEffect {
  intensity: number;
  color: string;
  pulse?: boolean;
  ambient?: boolean;
}

interface Hero3DProps {
  children: ReactNode;
  lighting?: LightingEffect;
}

export const useGSAPAnimations = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseMoveRef = useRef(false);

  const initHero3DEffects = () => {
    if (!containerRef.current) return;

    // 3D card tilt effect
    const cards = containerRef.current.querySelectorAll(".hero-card");

    cards.forEach((card) => {
      const cardElement = card as HTMLElement;

      cardElement.addEventListener("mousemove", (e) => {
        mouseMoveRef.current = true;

        const rect = cardElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(cardElement, {
          duration: 0.3,
          rotateX,
          rotateY,
          transformPerspective: 1000,
          scale: 1.05,
          ease: "power2.out",
        });
      });

      cardElement.addEventListener("mouseleave", () => {
        gsap.to(cardElement, {
          duration: 0.5,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          ease: "power2.out",
        });
      });
    });

    // Floating animation for hero elements
    gsap.to(".hero-float", {
      y: -20,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Glow pulse effect for CTA buttons
    gsap.to(".cta-glow", {
      boxShadow: "0 0 30px rgba(251, 146, 60, 0.8)",
      duration: 2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });
  };

  const initScrollReveal = (options: ScrollRevealOptions = {}) => {
    const {
      threshold = 0.1,
      stagger = 0.1,
      duration = 0.6,
      ease = "power2.out",
    } = options;

    const elements = containerRef.current?.querySelectorAll(
      ".reveal-on-scroll"
    );

    elements?.forEach((element) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 50,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          ease,
          stagger,
        }
      );
    });

    // Scroll-triggered animations
    gsap.utils.toArray(".scroll-trigger")
      .forEach((target: Element) => {
        gsap.to(target, {
          opacity: 0,
          y: -30,
          duration: 0.4,
          scrollTrigger: {
            trigger: target,
            start: "top bottom-=20%",
            toggleActions: "play none none reverse",
          },
        });
      });
  };

  const initDynamicLighting = () => {
    const sections = containerRef.current?.querySelectorAll(".section-dynamic-lighting");

    sections?.forEach((section) => {
      const sectionElement = section as HTMLElement;

      // Background gradient animation
      gsap.to(sectionElement.style, {
        backgroundPosition: "120% 120%",
        duration: 20,
        repeat: -1,
        ease: "none",
      });

      // Lighting aura effect
      gsap.to(sectionElement, {
        filter: "drop-shadow(0 0 30px rgba(251, 146, 60, 0.3))",
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });
  };

  const initInteractiveParticles = () => {
    const particles = containerRef.current?.querySelectorAll(".particle");

    particles?.forEach((particle) => {
      const particleElement = particle as HTMLElement;

      gsap.to(particleElement, {
        y: -100,
        opacity: 0,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        ease: "none",
        onRepeat: () => {
          particleElement.style.x = Math.random() * window.innerWidth + "px";
          particleElement.style.setProperty(
            "--start-y",
            (window.innerHeight + Math.random() * 100).toString() + "px"
          );
        },
      });
    });
  };

  return {
    containerRef,
    initHero3DEffects,
    initScrollReveal,
    initDynamicLighting,
    initInteractiveParticles,
  };
};