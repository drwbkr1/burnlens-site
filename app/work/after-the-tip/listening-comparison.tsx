"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Cohort } from "./ribbon-figure";
import styles from "./page.module.css";

const files = {
  all: "/media/projects/after-the-tip/lead-voices-all-40x.wav",
  purdue: "/media/projects/after-the-tip/lead-voices-purdue-40x.wav",
};

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export default function ListeningComparison() {
  const enhanced = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [cohort, setCohort] = useState<Cohort>("all");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const generation = useRef(0);
  const expected = useRef(files.all);
  const pending = useRef<{ time: number; play: boolean } | null>(null);

  useEffect(() => {
    const element = audio.current;
    if (pending.current && element) {
      // Request metadata only after React commits the selected source.
      element.preload = "metadata";
      element.load();
    }
  }, [cohort]);

  function choose(next: Cohort) {
    if (next === cohort || !audio.current) return;
    const element = audio.current;
    // Preserve intent even during a rapid A/B/A switch or a failed load.
    pending.current = pending.current ?? { time: element.currentTime, play: !element.paused && !element.ended };
    element.pause();
    expected.current = files[next];
    generation.current += 1;
    setError(false);
    setCohort(next);
  }

  function restorePosition() {
    const element = audio.current;
    if (!element || !element.currentSrc.endsWith(expected.current)) return;
    const intent = pending.current;
    if (!intent) return;
    const time = Math.min(intent.time, element.duration);
    if (element.currentTime !== time) element.currentTime = time;
    setSeconds(time);
    pending.current = null;
    if (intent.play) {
      const currentGeneration = generation.current;
      void element.play().catch(() => {
        if (currentGeneration === generation.current) setError(true);
      });
    }
  }

  function retry() {
    const element = audio.current;
    if (!element) return;
    pending.current ??= { time: seconds, play: false };
    element.preload = "metadata";
    setError(false);
    element.load();
  }

  const gameSeconds = Math.min(2400, Math.round(seconds * 40));
  const gameClock = `${Math.floor(gameSeconds / 60).toString().padStart(2, "0")}:${(gameSeconds % 60).toString().padStart(2, "0")}`;

  return (
    <section className={styles.listening} aria-label="Listen on one shared clock">
      <div className={styles.playerHeading}>
        <div><p className={styles.eyebrow}>Optional listening / Lead voices</p><h3>Change the cohort.<br />Keep your place.</h3></div>
        <p>Press play, then switch between the season and Purdue. Both excerpts run on the same regulation clock, compressed into one minute.</p>
      </div>
      <div className={styles.enhancedPlayer} data-ready={enhanced}>
        <div className={styles.cohortButtons} role="group" aria-label="Audio cohort">
          <button type="button" aria-pressed={cohort === "all"} onClick={() => choose("all")}>Full season</button>
          <button type="button" aria-pressed={cohort === "purdue"} onClick={() => choose("purdue")}>Purdue games</button>
        </div>
        <div className={styles.clock}><span>Regulation elapsed</span><output aria-label="Regulation elapsed" aria-live="off">{gameClock}</output><span>40× speed · 60-second export</span></div>
        <audio ref={audio} src={files[cohort]} controls preload="none" aria-label="After the Tip lead-voice excerpt" onLoadedMetadata={restorePosition} onTimeUpdate={() => { if (!pending.current && audio.current) setSeconds(audio.current.currentTime); }} onError={() => setError(true)} />
        {error && <div className={styles.audioError} role="alert"><p>Audio could not load or resume. The figures and explanation still work. Retry the file, or use the player’s play control.</p><button type="button" onClick={retry}>Retry audio</button></div>}
      </div>
      <noscript><div className={styles.staticAudio}><p>JavaScript is off. These separate players retain the two excerpts, but do not synchronize when switching.</p><label>Full season<audio controls preload="none" src={files.all} aria-label="Full season lead voices — independent player" /></label><label>Purdue games<audio controls preload="none" src={files.purdue} aria-label="Purdue lead voices — independent player" /></label></div></noscript>
      <p className={styles.audioNote}>Synthesized data, not a game recording. The lower voice represents the first side and the brighter voice the second; amplitude follows mean lead contribution. The pitches stay fixed in this mode. Start at a comfortable volume.</p>
    </section>
  );
}
