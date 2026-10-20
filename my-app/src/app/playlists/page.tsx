"use client";

import { ListMusic, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePlayer } from "@/components/player/player-provider";

export default function PlaylistsPage() {
  const { playlists, createPlaylist, ready } = usePlayer();
  const router = useRouter();
  const [name, setName] = useState("");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-64 pt-6">
      <h1 className="mb-4 text-2xl font-semibold">Playlists</h1>
      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          // An empty name gets a default instead of silently doing nothing.
          const fallback = `Playlist ${playlists.length + 1}`;
          router.push(`/playlists/${createPlaylist(name.trim() || fallback)}`);
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name (optional)"
          className="flex-1 rounded-full bg-zinc-900 px-4 py-2 text-sm outline-none placeholder:text-zinc-500"
        />
        <button className="flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-300">
          <Plus size={16} /> Create
        </button>
      </form>
      {ready && playlists.length === 0 && (
        <p className="py-10 text-center text-zinc-500">No playlists yet.</p>
      )}
      <ul className="divide-y divide-zinc-800">
        {playlists.map((p) => (
          <li key={p.id}>
            <Link href={`/playlists/${p.id}`} className="flex items-center gap-3 py-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-800 text-zinc-400">
                <ListMusic size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{p.name}</span>
                <span className="block text-xs text-zinc-500">
                  {p.trackIds.length} {p.trackIds.length === 1 ? "track" : "tracks"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
