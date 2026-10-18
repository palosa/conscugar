import React, { useEffect, useRef } from 'react';

const WebGLHeroObject = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let logicalSize = 450;

    // Definición 3D de una "Estructura Arquitectónica BIM/CAD" (Casa/Cubo 3D estilizado con plano base)
    const nodes = [
      // Base inferior (suelo)
      { x: -1, y: -0.6, z: -1 },
      { x: 1, y: -0.6, z: -1 },
      { x: 1, y: -0.6, z: 1 },
      { x: -1, y: -0.6, z: 1 },
      // Altura pilares
      { x: -1, y: 0.4, z: -1 },
      { x: 1, y: 0.4, z: -1 },
      { x: 1, y: 0.4, z: 1 },
      { x: -1, y: 0.4, z: 1 },
      // Techo en punta (Cumbrera de la casa)
      { x: 0, y: 1.1, z: -1 },
      { x: 0, y: 1.1, z: 1 },
      // Nodo tensor central (estructura interna)
      { x: 0, y: -0.1, z: 0 },
      // Marcas de replanteo exteriores (plano arquitectónico en el suelo)
      { x: -1.35, y: -0.6, z: -1.35 },
      { x: 1.35, y: -0.6, z: -1.35 },
      { x: 1.35, y: -0.6, z: 1.35 },
      { x: -1.35, y: -0.6, z: 1.35 }
    ];

    // Conexiones de líneas entre los nodos 3D
    const edges = [
      // Base inferior
      [0, 1], [1, 2], [2, 3], [3, 0],
      // Base superior
      [4, 5], [5, 6], [6, 7], [7, 4],
      // Pilares verticales
      [0, 4], [1, 5], [2, 6], [3, 7],
      // Techo
      [4, 8], [5, 8], [6, 9], [7, 9],
      // Cumbrera
      [8, 9],
      // Estructura interna decorativa
      [0, 10], [1, 10], [2, 10], [3, 10],
      [4, 10], [5, 10], [6, 10], [7, 10],
      // Perímetro de replanteo técnico (BIM)
      [11, 12], [12, 13], [13, 14], [14, 11],
      [0, 11], [1, 12], [2, 13], [3, 14]
    ];

    const scatterOffsets = nodes.map(() => ({
      x: (Math.random() - 0.5) * 3.5,
      y: (Math.random() - 0.5) * 3.5,
      z: (Math.random() - 0.5) * 3.5
    }));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let progress = prefersReducedMotion ? 1 : 0;
    let angleX = 0.3;
    let angleY = 0.5;
    const angleZ = 0.08;

    const targetRot = { x: 0.3, y: 0.5 };
    const currentRot = { x: 0.3, y: 0.5 };

    const handleMouseMove = (e) => {
      if (prefersReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      targetRot.y = 0.5 + x * 0.85;
      targetRot.x = 0.3 - y * 0.85;
    };

    const handleMouseLeave = () => {
      targetRot.x = 0.3;
      targetRot.y = 0.5;
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      logicalSize = Math.min(450, containerRef.current.clientWidth || 450);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = logicalSize * dpr;
      canvas.height = logicalSize * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    const parent = containerRef.current;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove, { passive: true });
      parent.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    handleResize();

    const renderFrame = (now = performance.now()) => {
      ctx.clearRect(0, 0, logicalSize, logicalSize);

      if (progress < 1) {
        progress = Math.min(1, progress + 0.018);
      }

      // Curva Expo-Out para el auto-ensamblaje arquitectónico
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -8 * progress);

      currentRot.x += (targetRot.x - currentRot.x) * 0.08;
      currentRot.y += (targetRot.y - currentRot.y) * 0.08;

      angleY = prefersReducedMotion ? currentRot.y : currentRot.y + now * 0.00016;
      angleX = currentRot.x;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      const projected = [];
      const scale = logicalSize * 0.31;
      const centerX = logicalSize / 2;
      const centerY = logicalSize / 2 + 18;

      nodes.forEach((node, i) => {
        const offset = scatterOffsets[i];
        const x = node.x * easedProgress + offset.x * (1 - easedProgress);
        const y = node.y * easedProgress + offset.y * (1 - easedProgress);
        const z = node.z * easedProgress + offset.z * (1 - easedProgress);

        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const x3 = x1 * cosZ - y2 * sinZ;
        const y3 = x1 * sinZ + y2 * cosZ;

        const distance = 3.6;
        const perspective = distance / (distance - z2);

        projected.push({
          x: x3 * scale * perspective + centerX,
          y: -y3 * scale * perspective + centerY,
          depth: z2
        });
      });

      const edgeDrawLimit = Math.floor(edges.length * easedProgress);
      edges.forEach(([u, v], idx) => {
        if (idx > edgeDrawLimit) return;

        const isInternal = u === 10 || v === 10;
        const isBlueprintGrid = u >= 11 || v >= 11;

        if (isBlueprintGrid) {
          ctx.setLineDash([3, 4]);
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = 'rgba(194, 65, 12, 0.25)';
        } else if (isInternal) {
          ctx.setLineDash([]);
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = 'rgba(28, 25, 23, 0.14)';
        } else {
          ctx.setLineDash([]);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(194, 65, 12, 0.55)';
        }

        ctx.beginPath();
        ctx.moveTo(projected[u].x, projected[u].y);
        ctx.lineTo(projected[v].x, projected[v].y);
        ctx.stroke();

        // Impulsos de energía BIM viajando por las vigas principales (cuando está ensamblado)
        if (!prefersReducedMotion && easedProgress > 0.95 && idx < 13 && idx % 3 === 0) {
          const pulseT = ((now * 0.00045 + idx * 0.23) % 1);
          const px = projected[u].x + (projected[v].x - projected[u].x) * pulseT;
          const py = projected[u].y + (projected[v].y - projected[u].y) * pulseT;

          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(28, 25, 23, 0.75)';
          ctx.fill();
        }
      });
      ctx.setLineDash([]);

      // Dibujar nodos sin usar ctx.shadowBlur (halo concéntrico 10x más rápido en GPU)
      const nodeDrawLimit = Math.floor(nodes.length * easedProgress);
      nodes.forEach((_, i) => {
        if (i > nodeDrawLimit) return;
        const proj = projected[i];
        const isCenterNode = i === 10;
        const isOuterGrid = i >= 11;

        if (isOuterGrid) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(194, 65, 12, 0.5)';
          ctx.fill();
          return;
        }

        if (!isCenterNode) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 11, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(194, 65, 12, 0.12)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, isCenterNode ? 3.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isCenterNode
          ? 'rgba(28, 25, 23, 0.55)'
          : 'rgba(194, 65, 12, 0.95)';
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    if (prefersReducedMotion) {
      renderFrame();
      return () => window.removeEventListener('resize', handleResize);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(renderFrame);
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );

    if (parent) observer.observe(parent);
    else animationFrameId = requestAnimationFrame(renderFrame);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      aria-hidden="true"
      className="relative w-full max-w-[450px] aspect-square flex items-center justify-center pointer-events-auto"
    >
      <canvas 
        ref={canvasRef} 
        aria-hidden="true"
        className="w-full h-full"
      />
    </div>
  );
};

export default WebGLHeroObject;

