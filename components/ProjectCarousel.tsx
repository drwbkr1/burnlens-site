"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./ProjectCarousel.module.css";

export function ProjectCarousel({ children, projectNames }: { children: ReactNode; projectNames: readonly string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const positionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const controls = controlsRef.current;
    const previous = previousRef.current;
    const next = nextRef.current;
    const position = positionRef.current;
    if (!track || !controls || !previous || !next || !position) return;
    const cards = Array.from(track.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child.hasAttribute("data-carousel-slide"));
    if (cards.length !== projectNames.length || cards.length === 0) return;

    let frame = 0;
    const origin = () => cards[0].offsetLeft;
    const nearest = () => cards.reduce((best, card, index) => Math.abs(card.offsetLeft - origin() - track.scrollLeft) < Math.abs(cards[best].offsetLeft - origin() - track.scrollLeft) ? index : best, 0);
    const fit = (index: number) => {
      const padding = getComputedStyle(track);
      track.style.height = `${Math.ceil(cards[index].getBoundingClientRect().height + Number.parseFloat(padding.paddingTop) + Number.parseFloat(padding.paddingBottom))}px`;
    };
    const sync = () => {
      const index = nearest();
      previous.disabled = index === 0;
      next.disabled = index === cards.length - 1;
      const text = `${index + 1} of ${cards.length} · ${projectNames[index]}`;
      if (position.textContent !== text) position.textContent = text;
      fit(index);
    };
    const go = (index: number) => {
      const target = Math.max(0, Math.min(cards.length - 1, index));
      fit(target);
      track.scrollTo({ top: 0, left: cards[target].offsetLeft - origin(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    };
    const onPrevious = () => go(nearest() - 1);
    const onNext = () => go(nearest() + 1);
    const onKey = (event: KeyboardEvent) => {
      if (event.target !== track) return;
      const targets: Record<string, number> = { ArrowLeft: nearest() - 1, ArrowRight: nearest() + 1, Home: 0, End: cards.length - 1 };
      if (!(event.key in targets)) return;
      event.preventDefault();
      go(targets[event.key]);
    };
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLElement>("[data-carousel-slide]");
      if (card && cards.includes(card)) go(cards.indexOf(card));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    controls.hidden = false;
    position.hidden = false;
    previous.addEventListener("click", onPrevious);
    next.addEventListener("click", onNext);
    track.addEventListener("keydown", onKey);
    track.addEventListener("focusin", onFocus);
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("scrollend", sync);
    window.addEventListener("resize", sync);
    const observer = new ResizeObserver(sync);
    cards.forEach(card => observer.observe(card));
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      previous.removeEventListener("click", onPrevious);
      next.removeEventListener("click", onNext);
      track.removeEventListener("keydown", onKey);
      track.removeEventListener("focusin", onFocus);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", sync);
      window.removeEventListener("resize", sync);
      controls.hidden = true;
      position.hidden = true;
      track.style.removeProperty("height");
    };
  }, [projectNames]);

  return (
    <section id="selected-work" className={`shell ${styles.carousel}`} data-current-work data-front-door-flagships data-project-carousel aria-roledescription="carousel" aria-labelledby="current-work-title">
      <h2 id="current-work-title">Selected projects.</h2>
      <div ref={controlsRef} className={styles.controls} hidden>
        <button ref={previousRef} type="button" disabled aria-controls="project-track" aria-label="Previous project"><span aria-hidden="true">←</span> Previous</button>
        <button ref={nextRef} type="button" disabled aria-controls="project-track" aria-label="Next project">Next <span aria-hidden="true">→</span></button>
      </div>
      <div id="project-track" ref={trackRef} className={styles.track} role="group" tabIndex={0} aria-label="Selected project cards. Scroll horizontally to explore; use left and right arrows when this track is focused.">
        {children}
      </div>
      <p ref={positionRef} className={styles.position} aria-live="polite" aria-atomic="true" hidden />
      <p className={styles.hint}>Swipe or scroll to explore. Each project opens into its full story. <a href="/work">Browse all work <span aria-hidden="true">→</span></a></p>
    </section>
  );
}
