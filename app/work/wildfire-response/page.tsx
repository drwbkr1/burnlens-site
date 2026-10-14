import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Wildfire Response — Make the next order count",
  description:
    "Drew Baker's product direction and playtest-led iteration for a cooperative browser game about protecting a community with limited resources.",
  alternates: { canonical: "/work/wildfire-response" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Wildfire Response | Drew Baker",
    description: "Cooperative decisions on a changing fireground.",
    url: "/work/wildfire-response",
    type: "article",
  },
};

export default function WildfireResponseCaseStudy() {
  return (
    <main id="main-content" className={styles.page}>
      <article>
        <section className={styles.opening} aria-labelledby="wildfire-title">
          <div className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>Current project / Cooperative game</p>
              <h1 id="wildfire-title">
                Wildfire Response
                <span>Make the next order count.</span>
              </h1>
            </div>
            <div className={styles.introduction}>
              <p>
                A cooperative browser game about deciding what to protect when water,
                money and crew time are limited.
              </p>
              <p>
                I shaped the product direction and brought playtest feedback into the
                map, controls and consequences. I work with Codex on implementation
                and iteration.
              </p>
              <a className={styles.textLink} href="#my-decisions">
                See the decisions <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <dl className={styles.roleStrip}>
            <div><dt>My contribution</dt><dd>Product direction and playtest feedback</dd></div>
            <div><dt>Made with</dt><dd>Codex-assisted development and game art</dd></div>
            <div><dt>The experience</dt><dd>Shared map · timed orders · team consequences</dd></div>
          </dl>

          <figure className={styles.leadFigure}>
            <Image
              src="/media/projects/wildfire-response/planning-v027.jpg"
              width={1279}
              height={631}
              sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1440px) calc(100vw - 96px), 1280px"
              alt="Wildfire Response planning interface: a triangular terrain map shows fire, wind, homes, crew positions and forecasts above resource-aware action cards and a two-order queue."
              preload
            />
            <figcaption>
              <span>01 / The shared fireground</span>
              <p>
                Actual v0.27 interface displaying a historical development fixture.
                The room code is synthetic and gameplay was disabled for this capture.
                Terrain art is AI-assisted.
              </p>
            </figcaption>
          </figure>

          <dl className={styles.boardNotes}>
            <div><dt>See what you have</dt><dd>Water and shared spending stay beside the decisions that use them.</dd></div>
            <div><dt>Read what might happen</dt><dd>Wind, heat and queued plans inform the next-phase forecast.</dd></div>
            <div><dt>Coordinate the response</dt><dd>Crew plans and Team Radio share intentions before orders resolve.</dd></div>
          </dl>
        </section>

        <section id="my-decisions" className={styles.decisions} aria-labelledby="decisions-title">
          <header className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Product decisions / From my first playtest</p>
            <h2 id="decisions-title">Make the choices visible.</h2>
          </header>

          <div className={styles.decisionSpread}>
            <p className={styles.largeNote}>
              My first-playtest feedback led to a larger map, distinct crew approaches,
              connected fire lines and location-based resupply.
            </p>
            <div>
              <p>
                The important detail was the cost of a choice. An action needed a clear
                purpose, price and projected effect before it entered the queue.
                Camera controls, visible sectors and supply points made the wider
                map easier to inspect.
              </p>
              <p>
                The resulting loop keeps the map in view while Orders, Situation Report
                and Team Radio handle different jobs. Players prepare a plan, see its
                costs and expected effects, and then watch crew and fire phases resolve.
              </p>
            </div>
          </div>

          <div className={styles.ruleStory}>
            <div>
              <p className={styles.eyebrow}>A design correction</p>
              <h3>A line should help without becoming the answer to everything.</h3>
              <p>
                In the early rules, a line permanently blocked spread while partial
                suppression did not reduce its probability. Iteration gave cooling
                immediate value and introduced forecasted ember crossings.
              </p>
              <p>
                That turns one repeated action into several different responses:
                cool the source, defend a structure, or remove fuel at a landing.
                These are disclosed game abstractions, not calibrated wildfire predictions.
              </p>
            </div>
            <div className={styles.choices}>
              <p className={styles.choiceLabel}>Explore the tradeoffs</p>
              <details open>
                <summary><span>01</span> Cool the source</summary>
                <p>Suppression spends water to lower heat. Lower heat reduces outgoing danger before the fire is fully extinguished.</p>
              </details>
              <details>
                <summary><span>02</span> Build a line</summary>
                <p>Clearing open fuel holds ordinary surface spread. A hot source in gusts can send embers across a cleared strip; the forecast exposes that route.</p>
              </details>
              <details>
                <summary><span>03</span> Protect a place</summary>
                <p>Protection buys a home or water pump time. Its limited window makes timing, travel and the next order part of the decision.</p>
              </details>
            </div>
          </div>

          <figure className={styles.planFigure}>
            <Image
              src="/media/projects/wildfire-response/saved-plan-v024.jpg"
              width={1265}
              height={712}
              sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1440px) 68vw, 860px"
              alt="Historical v0.24 Situation Report showing a saved two-order plan, expected effects, travel and resource limits, and a shared field ledger."
            />
            <figcaption>
              <span>02 / Inspect before committing</span>
              <p>
                v0.24 saved-plan interface in a synthetic, paused development fixture.
                The surrounding test frame is retained. This shows the interface,
                not an independent player session.
              </p>
            </figcaption>
          </figure>
        </section>

        <section className={styles.next} aria-labelledby="next-title">
          <div>
            <p className={styles.eyebrow}>The work now</p>
            <h2 id="next-title">A playable project, still evolving.</h2>
          </div>
          <div>
            <p>
              The build brings together the map, five crew actions, a two-order queue,
              shared resources, fire phases, radio and a team result. The next useful
              evidence comes from people playing together: what they understand,
              how they coordinate and whether the choices remain interesting.
            </p>
            <p className={styles.status}>
              Independent human playtests and physical-device experience remain open.
              Network recovery and wider role balance also need further work.
              This is a game, not emergency guidance.
            </p>
            <details className={styles.sources}>
              <summary>About the evidence and collaboration</summary>
              <p>
                The project changelog records my first-playtest improvements. The
                accepted goal sets the product direction; Codex carries out
                AI-assisted development within it. Screenshots show version-labelled
                development fixtures. They do not establish player satisfaction,
                independent multiplayer testing or real-world fire accuracy.
              </p>
              <a href="/media/projects/wildfire-response/sources.json">Read the media provenance record</a>
            </details>
            <div className={styles.exitLinks}>
              <a className={styles.textLink} href="https://wildfire-response-vertical-slice.drew-baker-15.chatgpt.site" target="_blank" rel="noreferrer">
                Open the game <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span>
              </a>
              <Link className={styles.textLink} href="/work">Return to selected work <span aria-hidden="true">←</span></Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
