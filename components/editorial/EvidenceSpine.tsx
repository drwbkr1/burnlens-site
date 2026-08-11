type EvidenceSpineProps = {
  id: string;
  claim: string;
  evidence: string;
  boundary: string;
};

export function EvidenceSpine({ id, claim, evidence, boundary }: EvidenceSpineProps) {
  return (
    <dl className="evidence-spine" aria-label={`Claim, evidence, and boundary ${id}`}>
      <div className="spine-row" data-kind="claim">
        <dt>C.{id}</dt>
        <dd>{claim}</dd>
      </div>
      <div className="spine-row" data-kind="evidence">
        <dt>E.{id}</dt>
        <dd>{evidence}</dd>
      </div>
      <div className="spine-row" data-kind="boundary">
        <dt>B.{id}</dt>
        <dd>{boundary}</dd>
      </div>
    </dl>
  );
}
