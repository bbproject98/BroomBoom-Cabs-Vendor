export const fireConfetti = (options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
}) => {
  if (typeof window === "undefined") return;
  try {
    const count = options?.particleCount || 70;
    const colors = ["#F5BE18", "#E6A800", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#F97316"];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      const size = Math.floor(Math.random() * 8) + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const startX = (options?.origin?.x ?? 0.5) * window.innerWidth;
      const startY = (options?.origin?.y ?? 0.5) * window.innerHeight;

      particle.style.position = "fixed";
      particle.style.zIndex = "99999";
      particle.style.pointerEvents = "none";
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.transition = "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease-out";

      document.body.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * (options?.spread || 80) * 4 + 80;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity + 140;
      const rotation = Math.random() * 720 - 360;

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${destX}px, ${destY}px) rotate(${rotation}deg)`;
        particle.style.opacity = "0";
      });

      setTimeout(() => {
        particle.remove();
      }, 1300);
    }
  } catch (err) {
    // Graceful fallback
  }
};
