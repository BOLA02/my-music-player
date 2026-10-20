"use client";

import { ChevronUp } from "lucide-react";
import { Artwork } from "./artwork";
import { usePlayer } from "./player-provider";
import { PlayerControls, VolumeControl } from "./player-controls";
import { ProgressBar } from "./progress-bar";

export function PlayerBar() {
  const { current, error, setNowPlayingOpen } = usePlayer();
  return (
    <footer className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-2xl gap-2 px-4 py-3">
        {error ? (
          <div className="min-h-10 text-center text-sm leading-10 text-red-400">{error}</div>
        ) : (
          <button
            disabled={!current}
            aria-label="Open full-screen player"
            onClick={() => setNowPlayingOpen(true)}
            className="flex min-h-10 items-center justify-center gap-3 text-sm disabled:cursor-default"
          >
            {current && <Artwork url={current.artUrl} size={40} />}
            <span className="min-w-0 text-center">
              <span className="block truncate text-zinc-100">{current?.title ?? "Nothing playing"}</span>
              {current && <span className="block truncate text-xs text-zinc-500">{current.artist}</span>}
            </span>
            {current && <ChevronUp size={18} className="shrink-0 text-zinc-500" />}
          </button>
        )}
        <ProgressBar />
        <PlayerControls />
        <div className="hidden justify-center sm:flex">
          <VolumeControl />
        </div>
      </div>
    </footer>
  );
}
