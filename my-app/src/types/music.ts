export type Track = {
  id: string;
  title: string;
  fileName: string;
  url: string;
  duration: number;
};

export type RepeatMode = "off" | "all" | "one";
