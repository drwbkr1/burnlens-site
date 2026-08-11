"use client";

import { useRef, type MouseEvent } from "react";

type Chapter = readonly [number: string, label: string, href: `#${string}`];

type CaseChapterDisclosureProps = {
  ariaLabel: string;
  chapters: readonly Chapter[];
  className: string;
  projectId: string;
};

export function CaseChapterDisclosure({
  ariaLabel,
  chapters,
  className,
  projectId,
}: CaseChapterDisclosureProps) {
  const disclosureRef = useRef<HTMLDetailsElement>(null);

  function handleChapterNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const hash = event.currentTarget.hash;
    const targetId = hash.slice(1);
    event.preventDefault();
    disclosureRef.current?.removeAttribute("open");

    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      if (window.location.hash === hash) {
        window.history.replaceState(null, "", hash);
      } else {
        window.history.pushState(null, "", hash);
      }
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  return (
    <details
      ref={disclosureRef}
      className={className}
      data-case-chapters={projectId}
    >
      <summary>
        <span>Case index</span>
        <strong>Jump to a chapter</strong>
        <span aria-hidden="true">+</span>
      </summary>
      <nav aria-label={ariaLabel}>
        <ol>
          {chapters.map(([number, label, href]) => (
            <li key={number}>
              <a href={href} onClick={handleChapterNavigation}>
                <span>{number}</span>
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
