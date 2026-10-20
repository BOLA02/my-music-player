"use client";

import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "./player-provider";

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full text-zinc-300 transition hover:text-white disabled:opacity-30";

export function PlayerControls() {
  const p = usePlayer();
  const empty = p.tracks.length === 0;
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        aria-label="Shuffle"
        aria-pressed={p.shuffle}
        onClick={p.toggleShuffle}
        className={`${iconBtn} ${p.shuffle ? "!text-emerald-400" : ""}`}
      >
        <Shuffle size={18} />
      </button>
      <button aria-label="Previous" onClick={p.previous} disabled={empty} className={iconBtn}>
        <SkipBack size={22} />
      </button>
      <button
        aria-label={p.playing ? "Pause" : "Play"}
        onClick={p.toggle}
        disabled={empty}
        className="grid h-14 w-14 place-items-center rounded-full bg-emerald-400 text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-30"
      >
        {p.playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
      </button>
      <button aria-label="Next" onClick={p.next} disabled={empty} className={iconBtn}>
        <SkipForward size={22} />
      </button>
      <button
        aria-label={`Repeat ${p.repeat}`}
        onClick={p.cycleRepeat}
        className={`${iconBtn} ${p.repeat !== "off" ? "!text-emerald-400" : ""}`}
      >
        {p.repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
      </button>
    </div>
  );
}

export function VolumeControl() {
  const { volume, setVolume } = usePlayer();
  return (
    <div className="flex items-center gap-2 text-zinc-400">
      <button aria-label={volume === 0 ? "Unmute" : "Mute"} onClick={() => setVolume(volume === 0 ? 1 : 0)}>
        {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <input
        type="range"
        aria-label="Volume"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="h-1 w-24 cursor-pointer accent-emerald-400"
      />
    </div>
  );
}
