"use client";

import { Artwork } from "./artwork";
import { usePlayer } from "./player-provider";
import { PlayerControls, VolumeControl } from "./player-controls";
import { ProgressBar } from "./progress-bar";

export function PlayerBar() {
  const { current, error } = usePlayer();
  return (
    <footer className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-2xl gap-2 px-4 py-3">
        <div className="flex min-h-10 items-center justify-center gap-3 text-sm">
          {current && !error && <Artwork url={current.artUrl} size={40} />}
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <span className="min-w-0 text-center">
              <span className="block truncate text-zinc-100">{current?.title ?? "Nothing playing"}</span>
              {current && <span className="block truncate text-xs text-zinc-500">{current.artist}</span>}
            </span>
          )}
        </div>
        <ProgressBar />
        <PlayerControls />
        <div className="hidden justify-center sm:flex">
          <VolumeControl />
        </div>
      </div>
    </footer>
  );
}
