/**
 * CarpetCanvas: HTML5 Canvas rendering for Carpet Grid, Dirt Streaks, Furniture & Vacuum Robot
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Cell, VacuumAgent, DrawTool, CarpetTheme, Particle } from '../types/simulation';
import { DIR_TO_ANGLE } from '../utils/navigation';
import { soundEngine } from '../utils/audio';

interface CarpetCanvasProps {
  grid: Cell[][];
  agent: VacuumAgent;
  currentTick: number;
  selectedTool: DrawTool;
  carpetTheme: CarpetTheme;
  showGridLines: boolean;
  showVacuumTracks: boolean;
  onCellInteract: (x: number, y: number, isDrag: boolean) => void;
  onHoverCellChange?: (pos: { x: number; y: number } | null) => void;
}

const THEMES: Record<CarpetTheme, {
  name: string;
  bgBase: string;
  bgWeave1: string;
  bgWeave2: string;
  gridLine: string;
  trackLight: string;
  trackDark: string;
  border: string;
}> = {
  warm_sand: {
    name: 'Warm Berber Wool',
    bgBase: '#d4c5b2',
    bgWeave1: '#c7b7a1',
    bgWeave2: '#dfd2c0',
    gridLine: 'rgba(120, 100, 80, 0.12)',
    trackLight: 'rgba(255, 255, 255, 0.22)',
    trackDark: 'rgba(110, 90, 70, 0.15)',
    border: '#a4927d',
  },
  slate_wool: {
    name: 'Slate Minimalist',
    bgBase: '#58616a',
    bgWeave1: '#4d555e',
    bgWeave2: '#646f79',
    gridLine: 'rgba(255, 255, 255, 0.08)',
    trackLight: 'rgba(255, 255, 255, 0.18)',
    trackDark: 'rgba(30, 36, 42, 0.22)',
    border: '#3b434a',
  },
  persian_crimson: {
    name: 'Persian Crimson Silk',
    bgBase: '#872a2e',
    bgWeave1: '#752225',
    bgWeave2: '#9a3237',
    gridLine: 'rgba(240, 195, 130, 0.15)',
    trackLight: 'rgba(255, 220, 180, 0.2)',
    trackDark: 'rgba(50, 10, 15, 0.28)',
    border: '#531518',
  },
  olive_moss: {
    name: 'Forest Moss Pile',
    bgBase: '#4d5d43',
    bgWeave1: '#415038',
    bgWeave2: '#57694c',
    gridLine: 'rgba(255, 255, 255, 0.09)',
    trackLight: 'rgba(235, 250, 220, 0.18)',
    trackDark: 'rgba(25, 35, 20, 0.24)',
    border: '#2e3927',
  },
};

export const CarpetCanvas: React.FC<CarpetCanvasProps> = ({
  grid,
  agent,
  currentTick,
  selectedTool,
  carpetTheme,
  showGridLines,
  showVacuumTracks,
  onCellInteract,
  onHoverCellChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Smooth animation interpolation state for the robot
  const animPosRef = useRef({
    x: agent.x,
    y: agent.y,
    angle: DIR_TO_ANGLE[agent.heading],
  });

  // Dust suction particles
  const particlesRef = useRef<Particle[]>([]);

  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  // Responsive sizing calculation
  const getCellMetrics = useCallback(() => {
    if (!canvasRef.current) return { cellSize: 42, width: 800, height: 600, offsetX: 0, offsetY: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const cellSize = Math.min(rect.width / cols, rect.height / rows);
    const width = cols * cellSize;
    const height = rows * cellSize;
    const offsetX = (rect.width - width) / 2;
    const offsetY = (rect.height - height) / 2;
    return { cellSize, width, height, offsetX, offsetY };
  }, [rows, cols]);

  // Convert client pointer coordinate to grid cell
  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();

      let clientX = 0;
      let clientY = 0;
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const { cellSize, offsetX, offsetY } = getCellMetrics();
      const px = clientX - rect.left - offsetX;
      const py = clientY - rect.top - offsetY;

      const cellX = Math.floor(px / cellSize);
      const cellY = Math.floor(py / cellSize);

      if (cellX >= 0 && cellX < cols && cellY >= 0 && cellY < rows) {
        return { x: cellX, y: cellY };
      }
      return null;
    },
    [cols, rows, getCellMetrics]
  );

  // Spawn suction particle burst when cleaning
  useEffect(() => {
    if (agent.isCleaningNow) {
      const pCount = 14;
      const theme = THEMES[carpetTheme];
      const colors = ['#f59e0b', '#d97706', '#92400e', '#78350f', '#fef3c7'];
      for (let i = 0; i < pCount; i++) {
        const rad = Math.random() * Math.PI * 2;
        const dist = 18 + Math.random() * 24;
        particlesRef.current.push({
          x: agent.x + 0.5 + Math.cos(rad) * (dist / 40),
          y: agent.y + 0.5 + Math.sin(rad) * (dist / 40),
          vx: -Math.cos(rad) * (0.04 + Math.random() * 0.05),
          vy: -Math.sin(rad) * (0.04 + Math.random() * 0.05),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
          alpha: 1.0,
          life: 20 + Math.random() * 15,
        });
      }
    }
  }, [agent.isCleaningNow, agent.dirtCleanedTotal, agent.x, agent.y, carpetTheme]);

  // Main 60fps rendering loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // 1. Handle Retina scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const { cellSize, width, height, offsetX, offsetY } = getCellMetrics();
      const theme = THEMES[carpetTheme];

      // Clear full background
      ctx.fillStyle = '#1c1917'; // dark stone background surrounding rug
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw Rug drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = theme.bgBase;
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, width, height, 8);
      ctx.fill();
      ctx.restore();

      // Draw Carpet Weave Base
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(offsetX, offsetY, width, height, 8);
      ctx.clip();

      ctx.fillStyle = theme.bgBase;
      ctx.fillRect(offsetX, offsetY, width, height);

      // Micro carpet pile texture (procedural diagonal grain)
      ctx.strokeStyle = theme.bgWeave1;
      ctx.lineWidth = 1;
      const grainStep = 5;
      for (let x = offsetX; x < offsetX + width; x += grainStep) {
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x + height, offsetY + height);
        ctx.stroke();
      }
      ctx.strokeStyle = theme.bgWeave2;
      for (let x = offsetX + width; x > offsetX - height; x -= grainStep) {
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x - height, offsetY + height);
        ctx.stroke();
      }

      // Draw cells: Vacuum tracks, Dirt marks & Streaks
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];
          const cx = offsetX + c * cellSize;
          const cy = offsetY + r * cellSize;

          // A. Vacuum Grooming Tracks (Cleaned carpet stripes)
          if (showVacuumTracks && cell.cleanedAtTick >= 0) {
            const age = currentTick - cell.cleanedAtTick;
            const trackOpacity = Math.max(0.15, 0.65 - age * 0.015);
            ctx.fillStyle = (c % 2 === 0) ? theme.trackLight : theme.trackDark;
            ctx.globalAlpha = trackOpacity;
            ctx.fillRect(cx, cy, cellSize, cellSize);

            // Parallel groomed pile lines
            ctx.strokeStyle = theme.trackLight;
            ctx.lineWidth = 1.2;
            for (let li = cx + 4; li < cx + cellSize; li += 7) {
              ctx.beginPath();
              ctx.moveTo(li, cy + 2);
              ctx.lineTo(li, cy + cellSize - 2);
              ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
          }

          // B. Dirt Marks & Streaks
          if (cell.dirt > 0) {
            drawDirtCell(ctx, cell, cx, cy, cellSize);
          }

          // C. Furniture Obstacles
          if (cell.isObstacle) {
            drawObstacleCell(ctx, cell, cx, cy, cellSize);
          }
        }
      }

      // Draw Grid Lines if enabled
      if (showGridLines) {
        ctx.strokeStyle = theme.gridLine;
        ctx.lineWidth = 1;
        for (let c = 0; c <= cols; c++) {
          const gx = offsetX + c * cellSize;
          ctx.beginPath();
          ctx.moveTo(gx, offsetY);
          ctx.lineTo(gx, offsetY + height);
          ctx.stroke();
        }
        for (let r = 0; r <= rows; r++) {
          const gy = offsetY + r * cellSize;
          ctx.beginPath();
          ctx.moveTo(offsetX, gy);
          ctx.lineTo(offsetX + width, gy);
          ctx.stroke();
        }
      }

      // Draw Hover Brush Cursor
      if (hoverPos && hoverPos.x >= 0 && hoverPos.x < cols && hoverPos.y >= 0 && hoverPos.y < rows) {
        const hx = offsetX + hoverPos.x * cellSize;
        const hy = offsetY + hoverPos.y * cellSize;

        ctx.strokeStyle = selectedTool === 'obstacle' ? '#ef4444' : selectedTool === 'eraser' ? '#38bdf8' : '#eab308';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(hx + 1, hy + 1, cellSize - 2, cellSize - 2);
        ctx.setLineDash([]);
      }

      // Smooth interpolation for Robot Position and Heading
      const targetAngle = DIR_TO_ANGLE[agent.heading];
      // Angle smoothing accounting for wrap-around
      let diffAngle = targetAngle - animPosRef.current.angle;
      while (diffAngle > 180) diffAngle -= 360;
      while (diffAngle < -180) diffAngle += 360;
      animPosRef.current.angle += diffAngle * 0.25;

      // Position smoothing
      animPosRef.current.x += (agent.x - animPosRef.current.x) * 0.35;
      animPosRef.current.y += (agent.y - animPosRef.current.y) * 0.35;

      // Draw Active Suction Particles
      drawSuctionParticles(ctx, offsetX, offsetY, cellSize);

      // Draw Robot Vacuum Agent
      drawRobotVacuum(
        ctx,
        offsetX + (animPosRef.current.x + 0.5) * cellSize,
        offsetY + (animPosRef.current.y + 0.5) * cellSize,
        cellSize * 0.44,
        animPosRef.current.angle,
        agent
      );

      ctx.restore(); // restore clip
      ctx.restore(); // restore scale

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    grid,
    agent,
    currentTick,
    carpetTheme,
    showGridLines,
    showVacuumTracks,
    hoverPos,
    selectedTool,
    getCellMetrics,
    rows,
    cols,
  ]);

  // Helper: Draw Dirt Marks with rich visual styling
  const drawDirtCell = (
    ctx: CanvasRenderingContext2D,
    cell: Cell,
    cx: number,
    cy: number,
    size: number
  ) => {
    ctx.save();
    const alpha = Math.min(1.0, 0.35 + cell.dirt * 0.65);
    ctx.globalAlpha = alpha;

    switch (cell.dirtType) {
      case 'mud': {
        // Muddy patch / streak
        ctx.fillStyle = '#452b1b';
        ctx.beginPath();
        ctx.ellipse(cx + size * 0.5, cy + size * 0.5, size * 0.38, size * 0.28, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Mud splatters
        ctx.fillStyle = '#2e190e';
        for (let i = 0; i < 4; i++) {
          const ox = cx + size * (0.2 + (i * 0.23) % 0.6);
          const oy = cy + size * (0.25 + (i * 0.31) % 0.5);
          ctx.beginPath();
          ctx.arc(ox, oy, size * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'spill': {
        // Coffee / soda spill with wet rim
        ctx.fillStyle = 'rgba(74, 38, 18, 0.75)';
        ctx.beginPath();
        ctx.arc(cx + size * 0.5, cy + size * 0.5, size * 0.36, 0, Math.PI * 2);
        ctx.fill();
        // Meniscus ring
        ctx.strokeStyle = '#2d1508';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      }

      case 'hair': {
        // Tangled pet hair strands
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx + size * 0.45, cy + size * 0.45, size * 0.25, 0.2, 3.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + size * 0.55, cy + size * 0.55, size * 0.22, 2.5, 5.8);
        ctx.stroke();
        break;
      }

      case 'crumbs': {
        // Crumb flecks
        const crumbColors = ['#f59e0b', '#d97706', '#b45309', '#fef08a'];
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = crumbColors[i % crumbColors.length];
          const px = cx + size * (0.18 + ((i * 37) % 65) / 100);
          const py = cy + size * (0.18 + ((i * 53) % 65) / 100);
          ctx.beginPath();
          ctx.arc(px, py, size * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'dust':
      default: {
        // Soft dust bunny / granular dust
        ctx.fillStyle = 'rgba(80, 75, 70, 0.7)';
        ctx.beginPath();
        ctx.arc(cx + size * 0.5, cy + size * 0.5, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = 'rgba(50, 45, 40, 0.6)';
          const ox = cx + size * (0.2 + (i * 0.18));
          const oy = cy + size * (0.2 + ((i * 29) % 60) / 100);
          ctx.fillRect(ox, oy, size * 0.08, size * 0.08);
        }
        break;
      }
    }

    ctx.restore();
  };

  // Helper: Draw Furniture Obstacle with drop shadow and textures
  const drawObstacleCell = (
    ctx: CanvasRenderingContext2D,
    cell: Cell,
    cx: number,
    cy: number,
    size: number
  ) => {
    ctx.save();
    const pad = 2;
    const innerSize = size - pad * 2;
    const x = cx + pad;
    const y = cy + pad;

    // Obstacle drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    const type = cell.obstacleType || 'custom';

    if (type === 'sofa') {
      // Warm modern sofa fabric
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.roundRect(x, y, innerSize, innerSize, 6);
      ctx.fill();

      // Fabric seam & cushion highlight
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#34495e';
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, innerSize - 6, innerSize - 6, 4);
      ctx.fill();

      ctx.strokeStyle = '#4a627a';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x + 5, y + 5, innerSize - 10, innerSize - 10);
    } else if (type === 'coffee_table') {
      // Oak wood grain coffee table
      ctx.fillStyle = '#8b5a2b';
      ctx.beginPath();
      ctx.roundRect(x, y, innerSize, innerSize, 5);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      // Wood plank slats
      ctx.strokeStyle = '#683f18';
      ctx.lineWidth = 1;
      for (let sy = y + 6; sy < y + innerSize; sy += 8) {
        ctx.beginPath();
        ctx.moveTo(x + 3, sy);
        ctx.lineTo(x + innerSize - 3, sy);
        ctx.stroke();
      }
    } else if (type === 'bookshelf') {
      // Bookshelf with colorful vertical book spines
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.roundRect(x, y, innerSize, innerSize, 4);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      const bookColors = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa'];
      const spineWidth = (innerSize - 6) / 5;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = bookColors[i % bookColors.length];
        ctx.fillRect(x + 3 + i * spineWidth, y + 3, spineWidth - 1, innerSize - 6);
      }
    } else if (type === 'plant') {
      // Terracotta pot + monstera plant foliage
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.roundRect(x, y, innerSize, innerSize, 6);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      // Terracotta pot center
      ctx.fillStyle = '#c85a17';
      ctx.beginPath();
      ctx.arc(x + innerSize / 2, y + innerSize / 2, innerSize * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Green leafy fronds
      ctx.fillStyle = '#2d6a4f';
      for (let i = 0; i < 4; i++) {
        const rad = (i * Math.PI) / 2 + 0.4;
        ctx.beginPath();
        ctx.arc(
          x + innerSize / 2 + Math.cos(rad) * (innerSize * 0.26),
          y + innerSize / 2 + Math.sin(rad) * (innerSize * 0.26),
          innerSize * 0.18,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      // Minimalist block
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.roundRect(x, y, innerSize, innerSize, 5);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 3, y + 3, innerSize - 6, innerSize - 6);
    }

    ctx.restore();
  };

  // Helper: Draw Active Suction Particles
  const drawSuctionParticles = (
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    cellSize: number
  ) => {
    const list = particlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.alpha = Math.max(0, p.life / 35);

      if (p.life <= 0) {
        list.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      const px = offsetX + p.x * cellSize;
      const py = offsetY + p.y * cellSize;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // Helper: Draw the high-fidelity Robot Vacuum Agent
  const drawRobotVacuum = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    angleDeg: number,
    agentState: VacuumAgent
  ) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Robot Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    // Outer bumper ring
    ctx.fillStyle = '#1e2022';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Outer metallic bezel
    ctx.strokeStyle = '#474c52';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner main chassis
    ctx.fillStyle = '#2d3136';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // Rotate for heading direction and sweeping brushes
    ctx.rotate((angleDeg * Math.PI) / 180);

    // Directional Headlight / Sensor cone
    const gradCone = ctx.createRadialGradient(radius * 0.6, 0, 2, radius * 0.8, 0, radius * 1.3);
    gradCone.addColorStop(0, agentState.status === 'CLEANING' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.35)');
    gradCone.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = gradCone;
    ctx.beginPath();
    ctx.moveTo(radius * 0.5, -radius * 0.2);
    ctx.lineTo(radius * 1.3, -radius * 0.7);
    ctx.lineTo(radius * 1.3, radius * 0.7);
    ctx.lineTo(radius * 0.5, radius * 0.2);
    ctx.closePath();
    ctx.fill();

    // Front Bumper Arc
    ctx.strokeStyle = agentState.status === 'CLEANING' ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.95, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    // Dual Front Side Brushes (animated rotation)
    const brushOffsets = [
      { bx: radius * 0.65, by: -radius * 0.55 },
      { bx: radius * 0.65, by: radius * 0.55 },
    ];
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    for (const b of brushOffsets) {
      ctx.save();
      ctx.translate(b.bx, b.by);
      ctx.rotate((agentState.brushRotation * Math.PI) / 180);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius * 0.35, 0);
        ctx.stroke();
        ctx.rotate((2 * Math.PI) / 3);
      }
      ctx.restore();
    }

    // Top LiDAR Turret
    ctx.fillStyle = '#181a1b';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // LiDAR Laser Aperture
    ctx.fillStyle = agentState.status === 'CLEANING' ? '#f59e0b' : '#10b981';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Status Glow Indicator
    if (agentState.status === 'CLEANING') {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const cell = getCellFromEvent(e);
    if (cell) {
      soundEngine.playPaintSound();
      onCellInteract(cell.x, cell.y, false);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    setHoverPos(cell);
    if (onHoverCellChange) onHoverCellChange(cell);

    if (isMouseDown && cell) {
      onCellInteract(cell.x, cell.y, true);
    }
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);
  };

  const handlePointerLeave = () => {
    setIsMouseDown(false);
    setHoverPos(null);
    if (onHoverCellChange) onHoverCellChange(null);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const cell = getCellFromEvent(e);
    if (cell) {
      soundEngine.playPaintSound();
      onCellInteract(cell.x, cell.y, false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    setHoverPos(cell);
    if (isMouseDown && cell) {
      onCellInteract(cell.x, cell.y, true);
    }
  };

  const handleTouchEnd = () => {
    setIsMouseDown(false);
    setHoverPos(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] lg:h-[580px] bg-stone-900 rounded-xl overflow-hidden shadow-2xl border border-stone-800 select-none flex items-center justify-center p-3"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-crosshair touch-none"
      />

      {/* Floating Canvas Quick HUD */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 bg-stone-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 text-xs shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-stone-300 font-medium">Carpet Grid:</span>
        <span className="font-mono text-stone-400">{cols} × {rows} cells</span>
        <span className="text-stone-600">|</span>
        <span className="text-stone-400">Brush:</span>
        <span className="font-semibold text-amber-400 capitalize">{selectedTool}</span>
      </div>

      {/* Vacuum Live State Badge */}
      <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2 bg-stone-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 text-xs shadow-md">
        <span className="text-stone-400">Status:</span>
        <span
          className={`font-semibold font-mono px-2 py-0.5 rounded text-[11px] ${
            agent.status === 'CLEANING'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : agent.status === 'DETOURING'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {agent.status === 'CLEANING' ? 'CHOICE 1: CLEANING' : agent.status === 'DETOURING' ? 'CHOICE 2: DETOUR (LEFT)' : 'CHOICE 2: PATROL MOVE'}
        </span>
      </div>
    </div>
  );
};
