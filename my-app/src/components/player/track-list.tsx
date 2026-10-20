"use client";

import { AudioLines, Music, Trash2 } from "lucide-react";
import { formatTime } from "@/lib/format";
import { usePlayer } from "./player-provider";

export function TrackList({ filter }: { filter: string }) {
  const { tracks, current, playing, play, removeTrack } = usePlayer();
  const q = filter.trim().toLowerCase();
  const shown = q ? tracks.filter((t) => t.title.toLowerCase().includes(q)) : tracks;

  if (tracks.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-zinc-700 px-6 py-16 text-center text-zinc-400">
        <Music size={36} />
        <p>Add some audio files to get started.</p>
      </div>
    );
  }
  if (shown.length === 0) return <p className="py-8 text-center text-zinc-500">No matches.</p>;

  return (
    <ul className="divide-y divide-zinc-800">
      {shown.map((t) => {
        const active = t.id === current?.id;
        return (
          <li key={t.id} className="flex items-center gap-2">
            <button
              onClick={() => play(t.id)}
              className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-zinc-800 text-zinc-400">
                {active && playing ? <AudioLines size={18} className="text-emerald-400" /> : <Music size={18} />}
              </span>
              <span className="min-w-0">
                <span className={`block truncate ${active ? "text-emerald-400" : "text-zinc-100"}`}>{t.title}</span>
                <span className="block truncate text-xs text-zinc-500">{t.fileName}</span>
              </span>
            </button>
            <span className="text-xs tabular-nums text-zinc-500">{formatTime(t.duration)}</span>
            <button
              aria-label={`Remove ${t.title}`}
              onClick={() => removeTrack(t.id)}
              className="grid h-9 w-9 place-items-center rounded-full text-zinc-600 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
