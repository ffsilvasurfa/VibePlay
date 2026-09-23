/**
 * StudentChallengeModal: Teaching prompt, exercise challenges, and rubric
 * designed specifically for classroom instruction.
 */

import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Copy,
  Check,
  Code2,
  Lightbulb,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Cpu,
} from 'lucide-react';

interface StudentChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentChallengeModal: React.FC<StudentChallengeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'challenges' | 'rubric'>('prompt');

  if (!isOpen) return null;

  const originalPromptText = `A web app where the canvas is a carpet grid. The user can draw dirty marks and streaks. The vacuum agent does a simple regular patrol of the room and cleans up dirt if it finds anything. There are some blocks representing furniture that it cannot hit so must navigate around - nothing fancy, a simple always-move-left for example. Please explain clearly the movement of the machine - It should have 2 choices - move the next square that is free, following a structured path, or stop and clean, then move. Do we need to install p5.js or you already have?`;

  const codeSnippetToImprove = `// In /src/utils/navigation.ts:
// CHALLENGE: Modify this obstacle detour logic!
if (!isCellFree(nextGrid, targetX, targetY)) {
  // Currently applies "Always-Move-Left" (turnLeft(desiredHeading)):
  const leftDir = turnLeft(desiredHeading);
  const leftCandidateX = x + DIR_DELTA[leftDir].dx;
  const leftCandidateY = y + DIR_DELTA[leftDir].dy;

  if (isCellFree(nextGrid, leftCandidateX, leftCandidateY)) {
    nextX = leftCandidateX;
    nextY = leftCandidateY;
    nextHeading = leftDir;
  }
}`;

  const copyToClipboard = (text: string, type: 'prompt' | 'snippet') => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedCodeSnippet(true);
      setTimeout(() => setCopiedCodeSnippet(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl text-stone-200 flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-900/90 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-100">
                  Student Assignment &amp; Prompt Explorer
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Teaching Mode
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Share the original prompt, inspect the state machine, and challenge students to improve the AI agent.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-stone-800/80 bg-stone-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            1. The Original Prompt &amp; Spec
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'challenges'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            2. Student Improvement Challenges (Levels 1–4)
          </button>
          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rubric'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            3. Discussion Questions &amp; Rubric
          </button>
        </div>

        {/* Tab 1: The Original Prompt */}
        {activeTab === 'prompt' && (
          <div className="p-6 space-y-5 text-xs sm:text-sm">
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-mono text-xs text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Original User Prompt Given to the AI
                </span>
                <button
                  onClick={() => copyToClipboard(originalPromptText, 'prompt')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <blockquote className="bg-stone-900/90 p-3.5 rounded-lg border border-stone-800 text-stone-200 font-serif italic text-sm leading-relaxed select-all">
                &ldquo;{originalPromptText}&rdquo;
              </blockquote>
            </div>

            {/* Breakdown of What Was Built */}
            <div className="space-y-3">
              <h3 className="font-semibold text-stone-200 text-xs sm:text-sm uppercase tracking-wider text-amber-400">
                Key Concepts Illustrated in This App:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Finite State Machine (FSM)
                  </div>
                  <p className="text-stone-400">
                    The robot evaluates state per tick. If dirt &gt; 0, it triggers <strong>Choice 1 (Stop &amp; Clean)</strong>. If dirt == 0, it executes <strong>Choice 2 (Move to Next Free Square)</strong>.
                  </p>
                </div>

                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Deterministic Detour Heuristic
                  </div>
                  <p className="text-stone-400">
                    When blocked by a furniture block or room wall, the robot attempts an <strong>&ldquo;Always-Move-Left&rdquo; (90° CCW)</strong> pivot to bypass the obstacle.
                  </p>
                </div>

                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Native Canvas vs p5.js
                  </div>
                  <p className="text-stone-400">
                    Demonstrates how standard HTML5 Canvas 2D API achieves 60 FPS hardware-accelerated animations, carpet weaves, and dust particles without loading heavy third-party bundles.
                  </p>
                </div>

                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div className="font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Real-Time Telemetry &amp; Audit Trail
                  </div>
                  <p className="text-stone-400">
                    Every single state transition is recorded in the Decision Log with coordinates, choices, and reasoning, giving students complete observability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Student Improvement Challenges */}
        {activeTab === 'challenges' && (
          <div className="p-6 space-y-4 text-xs sm:text-sm">
            <p className="text-stone-300 text-xs">
              Here are 4 structured programming challenges for students, ranging from beginner algorithmic tweaks to advanced pathfinding:
            </p>

            {/* Level 1 */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Level 1: Beginner
                </span>
                <span className="text-stone-500 text-xs font-mono">File: /src/utils/navigation.ts</span>
              </div>
              <h4 className="font-bold text-stone-200 mt-2">
                Challenge 1: Configurable Detour Strategy (&ldquo;Always-Right&rdquo; vs &ldquo;Always-Left&rdquo;)
              </h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Currently, when the machine hits furniture, it always tries turning left (<code className="text-amber-300">turnLeft()</code>). Ask students to add an &ldquo;Always-Move-Right&rdquo; setting and compare which strategy cleans an asymmetrical living room faster.
              </p>
            </div>

            {/* Level 2 */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Level 2: Intermediate
                </span>
                <span className="text-stone-500 text-xs font-mono">File: /src/types/simulation.ts</span>
              </div>
              <h4 className="font-bold text-stone-200 mt-2">
                Challenge 2: Battery Capacity &amp; Docking Station Return
              </h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Add a <code className="text-amber-300">batteryLevel: number</code> (100% down to 0%). Moving costs 1% battery; cleaning dirt costs 2%. When the battery drops below 15%, add a <strong>Choice 3</strong>: Navigate straight back to the charging base at <code className="text-amber-300">(0, 0)</code>!
              </p>
            </div>

            {/* Level 3 */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Level 3: Advanced
                </span>
                <span className="text-stone-500 text-xs font-mono">Pathfinding Algorithm</span>
              </div>
              <h4 className="font-bold text-stone-200 mt-2">
                Challenge 3: Dirt-Sensor Priority (A* or BFS Dirt Seeking)
              </h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Instead of blind row-by-row serpentine scanning, implement a sensor with radius $R=3$. If dirt is detected nearby, calculate the shortest path avoiding furniture obstacles (using BFS or A*) directly to the mess before resuming patrol.
              </p>
            </div>

            {/* Level 4 */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Level 4: Master Challenge
                </span>
                <span className="text-stone-500 text-xs font-mono">SLAM / Memory Map</span>
              </div>
              <h4 className="font-bold text-stone-200 mt-2">
                Challenge 4: Unmapped Room Discovery (Fog of War)
              </h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Start the robot with an unknown room map. When it hits an obstacle, it permanently records that coordinate in its internal memory map so it never attempts to navigate into that furniture piece again.
              </p>
            </div>

            {/* Code Snippet Box */}
            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  Starter Snippet to Give Students:
                </span>
                <button
                  onClick={() => copyToClipboard(codeSnippetToImprove, 'snippet')}
                  className="text-[11px] flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors"
                >
                  {copiedCodeSnippet ? (
                    <span className="text-emerald-400">Copied snippet!</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-amber-200/90 overflow-x-auto p-2 bg-stone-900/90 rounded border border-stone-800/80">
                {codeSnippetToImprove}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Discussion Questions & Rubric */}
        {activeTab === 'rubric' && (
          <div className="p-6 space-y-4 text-xs sm:text-sm">
            <h3 className="font-semibold text-stone-200 uppercase tracking-wider text-amber-400 text-xs">
              Classroom Discussion Questions:
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800">
                <p className="font-bold text-stone-200">
                  1. Can the &ldquo;Always-Move-Left&rdquo; rule ever get trapped in an infinite loop?
                </p>
                <p className="text-stone-400 mt-1 text-xs">
                  <strong className="text-stone-300">Teaching Point:</strong> Yes! In concave U-shaped furniture setups, a pure wall-follower without a visited-cell set or state memory can cycle infinitely. Ask students how they would break the cycle.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800">
                <p className="font-bold text-stone-200">
                  2. Why is Serpentine (Lawnmower) coverage preferred over Random Walk in commercial vacuums?
                </p>
                <p className="text-stone-400 mt-1 text-xs">
                  <strong className="text-stone-300">Teaching Point:</strong> Serpentine guarantees $O(N)$ coverage time, whereas Random Walk requires $O(N \log N)$ expected time to cover all cells, leaving dirty patches behind and wearing out the motor.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800">
                <p className="font-bold text-stone-200">
                  3. Why did we avoid using external libraries like p5.js for this web app?
                </p>
                <p className="text-stone-400 mt-1 text-xs">
                  <strong className="text-stone-300">Teaching Point:</strong> Native Web APIs (HTML5 Canvas 2D, Web Audio API, `requestAnimationFrame`) are faster, maintain complete TypeScript type-safety, and require zero additional bundle dependencies.
                </p>
              </div>
            </div>

            {/* Suggested Grading Rubric */}
            <div className="mt-4 pt-4 border-t border-stone-800">
              <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wider text-stone-400 mb-2">
                Suggested Student Grading Rubric (100 Points Total):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <div className="font-bold text-amber-400">30 Points: Correct FSM</div>
                  <p className="text-stone-400 mt-1">
                    Clear implementation of state choices without race conditions or skipping ticks.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <div className="font-bold text-emerald-400">40 Points: Improved Navigation</div>
                  <p className="text-stone-400 mt-1">
                    Student successfully improves obstacle detour or adds battery return / dirt seeking.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <div className="font-bold text-sky-400">30 Points: Code Quality &amp; Logs</div>
                  <p className="text-stone-400 mt-1">
                    Clean TypeScript typing and informative decision log entries with audit trail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-stone-400">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 font-mono text-[10px]">Step 1 Tick</kbd> during class to pause and explain each movement.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-md"
          >
            Start Teaching Demo
          </button>
        </div>
      </div>
    </div>
  );
};
