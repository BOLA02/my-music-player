"use client";

import { ArrowLeft, Check, Pencil, Play, Shuffle, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { usePlayer } from "@/components/player/player-provider";
import { TrackList } from "@/components/player/track-list";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { playlists, tracks, ready, play, toggleShuffle, shuffle, renamePlaylist, deletePlaylist, removeFromPlaylist, reorderPlaylist } =
    usePlayer();
  const [editing, setEditing] = useState<string | null>(null);

  const playlist = playlists.find((p) => p.id === id);
  if (!ready) return null;
  if (!playlist) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6">
        <p className="text-zinc-400">Playlist not found.</p>
        <Link href="/playlists" className="text-emerald-400">Back to playlists</Link>
      </main>
    );
  }

  const items = playlist.trackIds
    .map((tid) => tracks.find((t) => t.id === tid))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const ids = items.map((t) => t.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-64 pt-6">
      <Link href="/playlists" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft size={14} /> Playlists
      </Link>
      <header className="mb-4 flex items-center gap-2">
        {editing !== null ? (
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              renamePlaylist(playlist.id, editing);
              setEditing(null);
            }}
          >
            <input
              autoFocus
              value={editing}
              onChange={(e) => setEditing(e.target.value)}
              className="flex-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xl outline-none"
            />
            <button aria-label="Save name" className="text-emerald-400"><Check size={20} /></button>
            <button type="button" aria-label="Cancel" onClick={() => setEditing(null)} className="text-zinc-400"><X size={20} /></button>
          </form>
        ) : (
          <>
            <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold">{playlist.name}</h1>
            <button aria-label="Rename playlist" onClick={() => setEditing(playlist.name)} className="text-zinc-400 hover:text-white">
              <Pencil size={18} />
            </button>
            <button
              aria-label="Delete playlist"
              onClick={() => {
                if (confirm(`Delete "${playlist.name}"? Your songs stay in the library.`)) {
                  deletePlaylist(playlist.id);
                  router.push("/playlists");
                }
              }}
              className="text-zinc-400 hover:text-red-400"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </header>
      <div className="mb-4 flex gap-2">
        <button
          disabled={items.length === 0}
          onClick={() => play(ids[0], ids)}
          className="flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-300 disabled:opacity-40"
        >
          <Play size={16} fill="currentColor" /> Play
        </button>
        <button
          disabled={items.length === 0}
          onClick={() => {
            if (!shuffle) toggleShuffle();
            play(ids[Math.floor(Math.random() * ids.length)], ids);
          }}
          className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 disabled:opacity-40"
        >
          <Shuffle size={16} /> Shuffle
        </button>
      </div>
      <TrackList
        tracks={items}
        onReorder={(from, to) => reorderPlaylist(playlist.id, items[from].id, items[to].id)}
        emptyText="Empty playlist. Use the add-to-playlist button on any song in your library."
        rowAction={(t) => (
          <button
            aria-label={`Remove ${t.title} from playlist`}
            onClick={() => removeFromPlaylist(playlist.id, t.id)}
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-600 hover:text-red-400"
          >
            <X size={16} />
          </button>
        )}
      />
    </main>
  );
}
