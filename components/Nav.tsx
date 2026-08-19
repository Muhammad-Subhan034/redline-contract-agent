"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/review", label: "Review" },
  { href: "/playbook", label: "Playbook" },
  { href: "/evals", label: "Evals" },
  { href: "/audit", label: "Audit" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/12 bg-paper/97">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          Redline
        </Link>
        <nav className="flex items-center gap-1 font-mono text-[13px] uppercase tracking-wide">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-sm px-3 py-1.5 transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
