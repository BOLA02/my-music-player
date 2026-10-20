"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { filesToTracks } from "@/lib/audio";
import type { RepeatMode, Track } from "@/types/music";

type PlayerState = {
  tracks: Track[];
  current: Track | null;
  playing: boolean;
  time: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  addFiles: (files: File[]) => Promise<void>;
  removeTrack: (id: string) => void;
  play: (id: string) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

// The provider lives in the root layout, so the <audio> element and its
// state survive navigation between pages.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [error, setError] = useState<string | null>(null);

  const current = useMemo(
    () => tracks.find((t) => t.id === currentId) ?? null,
    [tracks, currentId],
  );

  // Keep latest values reachable from audio event handlers.
  const live = useRef({ tracks, currentId, shuffle, repeat });
  useEffect(() => {
    live.current = { tracks, currentId, shuffle, repeat };
  });

  const startTrack = useCallback((id: string) => {
    setError(null);
    setCurrentId(id);
  }, []);

  // Load and play whenever the current track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!current) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }
    audio.src = current.url;
    audio.play().catch(() => setPlaying(false));
  }, [current]);

  const pickNext = useCallback((direction: 1 | -1, auto: boolean): string | null => {
    const { tracks, currentId, shuffle, repeat } = live.current;
    if (tracks.length === 0) return null;
    const index = tracks.findIndex((t) => t.id === currentId);
    if (shuffle && tracks.length > 1) {
      let i = index;
      while (i === index) i = Math.floor(Math.random() * tracks.length);
      return tracks[i].id;
    }
    const target = index + direction;
    if (target >= 0 && target < tracks.length) return tracks[target].id;
    if (repeat === "all" || !auto) return tracks[(target + tracks.length) % tracks.length].id;
    return null;
  }, []);

  const next = useCallback(() => {
    const id = pickNext(1, false);
    if (id) startTrack(id);
  }, [pickNext, startTrack]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const id = pickNext(-1, false);
    if (id) startTrack(id);
  }, [pickNext, startTrack]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!live.current.currentId) {
      const first = live.current.tracks[0];
      if (first) startTrack(first.id);
      return;
    }
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [startTrack]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = seconds;
    setTime(seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const added = await filesToTracks(files);
    if (added.length === 0) {
      setError("No audio files found in that selection.");
      return;
    }
    setError(null);
    setTracks((prev) => [...prev, ...added]);
  }, []);

  const removeTrack = useCallback((id: string) => {
    const track = live.current.tracks.find((t) => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    setTracks((prev) => prev.filter((t) => t.id !== id));
    if (live.current.currentId === id) {
      setCurrentId(null);
      setPlaying(false);
      setTime(0);
      setDuration(0);
    }
  }, []);

  // Lock-screen / notification controls where supported.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = current
      ? new MediaMetadata({ title: current.title, artist: "Local file" })
      : null;
    ms.setActionHandler("play", toggle);
    ms.setActionHandler("pause", toggle);
    ms.setActionHandler("nexttrack", next);
    ms.setActionHandler("previoustrack", previous);
    ms.setActionHandler("seekto", (d) => {
      if (d.seekTime != null) seek(d.seekTime);
    });
  }, [current, toggle, next, previous, seek]);

  const onEnded = () => {
    if (live.current.repeat === "one") {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => setPlaying(false));
      }
      return;
    }
    const id = pickNext(1, true);
    if (id) startTrack(id);
    else setPlaying(false);
  };

  const value: PlayerState = {
    tracks,
    current,
    playing,
    time,
    duration,
    volume,
    shuffle,
    repeat,
    error,
    addFiles,
    removeTrack,
    play: startTrack,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle: () => setShuffle((s) => !s),
    cycleRepeat: () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onEnded}
        onError={() => {
          setPlaying(false);
          setError("This file can't be played in this browser.");
        }}
      />
    </PlayerContext.Provider>
  );
}
