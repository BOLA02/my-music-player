import { Music } from "lucide-react";

// `size` is px, or any CSS length (e.g. "min(22rem, 38dvh)") for a responsive square.
export function Artwork({ url, size = 40 }: { url: string | null; size?: number | string }) {
  const box = { width: size, aspectRatio: "1", maxWidth: "100%" };
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" style={box} className="aspect-square shrink-0 rounded-lg object-cover" />
  ) : (
    <span style={box} className="grid aspect-square shrink-0 place-items-center rounded-lg bg-zinc-800 text-zinc-500">
      <Music size={typeof size === "number" ? Math.round(size * 0.45) : 64} />
    </span>
  );
}
