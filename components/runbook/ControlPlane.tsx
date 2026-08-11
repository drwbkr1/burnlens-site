import styles from "./ControlPlane.module.css";

const signalNodes = [
  {
    code: "S.01",
    title: "Evidence intake",
    note: "Fresh records, stale identities, and untrusted guidance stay distinguishable.",
  },
  {
    code: "S.02",
    title: "Bounded agent",
    note: "Diagnose, request evidence, propose an allowlisted action, or abstain.",
  },
  {
    code: "S.03",
    title: "Typed proposal",
    note: "A persisted request with no approval or execution authority.",
  },
];

const controlNodes = [
  {
    code: "K.01",
    title: "Operator capability",
    note: "A separate, launch-scoped loopback credential authorizes approval creation.",
  },
  {
    code: "K.02",
    title: "Deterministic gate",
    note: "Policy, one-time approval, arguments, replay, and idempotency are checked outside the model.",
  },
  {
    code: "K.03",
    title: "Synthetic executor",
    note: "Only three allowlisted state transitions exist, all inside repository-local test state.",
  },
];

function Rail({
  label,
  nodes,
  kind,
}: {
  label: string;
  nodes: typeof signalNodes;
  kind: "signal" | "control";
}) {
  return (
    <section className={styles.rail} data-kind={kind} aria-label={label}>
      <div className={styles.railLabel}>
        <span aria-hidden="true" />
        {label}
      </div>
      <ol>
        {nodes.map((node) => (
          <li key={node.code}>
            <span className={styles.nodeCode}>{node.code}</span>
            <strong>{node.title}</strong>
            <p>{node.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ControlPlane() {
  return (
    <figure className={styles.board}>
      <div className={styles.boardHead}>
        <span>Relay drawing · RB-020</span>
        <strong>Real infrastructure: disconnected</strong>
      </div>

      <Rail label="Signal path · model may contribute" nodes={signalNodes} kind="signal" />

      <div className={styles.breaker} role="note">
        <span aria-hidden="true" />
        <p>
          <strong>Authority break</strong>
          The proposal crosses no boundary by itself.
        </p>
        <span aria-hidden="true" />
      </div>

      <Rail label="Control path · deterministic authority" nodes={controlNodes} kind="control" />

      <figcaption>
        The model-facing path ends at a typed proposal. Approval and mutation remain on a
        separate control path that the model cannot call.
      </figcaption>
    </figure>
  );
}
