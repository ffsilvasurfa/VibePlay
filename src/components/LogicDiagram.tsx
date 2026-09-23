/**
 * LogicDiagram: Visual interactive explanation of the Vacuum Agent's 2-Choice Decision Architecture
 * and Obstacle Avoidance rule ("Always-Move-Left").
 */

import React from 'react';
import { VacuumAgent, DecisionLogEntry } from '../types/simulation';
import { CheckCircle2, Sparkles, Navigation, ShieldAlert, ArrowRight, CornerDownRight, HelpCircle } from 'lucide-react';

interface LogicDiagramProps {
  agent: VacuumAgent;
  lastDecision: DecisionLogEntry | null;
  onOpenHelpModal: () => void;
}

export const LogicDiagram: React.FC<LogicDiagramProps> = ({
  agent,
  lastDecision,
  onOpenHelpModal,
}) => {
  const isCleaning = agent.status === 'CLEANING';
  const isDetouring = agent.status === 'DETOURING';
  const isMoving = agent.status === 'MOVING';

  return (
    <div className="bg-stone-900/90 backdrop-blur-md rounded-xl border border-stone-800 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div>
          <h3 className="text-sm font-semibold text-stone-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Machine Decision Logic (2-Choice Engine)
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            At every tick, the machine checks its current square and executes one of two deterministic choices.
          </p>
        </div>
        <button
          onClick={onOpenHelpModal}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700/80 transition-colors border border-stone-700"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Full Architecture Spec
        </button>
      </div>

      {/* Visual Flow Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Choice 1: Stop and Clean */}
        <div
          className={`relative p-3.5 rounded-lg border transition-all duration-200 ${
            isCleaning
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-900/20'
              : 'bg-stone-900/50 border-stone-800/80 opacity-75'
          }`}
        >
          {isCleaning && (
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow">
              ACTIVE NOW
            </span>
          )}
          <div className="flex items-start gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isCleaning ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Choice 1
                </span>
                <span className="text-xs text-stone-400">Condition: Dirt &gt; 0</span>
              </div>
              <h4 className="text-sm font-semibold text-stone-200 mt-0.5">
                Stop & Clean
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                If the current square contains dirt or a streak, the machine halts movement, spins suction brushes, cleans the fibers, and marks the square clean.
              </p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>Result: Square cleaned to 0%</span>
            <span className="text-amber-400">Next tick: Ready to move</span>
          </div>
        </div>

        {/* Choice 2: Move Next Square */}
        <div
          className={`relative p-3.5 rounded-lg border transition-all duration-200 ${
            isMoving || isDetouring
              ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-900/20'
              : 'bg-stone-900/50 border-stone-800/80 opacity-75'
          }`}
        >
          {(isMoving || isDetouring) && (
            <span
              className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${
                isDetouring ? 'bg-purple-500 text-stone-950' : 'bg-emerald-500 text-stone-950'
              }`}
            >
              {isDetouring ? 'OBSTACLE DETOUR ACTIVE' : 'ACTIVE NOW'}
            </span>
          )}
          <div className="flex items-start gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isDetouring
                  ? 'bg-purple-500/20 text-purple-400'
                  : isMoving
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {isDetouring ? <ShieldAlert className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Choice 2
                </span>
                <span className="text-xs text-stone-400">Condition: Square is Clean</span>
              </div>
              <h4 className="text-sm font-semibold text-stone-200 mt-0.5">
                Move to Next Free Square
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Advances to the next free cell along structured patrol. If blocked by furniture or wall, executes the <strong className="text-stone-200">"Always-Move-Left"</strong> avoidance detour rule.
              </p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>Avoidance Rule:</span>
            <span className={isDetouring ? 'text-purple-300 font-semibold' : 'text-emerald-400'}>
              Always-Move-Left (90° CCW)
            </span>
          </div>
        </div>
      </div>

      {/* Live Step Inspector Feed */}
      {lastDecision && (
        <div className="mt-3 bg-stone-950/80 rounded-lg p-2.5 border border-stone-800 text-xs font-mono">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="flex items-center gap-1.5 text-stone-300">
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              Latest Tick #{lastDecision.tick} Decision:
            </span>
            <span className="text-[10px] text-stone-500">
              Pos: ({lastDecision.pos.x}, {lastDecision.pos.y})
              {lastDecision.targetPos ? ` → (${lastDecision.targetPos.x}, ${lastDecision.targetPos.y})` : ' (Halted)'}
            </span>
          </div>
          <div className="text-stone-300 font-sans flex items-start gap-1.5">
            <CornerDownRight className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
            <span className="text-xs text-stone-300">{lastDecision.reason}</span>
          </div>
        </div>
      )}
    </div>
  );
};
