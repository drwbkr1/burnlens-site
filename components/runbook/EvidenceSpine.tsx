import styles from "./EvidenceSpine.module.css";

type EvidenceSpineProps = {
  claim: string;
  evidence: string;
  boundary: string;
};

export function EvidenceSpine({ claim, evidence, boundary }: EvidenceSpineProps) {
  return (
    <dl className={styles.spine}>
      <div data-kind="claim">
        <dt>C.01</dt>
        <dd>
          <span>Claim</span>
          {claim}
        </dd>
      </div>
      <div data-kind="evidence">
        <dt>E.01</dt>
        <dd>
          <span>Evidence</span>
          {evidence}
        </dd>
      </div>
      <div data-kind="boundary">
        <dt>B.01</dt>
        <dd>
          <span>Boundary</span>
          {boundary}
        </dd>
      </div>
    </dl>
  );
}
