/**
 * DecisionLogFeed: Real-time scrolling audit log of every decision evaluated by the vacuum state machine
 */

import React, { useRef, useEffect } from 'react';
import { DecisionLogEntry } from '../types/simulation';
import { ListFilter, Sparkles, Navigation, ShieldAlert, Trash2 } from 'lucide-react';

interface DecisionLogFeedProps {
  logs: DecisionLogEntry[];
  onClearLogs: () => void;
}

export const DecisionLogFeed: React.FC<DecisionLogFeedProps> = ({ logs, onClearLogs }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to top of reverse-ordered list or bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  return (
    <div className="bg-stone-900/90 backdrop-blur-md rounded-xl border border-stone-800 p-4 shadow-xl flex flex-col h-[280px]">
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-stone-400" />
          <h3 className="text-sm font-semibold text-stone-200">
            Decision Audit Trail
          </h3>
          <span className="text-[11px] font-mono text-stone-400">
            ({logs.length} logged)
          </span>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="text-stone-400 hover:text-stone-300 text-xs flex items-center gap-1 transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Scrolling Log Entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto divide-y divide-stone-800/60 mt-2 pr-1 space-y-1 font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-stone-400 text-xs italic font-sans">
            No decisions logged yet. Run or step the patrol to begin!
          </div>
        ) : (
          logs.slice(0, 50).map((entry) => {
            const isClean = entry.choice === 'CHOICE_1_CLEAN';
            const isDetour = entry.title.includes('Detour');

            return (
              <div key={entry.id} className="py-2 flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isClean ? (
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  ) : isDetour ? (
                    <div className="p-1 rounded bg-purple-500/20 text-purple-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                      <Navigation className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold ${
                        isClean
                          ? 'text-amber-400'
                          : isDetour
                          ? 'text-purple-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {entry.title}
                    </span>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      Tick #{entry.tick}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-300 font-sans mt-0.5 leading-snug">
                    {entry.reason}
                  </div>

                  <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-3">
                    <span>At: ({entry.pos.x}, {entry.pos.y})</span>
                    {entry.targetPos && <span>Target: ({entry.targetPos.x}, {entry.targetPos.y})</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
