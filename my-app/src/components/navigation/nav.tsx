"use client";

import { Library, ListMusic } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Library", Icon: Library },
  { href: "/playlists", label: "Playlists", Icon: ListMusic },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl gap-1 px-4 py-2">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ${active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
