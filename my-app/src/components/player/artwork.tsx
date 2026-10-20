import { Music } from "lucide-react";

export function Artwork({ url, size = 40 }: { url: string | null; size?: number }) {
  const box = { width: size, height: size };
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" style={box} className="shrink-0 rounded-lg object-cover" />
  ) : (
    <span style={box} className="grid shrink-0 place-items-center rounded-lg bg-zinc-800 text-zinc-500">
      <Music size={Math.round(size * 0.45)} />
    </span>
  );
}
