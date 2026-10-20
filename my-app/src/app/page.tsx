"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { AddFilesButton } from "@/components/player/add-files-button";
import { TrackList } from "@/components/player/track-list";

export default function LibraryPage() {
  const [filter, setFilter] = useState("");
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-64 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Library</h1>
        <AddFilesButton />
      </header>
      <label className="mb-4 flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-zinc-400">
        <Search size={16} />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search tracks"
          className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        />
      </label>
      <TrackList filter={filter} />
    </main>
  );
}
