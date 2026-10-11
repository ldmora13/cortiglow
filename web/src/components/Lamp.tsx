import { useEffect, useRef } from "react";

const TOTAL = 40;
const frameSources = Object.entries(
  import.meta.glob("../assets/lamp/*.webp", {
    eager: true,
    import: "default",
    query: "?url",
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, source]) => source as string);

const KEYS = [
  { angle: -25, frame: 0 },   // frame_001: apuntando arriba
  { angle: 0,   frame: 11 },  // frame_012: horizontal
  { angle: 45,  frame: 39 },  // frame_040: apuntando abajo
];
const DEFAULT_ANGLE = 0; // mouse a la derecha de la lámpara => horizontal

const angleToFrame = (a) => {
  const c = Math.max(KEYS[0].angle, Math.min(KEYS.at(-1).angle, a));
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [k0, k1] = [KEYS[i], KEYS[i + 1]];
    if (c <= k1.angle) {
      const t = (c - k0.angle) / (k1.angle - k0.angle);
      return k0.frame + t * (k1.frame - k0.frame);
    }
  }
  return KEYS.at(-1).frame;
};

export default function Lamp() {
  const canvasRef = useRef(null);
  const target = useRef(angleToFrame(DEFAULT_ANGLE));
  const current = useRef(target.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const images = Array.from({ length: TOTAL }, (_, i) => {
      const img = new Image();
      img.src = frameSources[i];
      return img;
    });

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      // pivote de la cabeza de la lámpara dentro del canvas (ajústalo)
      const px = r.left + r.width * 0.3;
      const py = r.top + r.height * 0.3;
      const dx = px - e.clientX; // > 0 => el mouse está a la izquierda de la lámpara

      const angle = dx <= 0
        ? DEFAULT_ANGLE // mouse a la derecha: frame por defecto
        : (Math.atan2(e.clientY - py, dx) * 180) / Math.PI;

      target.current = angleToFrame(angle);
    };
    const onLeave = () => (target.current = angleToFrame(DEFAULT_ANGLE));

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);

    let raf;
    const draw = () => {
      current.current += (target.current - current.current) * 0.15; // lerp
      const img = images[Math.round(current.current)];
      if (img?.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={1000}
      style={{ position: "static", right: 0, bottom: 0, height: "90vh", width: "auto" }}
    />
  );
}