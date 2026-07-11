import Link from "next/link";
import { SearchBox } from "./SearchBox";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-base-600 bg-base-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-ink-100">
            EIOS
          </span>
          <span className="hidden font-mono text-xs text-ink-500 sm:inline">
            India Environmental Intelligence OS
          </span>
        </Link>

        <div className="hidden flex-1 max-w-md md:block">
          <SearchBox />
        </div>

        <nav className="flex items-center gap-6 text-sm text-ink-300">
          <Link href="/state/TN" className="hover:text-signal transition-colors">
            Tamil Nadu
          </Link>
          <Link href="/state/KL" className="hidden hover:text-signal transition-colors lg:inline">
            Kerala
          </Link>
          <Link href="/state/DL" className="hidden hover:text-signal transition-colors lg:inline">
            Delhi
          </Link>
          <a
            href="http://localhost:8000/docs"
            className="hover:text-signal transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            API Docs
          </a>
        </nav>
      </div>
    </header>
  );
}
