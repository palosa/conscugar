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
    let width = (canvas.width = 450);
    let height = (canvas.height = 450);

    // Definición 3D de una "Estructura Arquitectónica 3D" (Casa/Cubo 3D estilizado)
    // Coordenadas locales en 3D (X, Y, Z) centradas en 0,0,0
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
      // Vigas internas decorativas
      { x: 0, y: -0.1, z: 0 }
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
      [4, 10], [5, 10], [6, 10], [7, 10]
    ];

    // Generar nube de dispersión inicial para la animación de auto-ensamblaje
    const scatterOffsets = nodes.map(() => ({
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 4
    }));

    // Variables de control de la animación
    let progress = 0; // Ensamblaje: 0 a 1
    let angleX = 0.3; // Rotación inicial
    let angleY = 0.5;
    let angleZ = 0.1;

    // Target de rotación controlado por ratón (Parallax)
    const targetRot = { x: 0.3, y: 0.5 };
    const currentRot = { x: 0.3, y: 0.5 };

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 a 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Asignar inclinación de destino
      targetRot.y = 0.5 + x * 0.8;
      targetRot.x = 0.3 - y * 0.8;
    };

    const handleMouseLeave = () => {
      targetRot.x = 0.3;
      targetRot.y = 0.5;
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const size = Math.min(450, containerRef.current.clientWidth);
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

    // Loop de renderizado
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Ensamblaje progresivo (lerp lento al cargar la sección)
      if (progress < 1) {
        progress += 0.015; // Velocidad de formación
      }

      // Suavizar transición de rotación (Interpolación / LERP)
      currentRot.x += (targetRot.x - currentRot.x) * 0.08;
      currentRot.y += (targetRot.y - currentRot.y) * 0.08;

      // Auto rotación orbital muy lenta de fondo
      angleY = currentRot.y + Date.now() * 0.00015;
      angleX = currentRot.x;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      // Proyectar nodos 3D a coordenadas de pantalla 2D
      const projected = [];
      const scale = width * 0.32; // Escala del objeto
      const centerX = width / 2;
      const centerY = height / 2 + 20;

      nodes.forEach((node, i) => {
        const offset = scatterOffsets[i];
        // Interpola entre posición dispersa y posición final ensamblada
        const x = node.x * progress + offset.x * (1 - progress);
        const y = node.y * progress + offset.y * (1 - progress);
        const z = node.z * progress + offset.z * (1 - progress);

        // Rotación en eje Y
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;

        // Rotación en eje X
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        // Rotación en eje Z (inclinación)
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        // Perspectiva simple
        const distance = 3.5;
        const perspective = distance / (distance - z2);

        projected.push({
          x: x3 * scale * perspective + centerX,
          y: -y3 * scale * perspective + centerY, // Eje Y invertido en pantalla
          depth: z2 // Conservar profundidad para renderizado Z-Sorting si se requiere
        });
      });

      // Dibujar vigas secundarias / Líneas tenues de cuadrícula interior (Se forman progresivamente)
      const edgeDrawLimit = Math.floor(edges.length * progress);
      edges.forEach(([u, v], idx) => {
        if (idx > edgeDrawLimit) return;

        // Determinar si es una viga decorativa interna o pilar principal
        const isInternal = u === 10 || v === 10;
        ctx.lineWidth = isInternal ? 1 : 1.6; // Líneas más gruesas para la estructura principal
        ctx.strokeStyle = isInternal 
          ? 'rgba(255, 255, 255, 0.12)' 
          : 'rgba(245, 197, 24, 0.45)'; // Mayor opacidad en la estructura dorada

        ctx.beginPath();
        ctx.moveTo(projected[u].x, projected[u].y);
        ctx.lineTo(projected[v].x, projected[v].y);
        ctx.stroke();
      });

      // Dibujar nodos (Puntos de conexión / Vértices)
      const nodeDrawLimit = Math.floor(nodes.length * progress);
      nodes.forEach((node, i) => {
        if (i > nodeDrawLimit) return;
        const proj = projected[i];
        const isCenterNode = i === 10;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, isCenterNode ? 4.5 : 6, 0, Math.PI * 2); // Nodos más grandes
        ctx.fillStyle = isCenterNode 
          ? 'rgba(255, 255, 255, 0.55)' 
          : 'rgba(245, 197, 24, 0.95)'; // Dorado Conscugar más brillante
        
        // Efecto resplandor en los nodos principales
        if (!isCenterNode) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#F5C518';
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Desactivar shadow para las líneas
      });

      // Dibujar un halo de fondo circular sutil
      ctx.beginPath();
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, scale * 1.5);
      grad.addColorStop(0, 'rgba(245, 197, 24, 0.03)');
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
      className="relative w-full max-w-[450px] aspect-square flex items-center justify-center pointer-events-auto"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full drop-shadow-[0_0_30px_rgba(245,197,24,0.15)]"
      />
    </div>
  );
};

export default WebGLHeroObject;
