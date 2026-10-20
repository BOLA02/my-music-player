"use client";

import { AudioLines, Heart, Music, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { formatTime } from "@/lib/format";
import type { Track } from "@/types/music";
import { Artwork } from "./artwork";
import { PlaylistMenu } from "./playlist-menu";
import { usePlayer } from "./player-provider";

type Props = {
  tracks: Track[];
  emptyText?: string;
  // Replaces the default "delete from library" button (e.g. remove from playlist).
  rowAction?: (track: Track) => ReactNode;
};

export function TrackList({ tracks, emptyText = "Add some audio files to get started.", rowAction }: Props) {
  const { current, playing, play, removeTrack, toggleFavorite } = usePlayer();

  if (tracks.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-zinc-700 px-6 py-16 text-center text-zinc-400">
        <Music size={36} />
        <p>{emptyText}</p>
      </div>
    );
  }

  const context = tracks.map((t) => t.id);

  return (
    <ul className="divide-y divide-zinc-800">
      {tracks.map((t) => {
        const active = t.id === current?.id;
        return (
          <li key={t.id} className="flex items-center gap-1">
            <button
              onClick={() => play(t.id, context)}
              className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
            >
              <span className="relative">
                <Artwork url={t.artUrl} />
                {active && playing && (
                  <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/50">
                    <AudioLines size={18} className="text-emerald-400" />
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className={`block truncate ${active ? "text-emerald-400" : "text-zinc-100"}`}>{t.title}</span>
                <span className="block truncate text-xs text-zinc-500">
                  {t.artist} · {t.album}
                </span>
              </span>
            </button>
            <span className="hidden text-xs tabular-nums text-zinc-500 sm:block">{formatTime(t.duration)}</span>
            <button
              aria-label={t.favorite ? "Remove from favourites" : "Add to favourites"}
              aria-pressed={t.favorite}
              onClick={() => toggleFavorite(t.id)}
              className={`grid h-9 w-9 place-items-center rounded-full ${t.favorite ? "text-emerald-400" : "text-zinc-600 hover:text-white"}`}
            >
              <Heart size={16} fill={t.favorite ? "currentColor" : "none"} />
            </button>
            <PlaylistMenu trackId={t.id} />
            {rowAction ? (
              rowAction(t)
            ) : (
              <button
                aria-label={`Delete ${t.title}`}
                onClick={() => removeTrack(t.id)}
                className="grid h-9 w-9 place-items-center rounded-full text-zinc-600 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
