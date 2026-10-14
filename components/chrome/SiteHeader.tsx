"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

const links = [
  ["Work", "/work"],
  ["Résumé", "/resume"],
] as const;

function getAriaCurrent(pathname: string, href: (typeof links)[number][1]) {
  if (href === "/work") {
    if (pathname === href) return "page";
    if (pathname.startsWith(`${href}/`)) return "location";
  }

  return pathname === href ? "page" : undefined;
}

function closeMobileMenu(menu: HTMLDetailsElement | null) {
  if (!menu?.open) return;

  const summary = menu.querySelector("summary");
  const activeElement = menu.ownerDocument.activeElement;
  const hidesFocusedElement = activeElement !== summary && menu.contains(activeElement);

  menu.open = false;

  // Recover focus only when closing would hide its owner. Other navigation and
  // desktop links keep their own focus; a hidden mobile summary is never a target.
  if (hidesFocusedElement && summary?.getClientRects().length) {
    summary.focus({ preventScroll: true });
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const previousPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    // Initial hydration must not undo an interaction with the native disclosure.
    // Only committed cross-path navigation closes it here; onNavigate also
    // handles same-route activation without intercepting modified/native links.
    if (previousPathnameRef.current !== pathname) {
      closeMobileMenu(mobileMenuRef.current);
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="brand-mark"
          href="/"
          aria-label="Drew Baker, home"
          aria-current={pathname === "/" ? "page" : undefined}
          onNavigate={() => closeMobileMenu(mobileMenuRef.current)}
        >
          <strong>DB</strong>
          <i aria-hidden="true" />
          <span>Software, maps & interaction</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link
              aria-current={getAriaCurrent(pathname, href)}
              href={href}
              key={href}
              onNavigate={() => closeMobileMenu(mobileMenuRef.current)}
            >
              {label}
            </Link>
          ))}
          <span className="nav-status">Selected work / 2026</span>
        </nav>
        <details className="mobile-menu" ref={mobileMenuRef}>
          <summary>Menu</summary>
          <nav aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Link
                aria-current={getAriaCurrent(pathname, href)}
                href={href}
                key={href}
                onNavigate={() => closeMobileMenu(mobileMenuRef.current)}
              >
                {label}
              </Link>
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
