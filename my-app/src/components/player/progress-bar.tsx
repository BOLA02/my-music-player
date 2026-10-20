"use client";

import { formatTime } from "@/lib/format";
import { usePlayer } from "./player-provider";

export function ProgressBar() {
  const { time, duration, seek, current } = usePlayer();
  const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
  return (
    <div className="flex items-center gap-3 text-xs tabular-nums text-zinc-400">
      <span className="w-10 text-right">{formatTime(time)}</span>
      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={max}
        step={0.1}
        value={Math.min(time, max)}
        disabled={!current || max === 0}
        onChange={(e) => seek(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-emerald-400 disabled:cursor-default disabled:opacity-40"
      />
      <span className="w-10">{formatTime(max)}</span>
    </div>
  );
}
