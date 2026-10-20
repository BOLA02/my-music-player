"use client";

import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AddFilesButton } from "@/components/player/add-files-button";
import { usePlayer } from "@/components/player/player-provider";
import { TrackList } from "@/components/player/track-list";

export default function LibraryPage() {
  const { tracks, ready } = usePlayer();
  const [filter, setFilter] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return tracks.filter(
      (t) =>
        (!onlyFavorites || t.favorite) &&
        (!q || `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q)),
    );
  }, [tracks, filter, onlyFavorites]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-64 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Library</h1>
        <AddFilesButton />
      </header>
      <div className="mb-4 flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-zinc-400">
          <Search size={16} />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search title, artist or album"
            className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </label>
        <button
          aria-label="Show favourites only"
          aria-pressed={onlyFavorites}
          onClick={() => setOnlyFavorites((v) => !v)}
          className={`grid h-10 w-10 place-items-center rounded-full bg-zinc-900 ${onlyFavorites ? "text-emerald-400" : "text-zinc-400"}`}
        >
          <Heart size={16} fill={onlyFavorites ? "currentColor" : "none"} />
        </button>
      </div>
      {ready && (
        <TrackList
          tracks={shown}
          emptyText={tracks.length === 0 ? "Add some audio files to get started." : "No matches."}
        />
      )}
    </main>
  );
}
