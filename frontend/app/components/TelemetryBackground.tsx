"use client";
import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  baseOpacity: number;
}

interface GeometricShape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'hexagon' | 'triangle' | 'trackCorner';
  driftX: number;
  driftY: number;
}

interface DataStream {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  speed: number;
  opacity: number;
}

export default function TelemetryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false, trail: [] as {x: number, y: number, age: number}[] });
  const nodesRef = useRef<Node[]>([]);
  const shapesRef = useRef<GeometricShape[]>([]);
  const dataStreamsRef = useRef<DataStream[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initNodes();
      initShapes();
    };

    // Initialize nodes with varied properties
    const initNodes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const nodeCount = Math.floor((width * height) / 18000); // Higher density
      nodesRef.current = [];
      
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2.5 + 0.8,
          pulsePhase: Math.random() * Math.PI * 2,
          baseOpacity: Math.random() * 0.04 + 0.03, // 3-7% opacity
        });
      }
    };

    // Initialize geometric shapes
    const initShapes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      shapesRef.current = [];
      const shapeCount = Math.floor(width / 300); // ~4-8 shapes
      
      const types: GeometricShape['type'][] = ['hexagon', 'triangle', 'trackCorner'];
      
      for (let i = 0; i < shapeCount; i++) {
        shapesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 100 + 50,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.003,
          opacity: Math.random() * 0.025 + 0.015, // 1.5-4% opacity
          type: types[Math.floor(Math.random() * types.length)],
          driftX: (Math.random() - 0.5) * 0.2,
          driftY: Math.random() * 0.15 + 0.05,
        });
      }

      // Initialize data streams (racing telemetry lines)
      dataStreamsRef.current = [];
      for (let i = 0; i < 3; i++) {
        createDataStream(width, height);
      }
    };

    const createDataStream = (width: number, height: number) => {
      const isHorizontal = Math.random() > 0.5;
      dataStreamsRef.current.push({
        startX: isHorizontal ? 0 : Math.random() * width,
        startY: isHorizontal ? Math.random() * height : 0,
        endX: isHorizontal ? width : Math.random() * width,
        endY: isHorizontal ? Math.random() * height : height,
        progress: 0,
        speed: Math.random() * 0.008 + 0.004,
        opacity: Math.random() * 0.06 + 0.03,
      });
    };

    // Draw hexagon
    const drawHexagon = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 180, 216, ${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    // Draw triangle
    const drawTriangle = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 180, 216, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    // Draw track corner (F1 racing corner shape)
    const drawTrackCorner = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      
      // Racing line curve
      ctx.moveTo(-size, size * 0.5);
      ctx.quadraticCurveTo(-size * 0.3, size * 0.5, 0, 0);
      ctx.quadraticCurveTo(size * 0.3, -size * 0.5, size, -size * 0.5);
      
      ctx.strokeStyle = `rgba(225, 6, 0, ${opacity * 0.7})`; // Signal red for racing line
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Outer track boundary
      ctx.beginPath();
      ctx.moveTo(-size * 1.2, size * 0.7);
      ctx.quadraticCurveTo(-size * 0.4, size * 0.7, 0, size * 0.15);
      ctx.quadraticCurveTo(size * 0.4, -size * 0.4, size * 1.2, -size * 0.4);
      ctx.strokeStyle = `rgba(141, 153, 174, ${opacity * 0.5})`; // Grey for boundary
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
    };

    // Draw data stream (racing telemetry pulse)
    const drawDataStream = (stream: DataStream) => {
      const headX = stream.startX + (stream.endX - stream.startX) * stream.progress;
      const headY = stream.startY + (stream.endY - stream.startY) * stream.progress;
      
      // Draw trailing gradient
      const trailLength = 0.15;
      const tailProgress = Math.max(0, stream.progress - trailLength);
      const tailX = stream.startX + (stream.endX - stream.startX) * tailProgress;
      const tailY = stream.startY + (stream.endY - stream.startY) * tailProgress;
      
      const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0, `rgba(0, 180, 216, 0)`);
      gradient.addColorStop(0.8, `rgba(0, 180, 216, ${stream.opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(0, 180, 216, ${stream.opacity})`);
      
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Glowing head
      ctx.beginPath();
      ctx.arc(headX, headY, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 180, 216, ${stream.opacity * 1.5})`;
      ctx.fill();
    };

    // Animation loop
    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      timeRef.current += 0.016; // ~60fps
      const time = timeRef.current;
      
      const nodes = nodesRef.current;
      const shapes = shapesRef.current;
      const streams = dataStreamsRef.current;
      const mouse = mouseRef.current;
      const connectionDistance = 140;
      const mouseInfluenceRadius = 180;

      // Update and draw geometric shapes
      shapes.forEach(shape => {
        shape.rotation += shape.rotationSpeed;
        shape.x += shape.driftX;
        shape.y += shape.driftY;
        
        // Wrap around screen
        if (shape.y > height + shape.size) {
          shape.y = -shape.size;
          shape.x = Math.random() * width;
        }
        if (shape.x > width + shape.size) shape.x = -shape.size;
        if (shape.x < -shape.size) shape.x = width + shape.size;
        
        // Pulse opacity
        const pulseOpacity = shape.opacity * (0.7 + 0.3 * Math.sin(time * 0.5 + shape.rotation));
        
        if (shape.type === 'hexagon') {
          drawHexagon(shape.x, shape.y, shape.size, shape.rotation, pulseOpacity);
        } else if (shape.type === 'triangle') {
          drawTriangle(shape.x, shape.y, shape.size, shape.rotation, pulseOpacity);
        } else {
          drawTrackCorner(shape.x, shape.y, shape.size, shape.rotation, pulseOpacity);
        }
      });

      // Update and draw data streams
      streams.forEach((stream, index) => {
        stream.progress += stream.speed;
        
        if (stream.progress > 1.2) {
          // Reset stream
          streams[index] = {
            ...stream,
            startX: Math.random() > 0.5 ? 0 : Math.random() * width,
            startY: Math.random() > 0.5 ? Math.random() * height : 0,
            endX: Math.random() > 0.5 ? width : Math.random() * width,
            endY: Math.random() > 0.5 ? Math.random() * height : height,
            progress: 0,
            speed: Math.random() * 0.008 + 0.004,
            opacity: Math.random() * 0.06 + 0.03,
          };
        } else {
          drawDataStream(stream);
        }
      });

      // Update mouse trail
      if (mouse.active) {
        mouse.trail.push({ x: mouse.x, y: mouse.y, age: 0 });
        if (mouse.trail.length > 20) mouse.trail.shift();
      }
      mouse.trail.forEach(point => point.age++);
      mouse.trail = mouse.trail.filter(point => point.age < 30);

      // Draw mouse trail (subtle glow effect)
      if (mouse.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(mouse.trail[0].x, mouse.trail[0].y);
        
        for (let i = 1; i < mouse.trail.length; i++) {
          const point = mouse.trail[i];
          ctx.lineTo(point.x, point.y);
        }
        
        const trailGradient = ctx.createLinearGradient(
          mouse.trail[0].x, mouse.trail[0].y,
          mouse.trail[mouse.trail.length - 1].x, mouse.trail[mouse.trail.length - 1].y
        );
        trailGradient.addColorStop(0, 'rgba(0, 180, 216, 0)');
        trailGradient.addColorStop(1, 'rgba(0, 180, 216, 0.15)');
        
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Mouse interaction - magnetic repulsion with smooth falloff
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouseInfluenceRadius && dist > 0) {
            const force = Math.pow((mouseInfluenceRadius - dist) / mouseInfluenceRadius, 2);
            const angle = Math.atan2(dy, dx);
            node.vx += Math.cos(angle) * force * 0.8;
            node.vy += Math.sin(angle) * force * 0.8;
          }
        }

        // Apply velocity with damping
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.96;
        node.vy *= 0.96;

        // Add gentle drift
        node.vx += (Math.random() - 0.5) * 0.02;
        node.vy += (Math.random() - 0.5) * 0.02;

        // Boundary wrap (smoother than bounce)
        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;

        // Pulsing opacity
        const pulseOpacity = node.baseOpacity * (0.6 + 0.4 * Math.sin(time * 2 + node.pulsePhase));
        
        // Draw node with glow
        const glowSize = node.radius * 3;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);
        gradient.addColorStop(0, `rgba(0, 180, 216, ${pulseOpacity * 1.5})`);
        gradient.addColorStop(0.5, `rgba(0, 180, 216, ${pulseOpacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 180, 216, 0)');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 180, 216, ${pulseOpacity * 2})`;
        ctx.fill();

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = Math.pow((connectionDistance - dist) / connectionDistance, 2) * 0.08;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(0, 180, 216, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw connection to mouse cursor with gradient
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouseInfluenceRadius && dist > 20) {
            const opacity = Math.pow((mouseInfluenceRadius - dist) / mouseInfluenceRadius, 1.5) * 0.2;
            
            const gradient = ctx.createLinearGradient(node.x, node.y, mouse.x, mouse.y);
            gradient.addColorStop(0, `rgba(0, 180, 216, ${opacity})`);
            gradient.addColorStop(1, `rgba(0, 180, 216, ${opacity * 0.3})`);
            
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      });

      // Draw cursor glow when active
      if (mouse.active) {
        const cursorGradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
        cursorGradient.addColorStop(0, 'rgba(0, 180, 216, 0.08)');
        cursorGradient.addColorStop(0.5, 'rgba(0, 180, 216, 0.03)');
        cursorGradient.addColorStop(1, 'rgba(0, 180, 216, 0)');
        
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.fillStyle = cursorGradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Initialize
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
}
