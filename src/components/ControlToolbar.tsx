/**
 * ControlToolbar: Simulation controls, Drawing tools, Presets, and Speed settings
 */

import React from 'react';
import { DrawTool, PatrolMode, CarpetTheme } from '../types/simulation';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Grid,
  Layers,
  Box,
  Eraser,
  Coffee,
  Footprints,
  Wind,
  Cat,
  Cookie,
} from 'lucide-react';

interface ControlToolbarProps {
  isRunning: boolean;
  speedMultiplier: number;
  selectedTool: DrawTool;
  patrolMode: PatrolMode;
  carpetTheme: CarpetTheme;
  isMuted: boolean;
  showGridLines: boolean;
  showVacuumTracks: boolean;
  onToggleRunning: () => void;
  onStepTick: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onToolSelect: (tool: DrawTool) => void;
  onPatrolModeChange: (mode: PatrolMode) => void;
  onThemeChange: (theme: CarpetTheme) => void;
  onToggleMute: () => void;
  onToggleGridLines: () => void;
  onToggleTracks: () => void;
  onApplyRoomPreset: (preset: 'living_room' | 'obstacle_maze' | 'empty') => void;
  onApplyDirtPreset: (preset: 'mud_streaks' | 'party_crumbs' | 'random' | 'clear') => void;
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  isRunning,
  speedMultiplier,
  selectedTool,
  patrolMode,
  carpetTheme,
  isMuted,
  showGridLines,
  showVacuumTracks,
  onToggleRunning,
  onStepTick,
  onReset,
  onSpeedChange,
  onToolSelect,
  onPatrolModeChange,
  onThemeChange,
  onToggleMute,
  onToggleGridLines,
  onToggleTracks,
  onApplyRoomPreset,
  onApplyDirtPreset,
}) => {
  return (
    <div className="flex flex-col gap-3 bg-stone-900/90 backdrop-blur-md rounded-xl border border-stone-800 p-4 shadow-xl">
      {/* Top Row: Primary Playback & Speed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRunning}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-md active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Patrol
              </>
            )}
          </button>

          <button
            onClick={onStepTick}
            disabled={isRunning}
            title="Advance exactly 1 tick to inspect the 2 choices"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              isRunning
                ? 'opacity-40 cursor-not-allowed bg-stone-800 text-stone-500 border-stone-700'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700 active:scale-95'
            }`}
          >
            <StepForward className="w-4 h-4 text-amber-400" />
            Step 1 Tick
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-stone-400" />
            Reset Robot
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Speed:</span>
          <div className="flex items-center bg-stone-950 p-1 rounded-lg border border-stone-800">
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  speedMultiplier === s
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-400'
                : 'bg-stone-800 border-stone-700 text-amber-400 hover:text-amber-300'
            }`}
            title={isMuted ? 'Unmute procedural sound FX' : 'Mute sound FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Middle Row: Drawing Brush Tools & Placement */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-stone-400 mr-1.5">Draw on Carpet:</span>

          {/* Mud Streak */}
          <button
            onClick={() => onToolSelect('mud')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedTool === 'mud'
                ? 'bg-amber-900/60 text-amber-200 border-amber-500 ring-1 ring-amber-500'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-amber-600" />
            Mud Streak
          </button>

          {/* Dust */}
          <button
            onClick={() => onToolSelect('dust')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedTool === 'dust'
                ? 'bg-stone-700 text-stone-100 border-amber-500 ring-1 ring-amber-500'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-stone-400" />
            Dust
          </button>

          {/* Coffee Spill */}
          <button
            onClick={() => onToolSelect('spill')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedTool === 'spill'
                ? 'bg-orange-950/60 text-orange-200 border-amber-500 ring-1 ring-amber-500'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-orange-500" />
            Spill
          </button>

          {/* Pet Fur */}
          <button
            onClick={() => onToolSelect('hair')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedTool === 'hair'
                ? 'bg-stone-700 text-stone-100 border-amber-500 ring-1 ring-amber-500'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <Cat className="w-3.5 h-3.5 text-amber-300" />
            Pet Fur
          </button>

          {/* Food Crumbs */}
          <button
            onClick={() => onToolSelect('crumbs')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedTool === 'crumbs'
                ? 'bg-amber-950 text-amber-200 border-amber-500 ring-1 ring-amber-500'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            <Cookie className="w-3.5 h-3.5 text-amber-400" />
            Crumbs
          </button>

          <span className="text-stone-700">|</span>

          {/* Furniture Block tool */}
          <button
            onClick={() => onToolSelect('obstacle')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedTool === 'obstacle'
                ? 'bg-red-950/70 text-red-200 border-red-500 ring-1 ring-red-500'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title="Click carpet squares to add or remove furniture blocks"
          >
            <Box className="w-3.5 h-3.5 text-red-400" />
            Furniture Block
          </button>

          {/* Sponge / Clean eraser */}
          <button
            onClick={() => onToolSelect('eraser')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedTool === 'eraser'
                ? 'bg-sky-950 text-sky-200 border-sky-400 ring-1 ring-sky-400'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title="Manually wipe dirt"
          >
            <Eraser className="w-3.5 h-3.5 text-sky-400" />
            Sponge
          </button>
        </div>

        {/* Dirt Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onApplyDirtPreset('mud_streaks')}
            className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
          >
            + Mud Streaks
          </button>
          <button
            onClick={() => onApplyDirtPreset('party_crumbs')}
            className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
          >
            + Party Mess
          </button>
          <button
            onClick={() => onApplyDirtPreset('random')}
            className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
          >
            + Random Dirt
          </button>
          <button
            onClick={() => onApplyDirtPreset('clear')}
            className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-red-300 border border-stone-700 transition-colors"
          >
            Clear Dirt
          </button>
        </div>
      </div>

      {/* Bottom Row: Algorithm Mode, Room Preset, Theme & View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800 text-xs">
        <div className="flex items-center gap-3">
          {/* Navigation Mode */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Patrol Rule:</span>
            <select
              value={patrolMode}
              onChange={(e) => onPatrolModeChange(e.target.value as PatrolMode)}
              aria-label="Patrol Rule"
              className="bg-stone-950 border border-stone-800 text-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="SERPENTINE">Structured Serpentine (Lawnmower + Detour)</option>
              <option value="ALWAYS_LEFT">Pure Reactive (Always-Move-Left)</option>
              <option value="PERIMETER">Perimeter Boundary Sweep</option>
            </select>
          </div>

          {/* Room Presets */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Room:</span>
            <select
              onChange={(e) => onApplyRoomPreset(e.target.value as 'living_room' | 'obstacle_maze' | 'empty')}
              defaultValue="living_room"
              aria-label="Room Preset"
              className="bg-stone-950 border border-stone-800 text-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="living_room">Living Room (Sofa, Table, Plant)</option>
              <option value="obstacle_maze">Obstacle Maze (Dividers)</option>
              <option value="empty">Open Carpet (No Obstacles)</option>
            </select>
          </div>

          {/* Theme */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Carpet:</span>
            <select
              value={carpetTheme}
              onChange={(e) => onThemeChange(e.target.value as CarpetTheme)}
              aria-label="Carpet Theme"
              className="bg-stone-950 border border-stone-800 text-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="warm_sand">Warm Berber Wool</option>
              <option value="slate_wool">Slate Minimalist</option>
              <option value="persian_crimson">Persian Crimson Silk</option>
              <option value="olive_moss">Forest Moss Pile</option>
            </select>
          </div>
        </div>

        {/* Visual Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleGridLines}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border ${
              showGridLines
                ? 'bg-stone-800 text-stone-200 border-stone-700'
                : 'bg-stone-950 text-stone-500 border-stone-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid Lines
          </button>

          <button
            onClick={onToggleTracks}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border ${
              showVacuumTracks
                ? 'bg-stone-800 text-stone-200 border-stone-700'
                : 'bg-stone-950 text-stone-500 border-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Carpet Tracks
          </button>
        </div>
      </div>
    </div>
  );
};
