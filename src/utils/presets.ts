/**
 * Preset room layouts, furniture templates, and dirt configurations
 */

import { Cell, ObstacleType, DirtType } from '../types/simulation';

export const GRID_ROWS = 14;
export const GRID_COLS = 18;

export function createEmptyGrid(rows = GRID_ROWS, cols = GRID_COLS): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        x: c,
        y: r,
        dirt: 0,
        dirtType: 'dust',
        isObstacle: false,
        cleanedAtTick: -1,
        visitCount: 0,
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Creates default "Living Room" layout with realistic furniture blocks
 */
export function createLivingRoomGrid(rows = GRID_ROWS, cols = GRID_COLS): Cell[][] {
  const grid = createEmptyGrid(rows, cols);

  const placeFurniture = (x: number, y: number, type: ObstacleType) => {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      grid[y][x].isObstacle = true;
      grid[y][x].obstacleType = type;
      grid[y][x].dirt = 0;
    }
  };

  // 1. Sofa (3x1 block at top-center)
  placeFurniture(6, 2, 'sofa');
  placeFurniture(7, 2, 'sofa');
  placeFurniture(8, 2, 'sofa');
  placeFurniture(9, 2, 'sofa');

  // 2. Coffee Table (2x2 block in center)
  placeFurniture(7, 6, 'coffee_table');
  placeFurniture(8, 6, 'coffee_table');
  placeFurniture(7, 7, 'coffee_table');
  placeFurniture(8, 7, 'coffee_table');

  // 3. Bookshelf (1x3 along right wall)
  placeFurniture(16, 4, 'bookshelf');
  placeFurniture(16, 5, 'bookshelf');
  placeFurniture(16, 6, 'bookshelf');

  // 4. House Plant (bottom left corner)
  placeFurniture(2, 10, 'plant');
  placeFurniture(3, 10, 'plant');

  // 5. Side table / credenza (near top right)
  placeFurniture(13, 11, 'coffee_table');
  placeFurniture(14, 11, 'coffee_table');

  // Add some initial dirt streaks for exciting immediate action!
  addMudStreak(grid, 2, 4, 6, 4);
  addMudStreak(grid, 10, 8, 14, 10);
  addDirtPatch(grid, 4, 7, 2, 'spill');
  addDirtPatch(grid, 11, 3, 2, 'crumbs');
  addDirtPatch(grid, 3, 1, 1, 'hair');

  return grid;
}

export function createObstacleMazeGrid(rows = GRID_ROWS, cols = GRID_COLS): Cell[][] {
  const grid = createEmptyGrid(rows, cols);

  // Vertical divider walls with gaps
  for (let y = 1; y < 10; y++) {
    grid[y][5].isObstacle = true;
    grid[y][5].obstacleType = 'bookshelf';
  }
  for (let y = 4; y < 13; y++) {
    grid[y][11].isObstacle = true;
    grid[y][11].obstacleType = 'sofa';
  }

  // A few accent plants
  grid[2][2].isObstacle = true;
  grid[2][2].obstacleType = 'plant';
  grid[11][15].isObstacle = true;
  grid[11][15].obstacleType = 'plant';

  // Muddy trail winding through maze
  addMudStreak(grid, 1, 1, 4, 1);
  addMudStreak(grid, 7, 3, 10, 3);
  addMudStreak(grid, 12, 6, 16, 8);

  return grid;
}

/**
 * Adds a straight dirty mark/streak between two points (Bresenham's line)
 */
export function addMudStreak(
  grid: Cell[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  dirtType: DirtType = 'mud'
) {
  const rows = grid.length;
  const cols = grid[0].length;

  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      if (!grid[y][x].isObstacle) {
        grid[y][x].dirt = Math.min(1.0, grid[y][x].dirt + 0.85);
        grid[y][x].dirtType = dirtType;
      }
    }

    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

/**
 * Adds a circular or irregular dirt patch
 */
export function addDirtPatch(
  grid: Cell[][],
  cx: number,
  cy: number,
  radius: number,
  dirtType: DirtType = 'crumbs'
) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = cy - radius; r <= cy + radius; r++) {
    for (let c = cx - radius; c <= cx + radius; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        if (!grid[r][c].isObstacle) {
          const dist = Math.hypot(r - cy, c - cx);
          if (dist <= radius) {
            const intensity = Math.max(0.3, 1 - dist / (radius + 0.5));
            grid[r][c].dirt = Math.min(1.0, grid[r][c].dirt + intensity);
            grid[r][c].dirtType = dirtType;
          }
        }
      }
    }
  }
}

/**
 * Scatters random dirty marks and streaks across the carpet
 */
export function scatterRandomDirt(grid: Cell[][], count = 18) {
  const rows = grid.length;
  const cols = grid[0].length;
  const types: DirtType[] = ['mud', 'dust', 'spill', 'hair', 'crumbs'];

  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (Math.random() > 0.4) {
      // Create a streak
      const length = Math.floor(Math.random() * 4) + 2;
      const angle = Math.random() * Math.PI * 2;
      const x2 = Math.round(x + Math.cos(angle) * length);
      const y2 = Math.round(y + Math.sin(angle) * length);
      addMudStreak(grid, x, y, x2, y2, type);
    } else {
      addDirtPatch(grid, x, y, Math.floor(Math.random() * 2) + 1, type);
    }
  }
}
