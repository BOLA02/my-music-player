import type { Track } from "@/types/music";
import { titleFromFileName } from "./format";

let counter = 0;

function readDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const probe = new Audio();
    probe.preload = "metadata";
    probe.onloadedmetadata = () => resolve(probe.duration);
    probe.onerror = () => resolve(NaN);
    probe.src = url;
  });
}

export async function filesToTracks(files: File[]): Promise<Track[]> {
  const audio = files.filter(
    (f) => f.type.startsWith("audio/") || /\.(mp3|flac|m4a|aac|ogg|opus|wav)$/i.test(f.name),
  );
  return Promise.all(
    audio.map(async (file) => {
      const url = URL.createObjectURL(file);
      return {
        id: `${Date.now()}-${counter++}`,
        title: titleFromFileName(file.name),
        fileName: file.name,
        url,
        duration: await readDuration(url),
      };
    }),
  );
}
