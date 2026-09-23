/**
 * SimulationHeader: App bar with real-time room cleanliness stats, telemetry and documentation trigger
 */

import React from 'react';
import { VacuumAgent } from '../types/simulation';
import { Sparkles, Info, GraduationCap } from 'lucide-react';

interface SimulationHeaderProps {
  agent: VacuumAgent;
  cleanPercent: number;
  totalDirtyCells: number;
  onOpenExplainer: () => void;
  onOpenPromptChallenges: () => void;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({
  agent,
  cleanPercent,
  totalDirtyCells,
  onOpenExplainer,
  onOpenPromptChallenges,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 px-6 py-4">
      {/* Brand & Concept */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 text-stone-950 font-black">
          <Sparkles className="w-5 h-5 text-stone-950 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-stone-100">
              Carpet Patrol
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
              2-Choice Vacuum Machine
            </span>
          </div>
          <p className="text-xs text-stone-400">
            Interactive carpet grid simulation • Draw dirt marks & watch the patrol machine clean & navigate
          </p>
        </div>
      </div>

      {/* Real-time Telemetry Stats (Strict Zero-Pill Unboxed Layout) */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-stone-400">
        {/* Cleanliness */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Room Cleanliness</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold font-mono text-emerald-400">
              {cleanPercent.toFixed(1)}%
            </span>
            <span className="text-[11px] text-stone-400">
              ({totalDirtyCells} dirty {totalDirtyCells === 1 ? 'cell' : 'cells'} left)
            </span>
          </div>
        </div>

        <span className="hidden sm:inline text-stone-700" aria-hidden="true">|</span>

        {/* Cleaned Count */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Dirt Vacuumed</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-bold font-mono text-amber-400">
              {agent.dirtCleanedTotal}
            </span>
            <span className="text-[11px] text-stone-400">patches</span>
          </div>
        </div>

        <span className="hidden sm:inline text-stone-700" aria-hidden="true">|</span>

        {/* Agent Coordinates & Heading */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Machine Position</span>
          <div className="flex items-baseline gap-1.5 mt-0.5 font-mono text-xs text-stone-200">
            <span className="font-semibold text-stone-100">
              ({agent.x}, {agent.y})
            </span>
            <span className="text-stone-400">Heading {agent.heading}</span>
          </div>
        </div>

        <span className="hidden sm:inline text-stone-700" aria-hidden="true">|</span>

        {/* Action Buttons: Student Challenges + Architecture Spec */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <button
            onClick={onOpenPromptChallenges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-xs font-semibold shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Show Prompt &amp; Student Challenges
          </button>

          <button
            onClick={onOpenExplainer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors text-xs font-medium"
          >
            <Info className="w-4 h-4 text-stone-400" />
            Machine Spec
          </button>
        </div>
      </div>
    </header>
  );
};
