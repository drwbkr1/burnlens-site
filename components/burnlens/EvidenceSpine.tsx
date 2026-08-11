import type { ReactNode } from "react";

import styles from "./EvidenceSpine.module.css";

type EvidenceSpineProps = {
  index: string;
  claim: ReactNode;
  evidence: ReactNode;
  boundary: ReactNode;
};

export function EvidenceSpine({
  index,
  claim,
  evidence,
  boundary,
}: EvidenceSpineProps) {
  const paddedIndex = index.padStart(2, "0");

  return (
    <dl
      className={styles.spine}
      aria-label={`Claim, evidence, and boundary reference ${paddedIndex}`}
      data-evidence-spine={paddedIndex}
    >
      <div className={styles.entry} data-evidence-kind="claim">
        <dt className={styles.marker} id={`burnlens-c-${paddedIndex}`}>
          <span aria-hidden="true">C.{paddedIndex}</span>
          <span>Claim</span>
        </dt>
        <dd>{claim}</dd>
      </div>
      <div className={styles.entry} data-evidence-kind="evidence">
        <dt className={styles.marker} id={`burnlens-e-${paddedIndex}`}>
          <span aria-hidden="true">E.{paddedIndex}</span>
          <span>Evidence</span>
        </dt>
        <dd>{evidence}</dd>
      </div>
      <div className={styles.entry} data-evidence-kind="boundary">
        <dt className={styles.marker} id={`burnlens-b-${paddedIndex}`}>
          <span aria-hidden="true">B.{paddedIndex}</span>
          <span>Boundary</span>
        </dt>
        <dd>{boundary}</dd>
      </div>
    </dl>
  );
}
