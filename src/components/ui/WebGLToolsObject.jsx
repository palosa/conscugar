import React, { useEffect, useRef } from 'react';

const WebGLToolsObject = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let logicalSize = 350;

    // Definición 3D de un "Mazo/Martillo de Obra"
    const baseNodes = [
      { x: -0.08, y: -1.1, z: -0.08 },
      { x: 0.08,  y: -1.1, z: -0.08 },
      { x: 0.08,  y: -1.1, z: 0.08 },
      { x: -0.08, y: -1.1, z: 0.08 },
      { x: -0.08, y: 0.3, z: -0.08 },
      { x: 0.08,  y: 0.3, z: -0.08 },
      { x: 0.08,  y: 0.3, z: 0.08 },
      { x: -0.08, y: 0.3, z: 0.08 },
      { x: -0.5, y: 0.1, z: -0.35 },
      { x: -0.5, y: 0.1, z: 0.35 },
      { x: -0.5, y: 0.6, z: -0.35 },
      { x: -0.5, y: 0.6, z: 0.35 },
      { x: 0.5, y: 0.1, z: -0.35 },
      { x: 0.5, y: 0.1, z: 0.35 },
      { x: 0.5, y: 0.6, z: -0.35 },
      { x: 0.5, y: 0.6, z: 0.35 },
      { x: -0.09, y: -0.8, z: -0.09 },
      { x: 0.09,  y: -0.8, z: 0.09 },
      { x: -0.09, y: -0.5, z: -0.09 },
      { x: 0.09,  y: -0.5, z: 0.09 }
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
      [8, 9], [9, 11], [11, 10], [10, 8],
      [12, 13], [13, 15], [15, 14], [14, 12],
      [8, 12], [9, 13], [10, 14], [11, 15],
      [16, 17], [18, 19],
      [4, 8], [5, 12], [6, 13], [7, 9],
      [4, 10], [5, 14], [6, 15], [7, 11]
    ];

    const scatterOffsets = baseNodes.map(() => ({
      x: (Math.random() - 0.5) * 3.5,
      y: (Math.random() - 0.5) * 3.5,
      z: (Math.random() - 0.5) * 3.5
    }));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let progress = prefersReducedMotion ? 1 : 0;
    let angleX = 0.4;
    let angleY = 0.2;
    const angleZ = -0.3;

    const targetRot = { x: 0.4, y: 0.2 };
    const currentRot = { x: 0.4, y: 0.2 };

    const handleMouseMove = (e) => {
      if (prefersReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      targetRot.y = 0.2 + x * 0.9;
      targetRot.x = 0.4 - y * 0.9;
    };

    const handleMouseLeave = () => {
      targetRot.x = 0.4;
      targetRot.y = 0.2;
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      logicalSize = Math.min(350, containerRef.current.clientWidth || 350);
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

      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -8 * progress);

      currentRot.x += (targetRot.x - currentRot.x) * 0.07;
      currentRot.y += (targetRot.y - currentRot.y) * 0.07;

      angleY = prefersReducedMotion ? currentRot.y : currentRot.y + now * 0.00018;
      angleX = currentRot.x;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      const projected = [];
      const scale = logicalSize * 0.35;
      const centerX = logicalSize / 2;
      const centerY = logicalSize / 2;

      baseNodes.forEach((node, i) => {
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

        const distance = 4.0;
        const perspective = distance / (distance - z2);

        projected.push({
          x: x3 * scale * perspective + centerX,
          y: -y3 * scale * perspective + centerY
        });
      });

      const edgeDrawLimit = Math.floor(edges.length * easedProgress);
      edges.forEach(([u, v], idx) => {
        if (idx > edgeDrawLimit) return;

        const isDetail = idx >= 14;
        ctx.lineWidth = isDetail ? 0.85 : 1.4;
        ctx.strokeStyle = isDetail
          ? 'rgba(28, 25, 23, 0.14)'
          : 'rgba(194, 65, 12, 0.42)';

        ctx.beginPath();
        ctx.moveTo(projected[u].x, projected[u].y);
        ctx.lineTo(projected[v].x, projected[v].y);
        ctx.stroke();
      });

      const nodeDrawLimit = Math.floor(baseNodes.length * easedProgress);
      baseNodes.forEach((_, i) => {
        if (i > nodeDrawLimit) return;
        const proj = projected[i];
        const isDetailNode = i >= 16;

        if (!isDetailNode) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(194, 65, 12, 0.12)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, isDetailNode ? 2.2 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isDetailNode
          ? 'rgba(28, 25, 23, 0.35)'
          : 'rgba(194, 65, 12, 0.85)';
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
      className="relative w-full max-w-[350px] aspect-square flex items-center justify-center pointer-events-auto"
    >
      <canvas 
        ref={canvasRef} 
        aria-hidden="true"
        className="w-full h-full"
      />
    </div>
  );
};

export default WebGLToolsObject;

