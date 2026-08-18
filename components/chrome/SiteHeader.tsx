import Link from "next/link";

const links = [
  ["Work", "/work"],
  ["Résumé", "/resume"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand-mark" href="/" aria-label="Drew Baker, home">
          <strong>DB</strong>
          <i aria-hidden="true" />
          <span>Evidence-bound systems</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
          <span className="nav-status">Selected work / 2026</span>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation menu">Menu</summary>
          <nav aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
            <a href="https://github.com/drwbkr1" target="_blank" rel="noreferrer">
              GitHub <span className="sr-only">(opens in a new tab)</span> ↗
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
