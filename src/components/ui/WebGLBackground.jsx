import React, { useEffect, useRef } from 'react';

const WebGLBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Configuración de partículas
    const particles = [];
    const particleCount = Math.min(80, Math.floor((width * height) / 20000)); // Escala con resolución
    const mouse = { x: null, y: null, radius: 150 };

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 3.5 + 1.2; // Partículas ligeramente más grandes y visibles
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = -(Math.random() * 0.4 + 0.1); // Suben lentamente
        this.opacity = Math.random() * 0.5 + 0.2; // Mayor opacidad
        this.depth = Math.random() * 2 + 1; // Para efecto parallax con el scroll
      }

      update(scrollOffset) {
        // Movimiento base
        this.x += this.speedX;
        this.y += this.speedY - scrollOffset * 0.05 * this.depth; // Movimiento parallax con el scroll

        // Interacción con ratón (repulsión magnética)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.2;
            this.y += Math.sin(angle) * force * 1.2;
          }
        }

        // Limites de pantalla
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 197, 24, ${this.opacity})`; // Color dorado sutil
        ctx.fill();
      }
    }

    // Inicializar
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let lastScrollY = window.scrollY;
    let scrollSpeed = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollSpeed = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Loop de animación
    const tick = () => {
      // Fondo sutil de niebla/glow con rastro (trail) muy leve
      ctx.fillStyle = 'rgba(8, 8, 8, 0.08)'; 
      ctx.fillRect(0, 0, width, height);

      // Dibujar y actualizar partículas
      particles.forEach((p) => {
        p.update(scrollSpeed);
        p.draw();
      });

      // Desaceleración del scroll speed
      scrollSpeed *= 0.95;

      // Dibujar constelaciones tenues (conexiones de líneas)
      ctx.strokeStyle = 'rgba(245, 197, 24, 0.08)'; // Líneas de conexión más visibles
      ctx.lineWidth = 0.55;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 125) { // Mayor distancia de conexión
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#080808]"
      style={{ mixBlendMode: 'screen', opacity: 0.8 }}
    />
  );
};

export default WebGLBackground;
