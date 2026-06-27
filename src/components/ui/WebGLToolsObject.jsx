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
    let width = (canvas.width = 350);
    let height = (canvas.height = 350);

    // Definición 3D de un "Mazo/Martillo de Obra" (Sólo el mazo)
    const baseNodes = [
      // Mango - Base inferior (X, Y, Z)
      { x: -0.08, y: -1.1, z: -0.08 }, // 0
      { x: 0.08,  y: -1.1, z: -0.08 }, // 1
      { x: 0.08,  y: -1.1, z: 0.08 },  // 2
      { x: -0.08, y: -1.1, z: 0.08 },  // 3

      // Mango - Unión superior con la cabeza
      { x: -0.08, y: 0.3, z: -0.08 },  // 4
      { x: 0.08,  y: 0.3, z: -0.08 },  // 5
      { x: 0.08,  y: 0.3, z: 0.08 },   // 6
      { x: -0.08, y: 0.3, z: 0.08 },   // 7

      // Cabeza del mazo - Parte izquierda
      { x: -0.5, y: 0.1, z: -0.35 },   // 8
      { x: -0.5, y: 0.1, z: 0.35 },    // 9
      { x: -0.5, y: 0.6, z: -0.35 },   // 10
      { x: -0.5, y: 0.6, z: 0.35 },    // 11

      // Cabeza del mazo - Parte derecha
      { x: 0.5, y: 0.1, z: -0.35 },    // 12
      { x: 0.5, y: 0.1, z: 0.35 },     // 13
      { x: 0.5, y: 0.6, z: -0.35 },    // 14
      { x: 0.5, y: 0.6, z: 0.35 },     // 15

      // Líneas decorativas de empuñadura del mango
      { x: -0.09, y: -0.8, z: -0.09 }, // 16
      { x: 0.09,  y: -0.8, z: 0.09 },  // 17
      { x: -0.09, y: -0.5, z: -0.09 }, // 18
      { x: 0.09,  y: -0.5, z: 0.09 }   // 19
    ];

    const edges = [
      // Estructura del Mango
      [0, 1], [1, 2], [2, 3], [3, 0], // Base mango
      [4, 5], [5, 6], [6, 7], [7, 4], // Tope mango
      [0, 4], [1, 5], [2, 6], [3, 7], // Pilares mango

      // Cabeza del Mazo - Capa Izquierda
      [8, 9], [9, 11], [11, 10], [10, 8],
      // Cabeza del Mazo - Capa Derecha
      [12, 13], [13, 15], [15, 14], [14, 12],
      // Cabeza del Mazo - Conexión horizontal
      [8, 12], [9, 13], [10, 14], [11, 15],

      // Líneas de detalle de la empuñadura
      [16, 17], [18, 19],

      // Líneas de soporte estructural (Estilo plano de ingeniería)
      [4, 8], [5, 12], [6, 13], [7, 9],
      [4, 10], [5, 14], [6, 15], [7, 11]
    ];

    // Generar nube de dispersión inicial para la animación de auto-ensamblaje
    const scatterOffsets = baseNodes.map(() => ({
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 4
    }));

    // Variables de control de la animación
    let progress = 0; // Ensamblaje: 0 a 1
    let angleX = 0.4;
    let angleY = 0.2;
    let angleZ = -0.3; // Ligeramente inclinado de lado

    const targetRot = { x: 0.4, y: 0.2 };
    const currentRot = { x: 0.4, y: 0.2 };

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
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
      const size = Math.min(350, containerRef.current.clientWidth);
      width = canvas.width = size;
      height = canvas.height = size;
    };

    window.addEventListener('resize', handleResize);
    const parent = containerRef.current;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove, { passive: true });
      parent.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    handleResize();

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Ensamblaje progresivo
      if (progress < 1) {
        progress += 0.015;
      }

      currentRot.x += (targetRot.x - currentRot.x) * 0.07;
      currentRot.y += (targetRot.y - currentRot.y) * 0.07;

      angleY = currentRot.y + Date.now() * 0.00018;
      angleX = currentRot.x;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      const projected = [];
      const scale = width * 0.35;
      const centerX = width / 2;
      const centerY = height / 2;

      baseNodes.forEach((node, i) => {
        const offset = scatterOffsets[i];
        const x = node.x * progress + offset.x * (1 - progress);
        const y = node.y * progress + offset.y * (1 - progress);
        const z = node.z * progress + offset.z * (1 - progress);

        // Rotación Y
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;

        // Rotación X
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        // Rotación Z
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        const distance = 4.0;
        const perspective = distance / (distance - z2);

        projected.push({
          x: x3 * scale * perspective + centerX,
          y: -y3 * scale * perspective + centerY
        });
      });

      // Dibujar Aristas (Líneas)
      const edgeDrawLimit = Math.floor(edges.length * progress);
      edges.forEach(([u, v], idx) => {
        if (idx > edgeDrawLimit) return;
        
        const isDetail = idx >= 14;
        ctx.lineWidth = isDetail ? 0.85 : 1.5;
        ctx.strokeStyle = isDetail 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(245, 197, 24, 0.35)'; // Dorado Conscugar sutil

        ctx.beginPath();
        ctx.moveTo(projected[u].x, projected[u].y);
        ctx.lineTo(projected[v].x, projected[v].y);
        ctx.stroke();
      });

      // Dibujar Vértices (Puntos de conexión)
      const nodeDrawLimit = Math.floor(baseNodes.length * progress);
      baseNodes.forEach((node, i) => {
        if (i > nodeDrawLimit) return;
        const proj = projected[i];
        const isDetailNode = i >= 16;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, isDetailNode ? 2.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isDetailNode 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(245, 197, 24, 0.75)';

        if (!isDetailNode) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#F5C518';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Halo circular
      ctx.beginPath();
      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, scale * 1.5);
      grad.addColorStop(0, 'rgba(245, 197, 24, 0.025)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.arc(centerX, centerY, scale * 1.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
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
      className="relative w-full max-w-[350px] aspect-square flex items-center justify-center pointer-events-auto"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full drop-shadow-[0_0_20px_rgba(245,197,24,0.1)]"
      />
    </div>
  );
};

export default WebGLToolsObject;
