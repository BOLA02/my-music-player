"use client";

import { AudioLines, GripVertical, Heart, Music, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { formatTime } from "@/lib/format";
import type { Track } from "@/types/music";
import { Artwork } from "./artwork";
import { PlaylistMenu } from "./playlist-menu";
import { usePlayer } from "./player-provider";

type Props = {
  tracks: Track[];
  emptyText?: string;
  // Replaces the default "delete from library" button (e.g. remove from playlist).
  rowAction?: (track: Track) => ReactNode;
  // Enables drag handles. Receives the dragged row's old and new index.
  onReorder?: (from: number, to: number) => void;
};

type Drag = { from: number; to: number; offset: number; height: number };

// Pointer-event drag (HTML5 drag and drop doesn't fire on touch screens).
// Row positions are measured once at drag start, in page coordinates, so the
// math keeps working while the page auto-scrolls.
type Session = { startY: number; startScroll: number; lastY: number; mids: number[]; raf: number };

export function TrackList({
  tracks,
  emptyText = "Add some audio files to get started.",
  rowAction,
  onReorder,
}: Props) {
  const { current, playing, play, removeTrack, toggleFavorite } = usePlayer();
  const [drag, setDrag] = useState<Drag | null>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const session = useRef<Session | null>(null);

  useEffect(() => () => cancelAnimationFrame(session.current?.raf ?? 0), []);

  const measure = (from: number) => {
    const s = session.current;
    if (!s) return;
    const offset = s.lastY - s.startY + (window.scrollY - s.startScroll);
    const center = s.mids[from] + offset;
    let to = from;
    let best = Infinity;
    s.mids.forEach((m, i) => {
      const d = Math.abs(m - center);
      if (d < best) {
        best = d;
        to = i;
      }
    });
    setDrag((d) => (d ? { ...d, to, offset } : d));
  };

  const startDrag = (e: PointerEvent<HTMLButtonElement>, from: number) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const mids = rows.current.map((r) => {
      const b = r?.getBoundingClientRect();
      return b ? b.top + b.height / 2 + window.scrollY : 0;
    });
    const s: Session = { startY: e.clientY, startScroll: window.scrollY, lastY: e.clientY, mids, raf: 0 };
    session.current = s;
    setDrag({ from, to: from, offset: 0, height: rows.current[from]?.offsetHeight ?? 0 });
    // Keep the page scrolling while the finger rests near the top or bottom edge.
    const tick = () => {
      if (s.lastY < 90) window.scrollBy(0, -12);
      else if (s.lastY > window.innerHeight - 230) window.scrollBy(0, 12);
      measure(from);
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  };

  const moveDrag = (e: PointerEvent<HTMLButtonElement>) => {
    if (session.current) session.current.lastY = e.clientY;
  };

  const endDrag = (commit: boolean) => {
    const s = session.current;
    session.current = null;
    if (s) cancelAnimationFrame(s.raf);
    if (commit && drag && drag.to !== drag.from) onReorder?.(drag.from, drag.to);
    setDrag(null);
  };

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : index;
    if (to === index || to < 0 || to >= tracks.length) return;
    e.preventDefault();
    onReorder?.(index, to);
  };

  const rowStyle = (i: number) => {
    if (!drag) return undefined;
    if (i === drag.from) return { transform: `translateY(${drag.offset}px)`, zIndex: 10, transition: "none" };
    const shift =
      drag.from < drag.to && i > drag.from && i <= drag.to
        ? -drag.height
        : drag.from > drag.to && i >= drag.to && i < drag.from
          ? drag.height
          : 0;
    return { transform: `translateY(${shift}px)`, transition: "transform 150ms ease" };
  };

  if (tracks.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-zinc-700 px-6 py-16 text-center text-zinc-400">
        <Music size={36} />
        <p>{emptyText}</p>
      </div>
    );
  }

  const context = tracks.map((t) => t.id);

  return (
    <ul className="divide-y divide-zinc-800">
      {tracks.map((t, i) => {
        const active = t.id === current?.id;
        const dragging = drag?.from === i;
        return (
          <li
            key={t.id}
            ref={(el) => {
              rows.current[i] = el;
            }}
            style={rowStyle(i)}
            className={`relative flex items-center gap-1 ${dragging ? "rounded-xl bg-zinc-800 shadow-xl shadow-black/50" : "bg-zinc-950"}`}
          >
            {onReorder && (
              <button
                aria-label={`Reorder ${t.title}. Drag, or use the up and down arrow keys.`}
                onPointerDown={(e) => startDrag(e, i)}
                onPointerMove={moveDrag}
                onPointerUp={() => endDrag(true)}
                onPointerCancel={() => endDrag(false)}
                onKeyDown={(e) => onHandleKey(e, i)}
                style={{ touchAction: "none" }}
                className={`grid h-9 w-7 shrink-0 place-items-center rounded-md text-zinc-600 hover:text-white ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
              >
                <GripVertical size={18} />
              </button>
            )}
            <button
              onClick={() => play(t.id, context)}
              className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
            >
              <span className="relative">
                <Artwork url={t.artUrl} />
                {active && playing && (
                  <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/50">
                    <AudioLines size={18} className="text-emerald-400" />
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className={`block truncate ${active ? "text-emerald-400" : "text-zinc-100"}`}>{t.title}</span>
                <span className="block truncate text-xs text-zinc-500">
                  {t.artist} · {t.album}
                </span>
              </span>
            </button>
            <span className="hidden text-xs tabular-nums text-zinc-500 sm:block">{formatTime(t.duration)}</span>
            <button
              aria-label={t.favorite ? "Remove from favourites" : "Add to favourites"}
              aria-pressed={t.favorite}
              onClick={() => toggleFavorite(t.id)}
              className={`grid h-9 w-9 place-items-center rounded-full ${t.favorite ? "text-emerald-400" : "text-zinc-600 hover:text-white"}`}
            >
              <Heart size={16} fill={t.favorite ? "currentColor" : "none"} />
            </button>
            <PlaylistMenu trackId={t.id} />
            {rowAction ? (
              rowAction(t)
            ) : (
              <button
                aria-label={`Delete ${t.title}`}
                onClick={() => removeTrack(t.id)}
                className="grid h-9 w-9 place-items-center rounded-full text-zinc-600 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
