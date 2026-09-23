/**
 * Carpet Patrol - Robotic Vacuum Simulator
 * 
 * Interactive Carpet Grid simulation where users draw dirty marks and streaks,
 * and a robotic vacuum patrol executes a 2-choice decision engine:
 * 1. Choice 1: If current cell has dirt -> Stop & Clean!
 * 2. Choice 2: If current cell is clean -> Move to next free square (with Always-Move-Left obstacle avoidance).
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Cell,
  VacuumAgent,
  DrawTool,
  PatrolMode,
  CarpetTheme,
  DecisionLogEntry,
} from './types/simulation';
import { executeVacuumStep } from './utils/navigation';
import {
  createLivingRoomGrid,
  createObstacleMazeGrid,
  createEmptyGrid,
  addMudStreak,
  addDirtPatch,
  scatterRandomDirt,
  GRID_ROWS,
  GRID_COLS,
} from './utils/presets';
import { soundEngine } from './utils/audio';
import { SimulationHeader } from './components/SimulationHeader';
import { CarpetCanvas } from './components/CarpetCanvas';
import { ControlToolbar } from './components/ControlToolbar';
import { LogicDiagram } from './components/LogicDiagram';
import { DecisionLogFeed } from './components/DecisionLogFeed';
import { ExplainerModal } from './components/ExplainerModal';
import { StudentChallengeModal } from './components/StudentChallengeModal';

export default function App() {
  // Grid State
  const [grid, setGrid] = useState<Cell[][]>(() => createLivingRoomGrid());
  const [currentTick, setCurrentTick] = useState<number>(0);

  // Vacuum Robot Agent State
  const [agent, setAgent] = useState<VacuumAgent>(() => ({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    subX: 0,
    subY: 0,
    heading: 'E',
    targetHeading: 'E',
    status: 'IDLE',
    currentActionText: 'Ready to patrol room. Choose an action or start patrol.',
    dirtCleanedTotal: 0,
    stepsTaken: 0,
    brushRotation: 0,
    isCleaningNow: false,
    patrolDir: 1,
    patrolRow: 0,
    detourSteps: 0,
  }));

  // Simulation Controls State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [patrolMode, setPatrolMode] = useState<PatrolMode>('SERPENTINE');
  const [selectedTool, setSelectedTool] = useState<DrawTool>('mud');
  const [carpetTheme, setCarpetTheme] = useState<CarpetTheme>('warm_sand');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showVacuumTracks, setShowVacuumTracks] = useState<boolean>(true);

  // Telemetry & Logs
  const [logs, setLogs] = useState<DecisionLogEntry[]>([]);
  const [lastDecision, setLastDecision] = useState<DecisionLogEntry | null>(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);

  // Compute Cleanliness Metrics
  const { totalReachableCells, totalDirtyCells, cleanPercent } = useMemo(() => {
    let reachable = 0;
    let dirty = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c].isObstacle) {
          reachable += 1;
          if (grid[r][c].dirt > 0) {
            dirty += 1;
          }
        }
      }
    }
    const clean = reachable - dirty;
    const percent = reachable > 0 ? (clean / reachable) * 100 : 100;
    return {
      totalReachableCells: reachable,
      totalDirtyCells: dirty,
      cleanPercent: percent,
    };
  }, [grid]);

  // Step 1 Simulation Tick (Deterministic 2-Choice Evaluation)
  const stepSimulation = useCallback(() => {
    setCurrentTick((prevTick) => {
      const nextTick = prevTick + 1;

      setGrid((prevGrid) => {
        setAgent((prevAgent) => {
          const result = executeVacuumStep(prevAgent, prevGrid, nextTick, patrolMode);

          // Trigger Sound Effects
          if (result.cleanedAmount > 0) {
            soundEngine.playCleanSound();
          } else if (result.nextAgent.status === 'DETOURING') {
            soundEngine.playObstacleAvoidSound();
          }

          setLastDecision(result.decision);
          setLogs((prevLogs) => [result.decision, ...prevLogs.slice(0, 99)]);

          // Update grid to result.updatedCells
          setTimeout(() => {
            setGrid(result.updatedCells);
          }, 0);

          return result.nextAgent;
        });

        return prevGrid;
      });

      return nextTick;
    });
  }, [patrolMode]);

  // Main Simulation Running Interval
  useEffect(() => {
    if (!isRunning) {
      soundEngine.stopEngine();
      return;
    }

    soundEngine.startEngine();
    const intervalMs = Math.max(80, Math.round(420 / speedMultiplier));

    const timer = setInterval(() => {
      stepSimulation();
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [isRunning, speedMultiplier, stepSimulation]);

  // Handle Mute Toggle
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  // Handle Play/Pause
  const handleToggleRunning = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Reset Robot Position & State
  const handleResetRobot = useCallback(() => {
    setIsRunning(false);
    soundEngine.stopEngine();

    // Find first non-obstacle cell
    let startX = 0;
    let startY = 0;
    outer: for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c].isObstacle) {
          startX = c;
          startY = r;
          break outer;
        }
      }
    }

    setAgent({
      x: startX,
      y: startY,
      prevX: startX,
      prevY: startY,
      subX: startX,
      subY: startY,
      heading: 'E',
      targetHeading: 'E',
      status: 'IDLE',
      currentActionText: `Reset to coordinate (${startX}, ${startY}). Ready to patrol.`,
      dirtCleanedTotal: 0,
      stepsTaken: 0,
      brushRotation: 0,
      isCleaningNow: false,
      patrolDir: 1,
      patrolRow: startY,
      detourSteps: 0,
    });
  }, [grid]);

  // User Canvas Interaction: Draw dirt marks, streaks, or place furniture blocks
  const handleCellInteract = useCallback(
    (x: number, y: number, isDrag: boolean) => {
      if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return;

      setGrid((prevGrid) => {
        const nextGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
        const target = nextGrid[y][x];

        if (selectedTool === 'obstacle') {
          // Only toggle on single click, not continuous drag
          if (!isDrag) {
            // Cannot place obstacle on top of the vacuum agent
            if (x === agent.x && y === agent.y) return prevGrid;

            target.isObstacle = !target.isObstacle;
            if (target.isObstacle) {
              target.obstacleType = 'coffee_table';
              target.dirt = 0;
            }
          }
        } else if (selectedTool === 'eraser') {
          target.dirt = 0;
          if (target.isObstacle && !isDrag) {
            target.isObstacle = false;
          }
        } else {
          // Drawing dirt (mud, dust, spill, hair, crumbs)
          if (!target.isObstacle) {
            const addedDirt = selectedTool === 'dust' ? 0.4 : selectedTool === 'crumbs' ? 0.6 : 0.9;
            target.dirt = Math.min(1.0, target.dirt + addedDirt);
            target.dirtType = selectedTool;
          }
        }

        return nextGrid;
      });
    },
    [selectedTool, agent.x, agent.y]
  );

  // Room Presets Handler
  const handleApplyRoomPreset = useCallback((preset: 'living_room' | 'obstacle_maze' | 'empty') => {
    setIsRunning(false);
    soundEngine.stopEngine();
    let newGrid: Cell[][];
    if (preset === 'living_room') newGrid = createLivingRoomGrid();
    else if (preset === 'obstacle_maze') newGrid = createObstacleMazeGrid();
    else newGrid = createEmptyGrid();

    setGrid(newGrid);
    setAgent((prev) => ({
      ...prev,
      x: 0,
      y: 0,
      heading: 'E',
      status: 'IDLE',
      currentActionText: `Room preset loaded: ${preset}. Ready.`,
    }));
  }, []);

  // Dirt Presets Handler
  const handleApplyDirtPreset = useCallback((preset: 'mud_streaks' | 'party_crumbs' | 'random' | 'clear') => {
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));

      if (preset === 'clear') {
        for (let r = 0; r < nextGrid.length; r++) {
          for (let c = 0; c < nextGrid[r].length; c++) {
            nextGrid[r][c].dirt = 0;
          }
        }
      } else if (preset === 'mud_streaks') {
        addMudStreak(nextGrid, 1, 3, 7, 3, 'mud');
        addMudStreak(nextGrid, 2, 9, 8, 11, 'mud');
        addMudStreak(nextGrid, 10, 2, 15, 5, 'mud');
      } else if (preset === 'party_crumbs') {
        addDirtPatch(nextGrid, 4, 5, 2, 'crumbs');
        addDirtPatch(nextGrid, 12, 7, 2, 'spill');
        addDirtPatch(nextGrid, 8, 10, 2, 'hair');
        addDirtPatch(nextGrid, 14, 2, 1, 'crumbs');
      } else if (preset === 'random') {
        scatterRandomDirt(nextGrid, 14);
      }

      return nextGrid;
    });
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header & Telemetry */}
      <SimulationHeader
        agent={agent}
        cleanPercent={cleanPercent}
        totalDirtyCells={totalDirtyCells}
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenPromptChallenges={() => setIsStudentModalOpen(true)}
      />

      {/* Main Interactive Studio Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Quick Instructions Banner */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <span className="font-semibold text-amber-400">Tactile Canvas:</span>
            <span>Click &amp; drag anywhere on the carpet to draw dirty marks and streaks.</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>
              Left-click to draw dirt • Click <em>Step 1 Tick</em> to see the 2 choices live
            </span>
          </div>
        </div>

        {/* Center: Carpet Grid Canvas */}
        <CarpetCanvas
          grid={grid}
          agent={agent}
          currentTick={currentTick}
          selectedTool={selectedTool}
          carpetTheme={carpetTheme}
          showGridLines={showGridLines}
          showVacuumTracks={showVacuumTracks}
          onCellInteract={handleCellInteract}
        />

        {/* Controls Toolbar */}
        <ControlToolbar
          isRunning={isRunning}
          speedMultiplier={speedMultiplier}
          selectedTool={selectedTool}
          patrolMode={patrolMode}
          carpetTheme={carpetTheme}
          isMuted={isMuted}
          showGridLines={showGridLines}
          showVacuumTracks={showVacuumTracks}
          onToggleRunning={handleToggleRunning}
          onStepTick={stepSimulation}
          onReset={handleResetRobot}
          onSpeedChange={setSpeedMultiplier}
          onToolSelect={setSelectedTool}
          onPatrolModeChange={setPatrolMode}
          onThemeChange={setCarpetTheme}
          onToggleMute={handleToggleMute}
          onToggleGridLines={() => setShowGridLines((v) => !v)}
          onToggleTracks={() => setShowVacuumTracks((v) => !v)}
          onApplyRoomPreset={handleApplyRoomPreset}
          onApplyDirtPreset={handleApplyDirtPreset}
        />

        {/* Lower Grid: Logic Flowchart & Decision Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Machine 2-Choice Diagram */}
          <div className="lg:col-span-7">
            <LogicDiagram
              agent={agent}
              lastDecision={lastDecision}
              onOpenHelpModal={() => setIsExplainerOpen(true)}
            />
          </div>

          {/* Decision Audit Trail Feed */}
          <div className="lg:col-span-5">
            <DecisionLogFeed logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        </div>
      </main>

      {/* Full Architecture & p5.js Specification Modal */}
      <ExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />

      {/* Student Prompt & Assignment Challenges Modal */}
      <StudentChallengeModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />
    </div>
  );
}
