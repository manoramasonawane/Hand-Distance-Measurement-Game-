/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Trash2, Award } from 'lucide-react';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  onClear: () => void;
  onPlayAgain: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  onClear,
  onPlayAgain,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Hall of Fame
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Top Reflex Champions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Scores achieved in Hand Target Game sessions. Stored locally in your browser session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition"
          >
            Play to Rank Up
          </button>
          {entries.length > 0 && (
            <button
              onClick={onClear}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700 transition"
              title="Clear Saved Scores"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-purple-500/25 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Hits</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Avg Rx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map((entry, idx) => {
                let badge = null;
                if (idx === 0) badge = '🥇';
                else if (idx === 1) badge = '🥈';
                else if (idx === 2) badge = '🥉';

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-purple-500/5 transition duration-150 text-slate-300"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                      {badge && <span className="text-base">{badge}</span>}
                      <span>#{idx + 1}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {entry.player}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                      {entry.score}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          entry.difficulty === 'Hard'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : entry.difficulty === 'Medium'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {entry.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{entry.duration}s</td>
                    <td className="py-3.5 px-4 text-slate-300">{entry.targetsHit}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {entry.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">
                      {entry.avgReactionTimeMs}ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
