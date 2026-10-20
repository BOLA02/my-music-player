export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  fileName: string;
  url: string;
  artUrl: string | null;
  duration: number;
  favorite: boolean;
};

export type Playlist = {
  id: string;
  name: string;
  trackIds: string[];
};

export type RepeatMode = "off" | "all" | "one";
