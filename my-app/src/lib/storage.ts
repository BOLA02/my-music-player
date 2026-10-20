import type { Playlist } from "@/types/music";

// Everything lives in IndexedDB: audio files are stored as Blobs, so the
// library is still there after the app is closed and reopened.

export type StoredTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  fileName: string;
  duration: number;
  favorite: boolean;
  file: Blob;
  art: Blob | null;
  addedAt: number;
};

const DB_NAME = "my-music";
const TRACKS = "tracks";
const PLAYLISTS = "playlists";

let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(TRACKS, { keyPath: "id" });
      req.result.createObjectStore(PLAYLISTS, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function run<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const req = fn(database.transaction(store, mode).objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadLibrary(): Promise<{ tracks: StoredTrack[]; playlists: Playlist[] }> {
  const [tracks, playlists] = await Promise.all([
    run<StoredTrack[]>(TRACKS, "readonly", (s) => s.getAll()),
    run<Playlist[]>(PLAYLISTS, "readonly", (s) => s.getAll()),
  ]);
  return { tracks: tracks.sort((a, b) => a.addedAt - b.addedAt), playlists };
}

export const saveTrack = (t: StoredTrack) => run(TRACKS, "readwrite", (s) => s.put(t));
export const deleteStoredTrack = (id: string) => run(TRACKS, "readwrite", (s) => s.delete(id));
export const savePlaylist = (p: Playlist) => run(PLAYLISTS, "readwrite", (s) => s.put(p));
export const deleteStoredPlaylist = (id: string) => run(PLAYLISTS, "readwrite", (s) => s.delete(id));
