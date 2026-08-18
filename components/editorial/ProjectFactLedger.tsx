import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { NonEmpty } from "@/content/project-model";

export type ProjectFact = {
  id: string;
  term: ReactNode;
  detail: ReactNode;
};

export type ProjectFactLedgerProps = Omit<ComponentPropsWithoutRef<"dl">, "children"> & {
  facts: NonEmpty<ProjectFact>;
};

/**
 * A deliberately unstyled definition list for compact, source-backed facts.
 * The caller owns ordering, labels, and every visual treatment.
 */
export function ProjectFactLedger({ facts, ...descriptionListProps }: ProjectFactLedgerProps) {
  return (
    <dl {...descriptionListProps}>
      {facts.map((fact) => (
        <div key={fact.id}>
          <dt>{fact.term}</dt>
          <dd>{fact.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
