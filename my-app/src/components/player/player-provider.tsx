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
import { isAudioFile, readTrack } from "@/lib/audio";
import {
  deleteStoredPlaylist,
  deleteStoredTrack,
  loadLibrary,
  saveTrack,
  savePlaylist,
  type StoredTrack,
} from "@/lib/storage";
import type { Playlist, RepeatMode, Track } from "@/types/music";

type Entry = { track: Track; stored: StoredTrack };

function toEntry(stored: StoredTrack): Entry {
  const { file, art, addedAt: _addedAt, ...rest } = stored;
  void _addedAt;
  return {
    stored,
    track: { ...rest, url: URL.createObjectURL(file), artUrl: art ? URL.createObjectURL(art) : null },
  };
}

function freeEntry({ track }: Entry) {
  URL.revokeObjectURL(track.url);
  if (track.artUrl) URL.revokeObjectURL(track.artUrl);
}

type PlayerState = {
  tracks: Track[];
  playlists: Playlist[];
  ready: boolean;
  current: Track | null;
  playing: boolean;
  time: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  nowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;
  addFiles: (files: File[]) => Promise<void>;
  removeTrack: (id: string) => void;
  play: (id: string, context?: string[]) => void;
  toggleFavorite: (id: string) => void;
  createPlaylist: (name: string, trackId?: string) => string;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylist: (playlistId: string, fromTrackId: string, toTrackId: string) => void;
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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [ready, setReady] = useState(false);
  const tracks = useMemo(() => entries.map((e) => e.track), [entries]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [error, setError] = useState<string | null>(null);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const current = useMemo(
    () => tracks.find((t) => t.id === currentId) ?? null,
    [tracks, currentId],
  );

  // Keep latest values reachable from audio event handlers.
  const live = useRef({ entries, playlists, queue, currentId, shuffle, repeat });
  useEffect(() => {
    live.current = { entries, playlists, queue, currentId, shuffle, repeat };
  });

  // Restore the saved library on first load.
  useEffect(() => {
    let cancelled = false;
    loadLibrary()
      .then((lib) => {
        if (cancelled) return;
        setEntries(lib.tracks.map(toEntry));
        setPlaylists(lib.playlists);
      })
      .catch(() => setError("Couldn't open saved library; changes won't be kept."))
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const startTrack = useCallback((id: string, context?: string[]) => {
    setError(null);
    setQueue(context ?? null);
    setCurrentId(id);
  }, []);

  // Load and play when the file changes. Keyed on the URL, not the track
  // object, so editing metadata (e.g. toggling a favourite) never restarts it.
  const currentUrl = current?.url ?? null;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentUrl) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }
    audio.src = currentUrl;
    audio.play().catch(() => setPlaying(false));
  }, [currentUrl]);

  const pickNext = useCallback((direction: 1 | -1, auto: boolean): string | null => {
    const { entries, queue, currentId, shuffle, repeat } = live.current;
    const all = entries.map((e) => e.track.id);
    const ids = queue ? queue.filter((id) => all.includes(id)) : all;
    if (ids.length === 0) return null;
    const index = ids.indexOf(currentId ?? "");
    if (shuffle && ids.length > 1) {
      let i = index;
      while (i === index) i = Math.floor(Math.random() * ids.length);
      return ids[i];
    }
    const target = index + direction;
    if (target >= 0 && target < ids.length) return ids[target];
    if (repeat === "all" || !auto) return ids[(target + ids.length) % ids.length];
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
      const first = live.current.entries[0];
      if (first) startTrack(first.track.id);
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
    const audio = files.filter(isAudioFile);
    if (audio.length === 0) {
      setError("No audio files found in that selection.");
      return;
    }
    setError(null);
    const added: Entry[] = [];
    for (const file of audio) {
      const stored = await readTrack(file);
      saveTrack(stored).catch(() => setError("Couldn't save to the library on this device."));
      added.push(toEntry(stored));
      setEntries((prev) => [...prev, added[added.length - 1]]);
    }
  }, []);

  const removeTrack = useCallback((id: string) => {
    const entry = live.current.entries.find((e) => e.track.id === id);
    if (entry) freeEntry(entry);
    deleteStoredTrack(id).catch(() => {});
    setEntries((prev) => prev.filter((e) => e.track.id !== id));
    for (const pl of live.current.playlists) {
      if (pl.trackIds.includes(id)) {
        const updated = { ...pl, trackIds: pl.trackIds.filter((t) => t !== id) };
        savePlaylist(updated).catch(() => {});
        setPlaylists((prev) => prev.map((p) => (p.id === pl.id ? updated : p)));
      }
    }
    if (live.current.currentId === id) {
      setCurrentId(null);
      setPlaying(false);
      setTime(0);
      setDuration(0);
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.track.id !== id) return e;
        const favorite = !e.track.favorite;
        const stored = { ...e.stored, favorite };
        saveTrack(stored).catch(() => {});
        return { stored, track: { ...e.track, favorite } };
      }),
    );
  }, []);

  const updatePlaylist = useCallback((id: string, fn: (p: Playlist) => Playlist) => {
    const pl = live.current.playlists.find((p) => p.id === id);
    if (!pl) return;
    const updated = fn(pl);
    savePlaylist(updated).catch(() => {});
    setPlaylists((prev) => prev.map((p) => (p.id === id ? updated : p)));
    live.current.playlists = live.current.playlists.map((p) => (p.id === id ? updated : p));
  }, []);

  const createPlaylist = useCallback((name: string, trackId?: string) => {
    const pl: Playlist = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled playlist",
      trackIds: trackId ? [trackId] : [],
    };
    savePlaylist(pl).catch(() => {});
    setPlaylists((prev) => [...prev, pl]);
    live.current.playlists = [...live.current.playlists, pl];
    return pl.id;
  }, []);

  const renamePlaylist = useCallback(
    (id: string, name: string) =>
      updatePlaylist(id, (p) => ({ ...p, name: name.trim() || p.name })),
    [updatePlaylist],
  );

  const deletePlaylist = useCallback((id: string) => {
    deleteStoredPlaylist(id).catch(() => {});
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addToPlaylist = useCallback(
    (playlistId: string, trackId: string) =>
      updatePlaylist(playlistId, (p) =>
        p.trackIds.includes(trackId) ? p : { ...p, trackIds: [...p.trackIds, trackId] },
      ),
    [updatePlaylist],
  );

  // Moves fromTrackId to the position currently held by toTrackId.
  const reorderPlaylist = useCallback(
    (playlistId: string, fromTrackId: string, toTrackId: string) =>
      updatePlaylist(playlistId, (p) => {
        const ids = [...p.trackIds];
        const from = ids.indexOf(fromTrackId);
        const to = ids.indexOf(toTrackId);
        if (from < 0 || to < 0 || from === to) return p;
        ids.splice(from, 1);
        ids.splice(to, 0, fromTrackId);
        return { ...p, trackIds: ids };
      }),
    [updatePlaylist],
  );

  const removeFromPlaylist = useCallback(
    (playlistId: string, trackId: string) =>
      updatePlaylist(playlistId, (p) => ({ ...p, trackIds: p.trackIds.filter((t) => t !== trackId) })),
    [updatePlaylist],
  );

  // Lock-screen / notification controls where supported.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = current
      ? new MediaMetadata({
          title: current.title,
          artist: current.artist,
          album: current.album,
          artwork: current.artUrl ? [{ src: current.artUrl }] : [],
        })
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
    playlists,
    ready,
    current,
    playing,
    time,
    duration,
    volume,
    shuffle,
    repeat,
    error,
    nowPlayingOpen,
    setNowPlayingOpen,
    addFiles,
    removeTrack,
    play: startTrack,
    toggleFavorite,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    reorderPlaylist,
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
