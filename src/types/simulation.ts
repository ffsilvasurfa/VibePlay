/**
 * Types and interfaces for the Carpet Patrol vacuum simulation
 */

export type DirtType = 'dust' | 'mud' | 'spill' | 'hair' | 'crumbs';

export type ObstacleType = 'sofa' | 'coffee_table' | 'plant' | 'bookshelf' | 'custom';

export type CarpetTheme = 'warm_sand' | 'persian_crimson' | 'slate_wool' | 'olive_moss';

export interface Cell {
  x: number;
  y: number;
  dirt: number; // 0 (pristine) to 1.0 (heavy dirt)
  dirtType: DirtType;
  isObstacle: boolean;
  obstacleType?: ObstacleType;
  cleanedAtTick: number; // tick at which it was last cleaned (for vacuum pile tracks)
  visitCount: number;
}

export type Direction = 'N' | 'E' | 'S' | 'W';

export type VacuumStatus = 'IDLE' | 'CLEANING' | 'MOVING' | 'DETOURING';

export type PatrolMode = 'SERPENTINE' | 'PERIMETER' | 'ALWAYS_LEFT';

export interface VacuumAgent {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  subX: number; // For smooth visual interpolation (0 to 1 between moves)
  subY: number;
  heading: Direction;
  targetHeading: Direction;
  status: VacuumStatus;
  currentActionText: string;
  dirtCleanedTotal: number;
  stepsTaken: number;
  brushRotation: number; // degrees for animated sweeper brushes
  isCleaningNow: boolean;
  // Lawnmower / Serpentine state
  patrolDir: 1 | -1; // 1 = moving East, -1 = moving West
  patrolRow: number;
  // Wall-follower memory
  detourSteps: number;
}

export interface DecisionLogEntry {
  id: string;
  tick: number;
  choice: 'CHOICE_1_CLEAN' | 'CHOICE_2_MOVE';
  title: string;
  description: string;
  pos: { x: number; y: number };
  targetPos?: { x: number; y: number };
  reason: string;
  timestamp: number;
}

export type DrawTool = 
  | 'dust' 
  | 'mud' 
  | 'spill' 
  | 'hair' 
  | 'crumbs' 
  | 'obstacle' 
  | 'eraser';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}
