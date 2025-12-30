import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
  isDark: boolean;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      // 50% less density (30000 instead of 15000)
      const particleCount = Math.floor((canvas.width * canvas.height) / 30000);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // 50% smaller size
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          hue: Math.random() > 0.5 ? 280 : 320,
          isDark: document.documentElement.classList.contains('dark'),
        });
      }
      particlesRef.current = particles;
    };

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, lightness: number, opacity: number) => {
      const spikes = 4;
      const outerRadius = size * 2;
      const innerRadius = size * 0.5;

      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, outerRadius * 2);
      gradient.addColorStop(0, `hsla(${hue}, 70%, ${lightness}%, ${opacity})`);
      gradient.addColorStop(0.5, `hsla(${hue}, 70%, ${lightness}%, ${opacity * 0.3})`);
      gradient.addColorStop(1, `hsla(${hue}, 70%, ${lightness}%, 0)`);

      ctx.beginPath();
      ctx.arc(x, y, outerRadius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw star shape
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue}, 80%, ${lightness + 20}%, ${opacity})`;
      ctx.fill();

      // Draw bright core
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 90%, 95%, ${opacity})`;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Subtle opacity pulsing (twinkling effect)
        particle.opacity += (Math.random() - 0.5) * 0.03;
        particle.opacity = Math.max(0.2, Math.min(0.8, particle.opacity));

        // Randomly change direction occasionally
        if (Math.random() < 0.01) {
          particle.speedX = (Math.random() - 0.5) * 0.5;
          particle.speedY = (Math.random() - 0.5) * 0.5;
        }

        // Check current theme and adjust colors dynamically
        const isDark = document.documentElement.classList.contains('dark');
        // Night mode: golden/white star tones, Day mode: pink/coral tones
        const hue = isDark ? (Math.random() > 0.5 ? 45 : 200) : (Math.random() > 0.5 ? 340 : 20);
        const lightness = isDark ? 70 : 50;

        // Draw star
        drawStar(ctx, particle.x, particle.y, particle.size, hue, lightness, particle.opacity);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
};

export default ParticleBackground;
