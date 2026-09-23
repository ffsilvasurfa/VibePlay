/**
 * Decision Engine & Obstacle Navigation for Vacuum Robot
 * 
 * Implements the 2 core choices specified in the design:
 * 1. CHOICE 1 (STOP & CLEAN): If current square has dirt, halt and vacuum it.
 * 2. CHOICE 2 (MOVE): If current square is clean, move to the next free square
 *    along a structured path (with an "Always-Turn-Left" obstacle detour rule).
 */

import { Cell, Direction, PatrolMode, VacuumAgent, DecisionLogEntry } from '../types/simulation';

export interface StepResult {
  nextAgent: VacuumAgent;
  updatedCells: Cell[][];
  decision: DecisionLogEntry;
  cleanedAmount: number;
}

// Direction helpers
export const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];

export const DIR_DELTA: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

export const DIR_TO_ANGLE: Record<Direction, number> = {
  N: 270,
  E: 0,
  S: 90,
  W: 180,
};

/**
 * Returns direction turned 90 degrees counter-clockwise (Left)
 */
export function turnLeft(dir: Direction): Direction {
  switch (dir) {
    case 'N': return 'W';
    case 'W': return 'S';
    case 'S': return 'E';
    case 'E': return 'N';
  }
}

/**
 * Returns direction turned 90 degrees clockwise (Right)
 */
export function turnRight(dir: Direction): Direction {
  switch (dir) {
    case 'N': return 'E';
    case 'E': return 'S';
    case 'S': return 'W';
    case 'W': return 'N';
  }
}

/**
 * Returns direction opposite (180 degrees)
 */
export function turnAround(dir: Direction): Direction {
  switch (dir) {
    case 'N': return 'S';
    case 'S': return 'N';
    case 'E': return 'W';
    case 'W': return 'E';
  }
}

/**
 * Checks if a target cell coordinate is valid (inside carpet boundaries and not an obstacle)
 */
export function isCellFree(grid: Cell[][], x: number, y: number): boolean {
  const rows = grid.length;
  if (rows === 0) return false;
  const cols = grid[0].length;

  if (x < 0 || x >= cols || y < 0 || y >= rows) {
    return false; // Wall boundary
  }

  return !grid[y][x].isObstacle; // True if free carpet, false if furniture
}

/**
 * Executes a single step of the vacuum state machine
 */
export function executeVacuumStep(
  agent: VacuumAgent,
  grid: Cell[][],
  currentTick: number,
  patrolMode: PatrolMode = 'SERPENTINE'
): StepResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const { x, y } = agent;

  // Deep clone grid row-by-row to maintain immutability
  const nextGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const currentCell = nextGrid[y][x];

  // =========================================================================
  // CHOICE 1: STOP & CLEAN (Triggered when current square has dirt)
  // =========================================================================
  if (currentCell.dirt > 0) {
    const cleanedAmount = currentCell.dirt;
    currentCell.dirt = 0;
    currentCell.cleanedAtTick = currentTick;
    currentCell.visitCount += 1;

    const nextAgent: VacuumAgent = {
      ...agent,
      prevX: x,
      prevY: y,
      status: 'CLEANING',
      isCleaningNow: true,
      currentActionText: `[Choice 1: Stop & Clean] Vacuuming ${currentCell.dirtType} at (${x}, ${y})`,
      dirtCleanedTotal: agent.dirtCleanedTotal + 1,
      brushRotation: (agent.brushRotation + 45) % 360,
    };

    const decision: DecisionLogEntry = {
      id: `tick-${currentTick}-${Date.now()}`,
      tick: currentTick,
      choice: 'CHOICE_1_CLEAN',
      title: 'Choice 1: Stopped & Cleaned Dirt',
      description: `Dirt detected at cell (${x}, ${y})! Machine halted to vacuum and scrub carpet fibers.`,
      pos: { x, y },
      reason: `Current cell had dirty mark (${Math.round(cleanedAmount * 100)}% opacity ${currentCell.dirtType}). Cleaning prioritized over moving.`,
      timestamp: Date.now(),
    };

    return {
      nextAgent,
      updatedCells: nextGrid,
      decision,
      cleanedAmount,
    };
  }

  // =========================================================================
  // CHOICE 2: MOVE TO NEXT FREE SQUARE (Triggered when current square is clean)
  // =========================================================================
  currentCell.cleanedAtTick = currentTick;
  currentCell.visitCount += 1;

  let nextX = x;
  let nextY = y;
  let nextHeading: Direction = agent.heading;
  let nextPatrolDir = agent.patrolDir;
  let nextPatrolRow = agent.patrolRow;
  let detourSteps = agent.detourSteps;
  let isDetouring = false;
  let moveReason = '';

  if (patrolMode === 'SERPENTINE') {
    // Structured Lawnmower scan:
    // Move horizontally along current patrolDir (East = +1, West = -1).
    const desiredHeading: Direction = nextPatrolDir === 1 ? 'E' : 'W';
    const desiredDelta = DIR_DELTA[desiredHeading];
    const targetX = x + desiredDelta.dx;
    const targetY = y;

    // Check if preferred forward square is free
    if (isCellFree(nextGrid, targetX, targetY)) {
      nextX = targetX;
      nextY = targetY;
      nextHeading = desiredHeading;
      moveReason = `Structured patrol row scan proceeding ${desiredHeading === 'E' ? 'East' : 'West'}.`;
    } else {
      // Preferred forward cell is blocked by furniture obstacle or room wall!
      // First, check if we can switch to the next row (down or loop up)
      const nextRowY = y + 1;
      const canAdvanceRow = nextRowY < rows && isCellFree(nextGrid, x, nextRowY);

      if (targetX < 0 || targetX >= cols) {
        // We reached the room boundary wall at end of row
        if (canAdvanceRow) {
          nextX = x;
          nextY = nextRowY;
          nextHeading = 'S';
          nextPatrolDir = (nextPatrolDir * -1) as 1 | -1; // Reverse horizontal sweep for next row
          nextPatrolRow += 1;
          moveReason = `Reached wall. Stepping down to next row (${nextRowY}) and reversing scan direction.`;
        } else if (y >= rows - 1) {
          // Reached bottom wall! Loop back to top (x=0, y=0)
          nextX = 0;
          nextY = 0;
          nextHeading = 'E';
          nextPatrolDir = 1;
          nextPatrolRow = 0;
          moveReason = `Full room patrol complete! Restarting sweep from top-left (0, 0).`;
        } else {
          // Down is blocked by obstacle, apply deterministic "Always-Move-Left" avoidance
          const leftDir = turnLeft(desiredHeading);
          const leftDelta = DIR_DELTA[leftDir];
          if (isCellFree(nextGrid, x + leftDelta.dx, y + leftDelta.dy)) {
            nextX = x + leftDelta.dx;
            nextY = y + leftDelta.dy;
            nextHeading = leftDir;
            isDetouring = true;
            moveReason = `Down blocked by obstacle. Always-Move-Left detour applied -> moving ${leftDir}.`;
          } else {
            // Try other cardinal directions
            const rightDir = turnRight(desiredHeading);
            const rightDelta = DIR_DELTA[rightDir];
            if (isCellFree(nextGrid, x + rightDelta.dx, y + rightDelta.dy)) {
              nextX = x + rightDelta.dx;
              nextY = y + rightDelta.dy;
              nextHeading = rightDir;
              isDetouring = true;
              moveReason = `Obstacle ahead and left blocked. Bypassing right -> moving ${rightDir}.`;
            }
          }
        }
      } else {
        // Blocked mid-room by a FURNITURE OBSTACLE!
        // Apply the requested "Always-Move-Left" avoidance rule!
        const leftDir = turnLeft(desiredHeading);
        const leftDelta = DIR_DELTA[leftDir];
        const leftCandidateX = x + leftDelta.dx;
        const leftCandidateY = y + leftDelta.dy;

        if (isCellFree(nextGrid, leftCandidateX, leftCandidateY)) {
          nextX = leftCandidateX;
          nextY = leftCandidateY;
          nextHeading = leftDir;
          isDetouring = true;
          detourSteps += 1;
          moveReason = `Furniture obstacle detected at (${targetX}, ${targetY}). Applied "Always-Move-Left" rule -> diverting ${leftDir} to (${nextX}, ${nextY}).`;
        } else {
          // If left is also blocked, try Right or Reverse
          const rightDir = turnRight(desiredHeading);
          const rightDelta = DIR_DELTA[rightDir];
          const rightCandidateX = x + rightDelta.dx;
          const rightCandidateY = y + rightDelta.dy;

          if (isCellFree(nextGrid, rightCandidateX, rightCandidateY)) {
            nextX = rightCandidateX;
            nextY = rightCandidateY;
            nextHeading = rightDir;
            isDetouring = true;
            moveReason = `Furniture obstacle ahead and left blocked. Detouring Right -> moving ${rightDir} to (${nextX}, ${nextY}).`;
          } else {
            // Reverse / back up
            const backDir = turnAround(desiredHeading);
            const backDelta = DIR_DELTA[backDir];
            if (isCellFree(nextGrid, x + backDelta.dx, y + backDelta.dy)) {
              nextX = x + backDelta.dx;
              nextY = y + backDelta.dy;
              nextHeading = backDir;
              isDetouring = true;
              moveReason = `Boxed in by obstacles. Reversing ${backDir} to navigate out.`;
            }
          }
        }
      }
    }
  } else if (patrolMode === 'ALWAYS_LEFT') {
    // Pure Always-Move-Left Agent:
    // Tries relative left, then forward, then right, then turn around
    const leftDir = turnLeft(agent.heading);
    const leftDelta = DIR_DELTA[leftDir];
    const forwardDelta = DIR_DELTA[agent.heading];
    const rightDir = turnRight(agent.heading);
    const rightDelta = DIR_DELTA[rightDir];

    if (isCellFree(nextGrid, x + leftDelta.dx, y + leftDelta.dy)) {
      nextX = x + leftDelta.dx;
      nextY = y + leftDelta.dy;
      nextHeading = leftDir;
      moveReason = `Left square is free. Always-Turn-Left chosen -> Heading ${leftDir}.`;
    } else if (isCellFree(nextGrid, x + forwardDelta.dx, y + forwardDelta.dy)) {
      nextX = x + forwardDelta.dx;
      nextY = y + forwardDelta.dy;
      nextHeading = agent.heading;
      moveReason = `Left is blocked. Moving straight forward -> Heading ${agent.heading}.`;
    } else if (isCellFree(nextGrid, x + rightDelta.dx, y + rightDelta.dy)) {
      nextX = x + rightDelta.dx;
      nextY = y + rightDelta.dy;
      nextHeading = rightDir;
      moveReason = `Left & forward blocked. Turning right -> Heading ${rightDir}.`;
    } else {
      const backDir = turnAround(agent.heading);
      const backDelta = DIR_DELTA[backDir];
      if (isCellFree(nextGrid, x + backDelta.dx, y + backDelta.dy)) {
        nextX = x + backDelta.dx;
        nextY = y + backDelta.dy;
        nextHeading = backDir;
        moveReason = `Dead end encountered. Turning 180° around.`;
      }
    }
  } else {
    // PERIMETER / BOUNDARY FOLLOW
    // Moves clockwise or counter-clockwise along outer walls, then steps inward
    const forwardDelta = DIR_DELTA[agent.heading];
    const forwardX = x + forwardDelta.dx;
    const forwardY = y + forwardDelta.dy;

    if (isCellFree(nextGrid, forwardX, forwardY)) {
      nextX = forwardX;
      nextY = forwardY;
      moveReason = `Perimeter sweep advancing ${agent.heading}.`;
    } else {
      // Wall or obstacle hit -> turn left
      const leftDir = turnLeft(agent.heading);
      const leftDelta = DIR_DELTA[leftDir];
      if (isCellFree(nextGrid, x + leftDelta.dx, y + leftDelta.dy)) {
        nextX = x + leftDelta.dx;
        nextY = y + leftDelta.dy;
        nextHeading = leftDir;
        moveReason = `Obstacle/wall reached. Turned Left to ${leftDir}.`;
      } else {
        const rightDir = turnRight(agent.heading);
        nextHeading = rightDir;
        moveReason = `Corner turn: pivoting Right.`;
      }
    }
  }

  const nextAgent: VacuumAgent = {
    ...agent,
    prevX: x,
    prevY: y,
    x: nextX,
    y: nextY,
    heading: nextHeading,
    status: isDetouring ? 'DETOURING' : 'MOVING',
    isCleaningNow: false,
    currentActionText: `[Choice 2: Move Next Free Square] (${x}, ${y}) → (${nextX}, ${nextY})`,
    stepsTaken: agent.stepsTaken + 1,
    brushRotation: (agent.brushRotation + 30) % 360,
    patrolDir: nextPatrolDir,
    patrolRow: nextPatrolRow,
    detourSteps,
  };

  const decision: DecisionLogEntry = {
    id: `tick-${currentTick}-${Date.now()}`,
    tick: currentTick,
    choice: 'CHOICE_2_MOVE',
    title: isDetouring ? 'Choice 2: Obstacle Detour (Always-Move-Left)' : 'Choice 2: Moved to Next Free Square',
    description: `Current square was clean. Advanced machine to square (${nextX}, ${nextY}).`,
    pos: { x, y },
    targetPos: { x: nextX, y: nextY },
    reason: moveReason,
    timestamp: Date.now(),
  };

  return {
    nextAgent,
    updatedCells: nextGrid,
    decision,
    cleanedAmount: 0,
  };
}
