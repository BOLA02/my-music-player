import { parseBlob, selectCover } from "music-metadata";
import { titleFromFileName } from "./format";
import type { StoredTrack } from "./storage";

const AUDIO_EXT = /\.(mp3|flac|m4a|aac|ogg|opus|wav)$/i;

export function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/") || AUDIO_EXT.test(file.name);
}

function probeDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const probe = new Audio();
    probe.preload = "metadata";
    const done = (d: number) => {
      URL.revokeObjectURL(url);
      resolve(d);
    };
    probe.onloadedmetadata = () => done(probe.duration);
    probe.onerror = () => done(NaN);
    probe.src = url;
  });
}

export async function readTrack(file: File): Promise<StoredTrack> {
  let title = "";
  let artist = "";
  let album = "";
  let duration = NaN;
  let art: Blob | null = null;

  try {
    const meta = await parseBlob(file, { duration: true });
    title = meta.common.title ?? "";
    artist = meta.common.artist ?? "";
    album = meta.common.album ?? "";
    duration = meta.format.duration ?? NaN;
    const cover = selectCover(meta.common.picture);
    if (cover) art = new Blob([new Uint8Array(cover.data)], { type: cover.format });
  } catch {
    // Untagged or unreadable tags: fall back to the file name below.
  }

  if (!Number.isFinite(duration)) duration = await probeDuration(file);

  return {
    id: crypto.randomUUID(),
    title: title || titleFromFileName(file.name),
    artist: artist || "Unknown artist",
    album: album || "Unknown album",
    fileName: file.name,
    duration,
    favorite: false,
    file,
    art,
    addedAt: Date.now(),
  };
}
