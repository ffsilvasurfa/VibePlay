/**
 * ExplainerModal: Complete, clear specification of the Machine Movement, the 2 Choices,
 * Obstacle Avoidance rule ("Always-Move-Left"), and the p5.js question answer.
 */

import React from 'react';
import { X, Sparkles, Navigation, ShieldAlert, Cpu, Check, HelpCircle } from 'lucide-react';

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl text-stone-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-100">
              Robotic Vacuum Architecture &amp; Movement Spec
            </h2>
            <p className="text-xs text-stone-400">
              How the 2-choice decision engine, patrol path, and obstacle avoidance operate.
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-5 text-sm">
          {/* Answer to the p5.js question */}
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <HelpCircle className="w-4 h-4 shrink-0" />
              Do we need to install p5.js, or do you already have it?
            </div>
            <p className="text-stone-300 text-xs mt-2 leading-relaxed">
              <strong className="text-amber-300">Answer: No, p5.js is not needed!</strong> This application is built using modern, native HTML5 2D Canvas with React 19 and TypeScript. Native Canvas provides:
            </p>
            <ul className="mt-2 text-xs space-y-1.5 text-stone-300 pl-1">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>No external dependencies or bloat:</strong> Saves ~800KB bundle weight.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>60 FPS hardware acceleration:</strong> Crisp Retina rendering, custom yarn weaves, groomed carpet tracks, and dust particles.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Tight React integration:</strong> Zero canvas container conflicts or lifecycle sync issues.</span>
              </li>
            </ul>
          </div>

          {/* Explanation of the 2 Choices */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              The 2 Deterministic Machine Choices
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              At every simulation tick, the vacuum is located at square <code className="text-amber-300 font-mono">(x, y)</code>. It inspects this current square and chooses exactly one action:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-stone-950/70 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Choice 1: Stop and Clean
                </div>
                <div className="text-xs text-stone-400 mt-1">Condition: <code>currentCell.dirt &gt; 0</code></div>
                <div className="mt-2 text-xs text-stone-300 space-y-1.5">
                  <p>1. The machine <strong>halts on the current square</strong> (movement speed drops to 0).</p>
                  <p>2. Suction motor revs up and dual front sweepers spin vigorously.</p>
                  <p>3. Dirt, mud streaks, or dust are extracted, setting square dirt to 0.</p>
                  <p>4. Total cleaned metric increments and groomed track is stamped.</p>
                  <p>5. On the subsequent tick, the square is clean, transitioning the robot into <strong>Choice 2</strong>.</p>
                </div>
              </div>

              <div className="bg-stone-950/70 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Choice 2: Move Next Free Square
                </div>
                <div className="text-xs text-stone-400 mt-1">Condition: <code>currentCell.dirt === 0</code></div>
                <div className="mt-2 text-xs text-stone-300 space-y-1.5">
                  <p>1. The machine checks the structured patrol target along its scan path.</p>
                  <p>2. <strong>Path Clear:</strong> Advances directly to the next square.</p>
                  <p>3. <strong>Furniture/Obstacle Block:</strong> Executes the <em>"Always-Move-Left"</em> detour rule.</p>
                  <p>4. Advances discrete grid position, leaving a groomed vacuum pile line.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation of Movement & Obstacle Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Movement Pattern &amp; Furniture Obstacle Avoidance
            </h3>
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 mt-3 space-y-3 text-xs text-stone-300">
              <div>
                <strong className="text-stone-100">1. Structured Patrol (Lawnmower / Serpentine):</strong>
                <p className="text-stone-400 mt-1">
                  The vacuum systematically sweeps across rows (e.g., East $\rightarrow$ West, then shifts down a row, West $\rightarrow$ East). This ensures 100% room carpet coverage without wasteful random wandering.
                </p>
              </div>

              <div className="pt-2 border-t border-stone-800">
                <strong className="text-stone-100">2. The "Always-Move-Left" Detour Rule:</strong>
                <p className="text-stone-400 mt-1">
                  When a block of furniture (such as the sofa, coffee table, bookshelf, or plant) obstructs the forward path:
                </p>
                <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800 font-mono text-[11px] text-stone-300 mt-2 space-y-1">
                  <div>1. Calculate 90° relative left: Turn Left from current heading.</div>
                  <div>2. If (x + left.dx, y + left.dy) is free carpet $\rightarrow$ Step Left!</div>
                  <div>3. If Left is also blocked $\rightarrow$ Try Right $\rightarrow$ Try Turn-Around.</div>
                  <div>4. Once obstacle is bypassed, return to the structured scanline.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Drawing Instructions */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              How to Test &amp; Interact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2 text-xs text-stone-300">
              <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800">
                <div className="font-semibold text-stone-200">1. Draw Dirt &amp; Streaks</div>
                <p className="text-stone-400 mt-1">
                  Select <em>Mud Streak</em>, <em>Dust</em>, or <em>Spill</em> and drag across the carpet.
                </p>
              </div>
              <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800">
                <div className="font-semibold text-stone-200">2. Place Furniture</div>
                <p className="text-stone-400 mt-1">
                  Select <em>Furniture Block</em> to toggle obstacle blocks that the robot cannot hit.
                </p>
              </div>
              <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800">
                <div className="font-semibold text-stone-200">3. Step 1 Tick</div>
                <p className="text-stone-400 mt-1">
                  Pause and click <em>Step 1 Tick</em> to see each individual decision evaluated in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors"
          >
            Got it, back to simulation
          </button>
        </div>
      </div>
    </div>
  );
};
