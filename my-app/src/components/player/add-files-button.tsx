"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import { usePlayer } from "./player-provider";

export function AddFilesButton() {
  const { addFiles } = usePlayer();
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="audio/*,.mp3,.flac,.m4a,.aac,.ogg,.opus,.wav"
        multiple
        hidden
        onChange={async (e) => {
          await addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <button
        onClick={() => input.current?.click()}
        className="flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-300"
      >
        <Plus size={16} /> Add music
      </button>
    </>
  );
}
