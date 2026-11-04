"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import styles from "./homepage.module.css";

export type ScreenshotSource = {
  src: `/media/projects/${string}.webp`;
  width: number;
  height: number;
};

export type ProjectImageRevealProps = {
  title: string;
  href: `/work/${string}`;
  skills: readonly string[];
  description: string;
  thumbnail: ScreenshotSource;
  expanded: ScreenshotSource;
  expandedMobile: ScreenshotSource;
  imageDescription: string;
  imageContext: readonly string[];
  imageSurface: `#${string}`;
  credit?: string;
  groupName?: string;
  priority?: boolean;
};

/** Enhancement only: native details/summary and the project link need no JS. */
export function dismissReveal(
  event: KeyboardEvent<HTMLElement>,
  details: HTMLDetailsElement | null,
  summary: HTMLElement | null,
) {
  if (
    event.key !== "Escape" || event.defaultPrevented || !details?.open ||
    !event.currentTarget.contains(event.target as Node)
  ) return false;
  event.preventDefault();
  details.open = false;
  summary?.focus({ preventScroll: true });
  return true;
}

export function ProjectImageReveal({
  title, href, skills, description, thumbnail, expanded, expandedMobile,
  imageDescription, imageContext, imageSurface, credit,
  groupName = "portfolio-project-previews", priority = false,
}: ProjectImageRevealProps) {
  const uid = useId();
  const titleId = `pfr-title-${uid}`;
  const contextId = `pfr-context-${uid}`;
  const creditId = `pfr-credit-${uid}`;
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const fullImage = useRef<HTMLImageElement>(null);
  const [imageReadiness, setImageReadiness] = useState<"native" | "pending" | "ready">("native");

  // Native disclosure and frame geometry work without hydration. Enhancement
  // only prevents a cold full-size image from replacing the thumbnail abruptly.
  useEffect(() => {
    const image = fullImage.current;
    if (!image) return;
    let disposed = false;
    const markReady = async () => {
      try {
        await image.decode();
      } catch {
        // Keep the actual thumbnail visible if the expanded asset cannot decode.
        return;
      }
      if (!disposed && image.naturalWidth > 0) setImageReadiness("ready");
    };
    const handleLoad = () => { void markReady(); };
    image.addEventListener("load", handleLoad);
    if (image.complete && image.naturalWidth > 0) void markReady();
    else setImageReadiness("pending");
    return () => {
      disposed = true;
      image.removeEventListener("load", handleLoad);
    };
  }, [expanded.src, expandedMobile.src]);

  return (
    <figure className={styles.pfrProject}>
      <article className={styles.pfrCard} aria-labelledby={titleId}
        style={{ "--pfr-image-surface": imageSurface } as CSSProperties}
        data-image-readiness={imageReadiness}
        onKeyDown={(event) => dismissReveal(event, details.current, summary.current)}>
        <details className={styles.pfrReveal} name={groupName} ref={details}>
          <summary className={styles.pfrSummary} ref={summary}>
            <span className={styles.pfrClosedLabel}>
              <span aria-hidden="true">Expand image</span>
              <span className={styles.pfrSrOnly}>{`Expand image: ${title}`}</span>
            </span>
            <span className={styles.pfrOpenLabel}>Collapse<span className={styles.pfrSrOnly}> {title} image</span></span>
          </summary>
          <div className={styles.pfrExpanded}>
            {/* Native closed details hides the qualified image from assistive
                technology immediately, independently of the visual contraction. */}
            <picture className={styles.pfrSrOnly}>
              <source media="(max-width: 450px)" srcSet={expandedMobile.src}
                width={expandedMobile.width} height={expandedMobile.height} />
              <img src={expanded.src} width={expanded.width} height={expanded.height}
                alt={imageDescription} loading="lazy" decoding="async"
                data-project-image-semantic
                aria-describedby={credit ? `${contextId} ${creditId}` : contextId} />
            </picture>
            <p className={styles.pfrContext} id={contextId}>
              {imageContext.map((line, index) => <span key={`${index}-${line}`}>{line}</span>)}
            </p>
          </div>
        </details>
        {/* This same frame persists through opening and closing. Its visual
            layers share cached assets with the native accessible image above. */}
        <div className={styles.pfrMediaFrame} data-project-image-frame aria-hidden="true">
          <img className={styles.pfrThumbnail} src={thumbnail.src} width={thumbnail.width}
            height={thumbnail.height} alt="" decoding="async" data-project-image-thumbnail
            loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} />
          <picture className={styles.pfrFullImage}>
            <source media="(max-width: 450px)" srcSet={expandedMobile.src}
              width={expandedMobile.width} height={expandedMobile.height} />
            <img ref={fullImage} src={expanded.src} width={expanded.width} height={expanded.height}
              alt="" loading="lazy" decoding="async" data-project-image-expanded />
          </picture>
        </div>
        <h2 className={styles.pfrTitle} id={titleId}>{title}</h2>
        <div className={styles.pfrDetails}>
          <ul className={styles.pfrSkills} aria-label="Relevant tools and skills">
            {skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
          <p>{description}</p>
        </div>
        <a className={styles.pfrExplore} href={href} aria-label={`Explore ${title} project`}>
          <span>Explore project <span aria-hidden="true">→</span></span>
        </a>
      </article>
      {credit && <figcaption className={styles.pfrCredit} id={creditId}>{credit}</figcaption>}
    </figure>
  );
}
