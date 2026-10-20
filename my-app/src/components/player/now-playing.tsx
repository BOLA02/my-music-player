"use client";

import { ChevronDown, Heart } from "lucide-react";
import { useEffect } from "react";
import { Artwork } from "./artwork";
import { PlayerControls, VolumeControl } from "./player-controls";
import { usePlayer } from "./player-provider";
import { ProgressBar } from "./progress-bar";

export function NowPlaying() {
  const { current, nowPlayingOpen, setNowPlayingOpen, toggleFavorite } = usePlayer();
  const open = nowPlayingOpen && !!current;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNowPlayingOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setNowPlayingOpen]);

  if (!open || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-zinc-950 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    >
      {current.artUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.artUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl"
        />
      )}
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-6">
        <header className="flex items-center justify-between py-3">
          <button
            aria-label="Close full-screen player"
            onClick={() => setNowPlayingOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full text-zinc-300 hover:text-white"
          >
            <ChevronDown size={26} />
          </button>
          <span className="text-xs uppercase tracking-widest text-zinc-400">Now playing</span>
          <span className="h-10 w-10" />
        </header>

        <div className="grid flex-1 place-items-center py-2">
          {/* Capped by viewport height so the controls stay on screen on short phones. */}
          <div className="shadow-2xl shadow-black/60">
            <Artwork url={current.artUrl} size="min(22rem, 100%, 36dvh)" />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold">{current.title}</h2>
            <p className="truncate text-sm text-zinc-400">{current.artist}</p>
            <p className="truncate text-xs text-zinc-500">{current.album}</p>
          </div>
          <button
            aria-label={current.favorite ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={current.favorite}
            onClick={() => toggleFavorite(current.id)}
            className={`grid h-10 w-10 place-items-center rounded-full ${current.favorite ? "text-emerald-400" : "text-zinc-400 hover:text-white"}`}
          >
            <Heart size={22} fill={current.favorite ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="grid gap-4">
          <ProgressBar />
          <PlayerControls />
          <div className="flex justify-center">
            <VolumeControl />
          </div>
        </div>
      </div>
    </div>
  );
}
