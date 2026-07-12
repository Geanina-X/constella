import { useEffect, useRef } from 'react';

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars — more of them, wider size range
    const stars: { x: number; y: number; r: number; alpha: number; speed: number; offset: number }[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.0 + 0.1,
        alpha: Math.random() * 0.4 + 0.2,
        speed: Math.random() * 0.015 + 0.003,
        offset: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dim background gradient
      const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5);
      bg.addColorStop(0, 'rgba(20, 24, 50, 0.15)');
      bg.addColorStop(1, 'rgba(5, 5, 15, 0.5)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw tiny stars
      for (const star of stars) {
        const twinkle = Math.sin(frame * star.speed + star.offset) * 0.5 + 0.5;
        const alpha = star.alpha * (0.3 + twinkle * 0.7);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
        ctx.fill();
      }

      // Glowing "bright" stars
      for (let i = 0; i < 40; i++) {
        const star = stars[i];
        const twinkle = Math.sin(frame * star.speed + star.offset) * 0.4 + 0.6;
        const alpha = 0.25 * twinkle;
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 6);
        gradient.addColorStop(0, `rgba(150, 180, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(100, 130, 220, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(10, 10, 30, 0)');
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
