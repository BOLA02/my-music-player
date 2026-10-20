"use client";

import { usePlayer } from "./player-provider";
import { PlayerControls, VolumeControl } from "./player-controls";
import { ProgressBar } from "./progress-bar";

export function PlayerBar() {
  const { current, error } = usePlayer();
  return (
    <footer className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-2xl gap-2 px-4 py-3">
        <div className="min-h-5 truncate text-center text-sm">
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <span className="text-zinc-200">{current?.title ?? "Nothing playing"}</span>
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
