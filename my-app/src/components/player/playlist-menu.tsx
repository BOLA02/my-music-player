"use client";

import { Check, ListPlus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./player-provider";

export function PlaylistMenu({ trackId }: { trackId: string }) {
  const { playlists, addToPlaylist, removeFromPlaylist, createPlaylist } = usePlayer();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        aria-label="Add to playlist"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:text-white"
      >
        <ListPlus size={18} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
          <p className="px-2 pb-1 text-xs uppercase tracking-wide text-zinc-500">Add to playlist</p>
          <ul className="max-h-48 overflow-y-auto">
            {playlists.map((p) => {
              const has = p.trackIds.includes(trackId);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => (has ? removeFromPlaylist(p.id, trackId) : addToPlaylist(p.id, trackId))}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-zinc-800"
                  >
                    <span className="truncate">{p.name}</span>
                    {has && <Check size={16} className="text-emerald-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <form
            className="mt-1 flex items-center gap-1 border-t border-zinc-800 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              createPlaylist(name, trackId);
              setName("");
              setOpen(false);
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New playlist"
              className="min-w-0 flex-1 rounded-lg bg-zinc-800 px-2 py-1.5 text-sm outline-none placeholder:text-zinc-500"
            />
            <button aria-label="Create playlist" className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400 text-zinc-950">
              <Plus size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
