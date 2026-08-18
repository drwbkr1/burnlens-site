import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  getPublicSourceHref,
  type PublicLinkSourceId,
} from "@/content/project-model";

export type EvidenceLinkProps = Omit<ComponentPropsWithoutRef<"a">, "children" | "href"> & {
  sourceId: PublicLinkSourceId;
  readerLabel: ReactNode;
  provenanceLabel?: ReactNode;
  provenanceSeparator?: ReactNode;
};

/**
 * A public-source-only link whose reader-facing label leads any provenance
 * handle. It intentionally adds no classes, hidden text, target, or rel.
 */
export function EvidenceLink({
  sourceId,
  readerLabel,
  provenanceLabel,
  provenanceSeparator = " — ",
  ...anchorProps
}: EvidenceLinkProps) {
  return (
    <a {...anchorProps} href={getPublicSourceHref(sourceId)}>
      {readerLabel}
      {provenanceLabel === undefined ? null : (
        <>
          {provenanceSeparator}
          {provenanceLabel}
        </>
      )}
    </a>
  );
}
