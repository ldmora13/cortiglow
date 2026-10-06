// components/GSAPProvider.tsx
import { useGSAP } from "@gsap/react";
import { ScrollReveal } from "./ScrollReveal";
import { ParallaxLighting } from "./ParallaxLighting";
import { Hero3D } from "./Hero3D";
import gsap from "gsap";

gsap.registerPlugin(gsap.ScrollTrigger);

interface GSAPProviderProps {
  children: React.ReactNode;
  enableLighting?: boolean;
  enable3D?: boolean;
  enableScrollReveal?: boolean;
}

export function GSAPProvider({
  children,
  enableLighting = true,
  enable3D = true,
  enableScrollReveal = true,
}: GSAPProviderProps) {
  return (
    <div>
      {children}
    </div>
  );
}

export { ScrollReveal, ParallaxLighting, Hero3D };