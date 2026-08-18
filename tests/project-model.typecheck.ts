import {
  getProject,
  projectHierarchy,
  projectModel,
  projectRecords,
  projectSources,
  type FailureDividend,
  type MissingEvidence,
  type NonEmpty,
  type NotApplicableEvidence,
  type ProjectPlacement,
  type PublicLinkSourceId,
  type SourceId,
  type SourceIdFor,
  type SupportedEvidence,
} from "@/content/project-model";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

export type RawModelKeepsCanonicalSources = Expect<
  Equal<typeof projectModel.sources, typeof projectSources>
>;
export type RawModelKeepsCanonicalProjects = Expect<
  Equal<typeof projectModel.projects, typeof projectRecords>
>;
export type BurnLensSelectorKeepsLiteralIdentity = Expect<
  Equal<ReturnType<typeof getProject<"burnlens">>["id"], "burnlens">
>;
export type FlagshipHierarchyStartsWithBurnLens = Expect<
  Equal<(typeof projectHierarchy.flagship)[0], "burnlens">
>;

export type BurnLensSourcesStayTwoBound = Expect<
  Equal<SourceIdFor<"burnlens">, "burnlens-release" | "burnlens-pinned-tree">
>;
export const validBurnLensSources: NonEmpty<SourceIdFor<"burnlens">> = [
  "burnlens-release",
  "burnlens-pinned-tree",
];
export const validPublicLink: PublicLinkSourceId = "burnlens-release";

// @ts-expect-error A nonempty evidence-source tuple cannot be empty.
export const emptySourceTuple: NonEmpty<SourceId> = [];

// @ts-expect-error Unknown identifiers cannot enter canonical source truth.
export const unknownSourceId: SourceId = "unregistered-source";

// @ts-expect-error Runbook evidence cannot support a BurnLens fact.
export const crossProjectEvidence: SupportedEvidence<"burnlens"> = { state: "supported", strength: "verified", summary: "Invalid cross-project claim.", sourceIds: ["rs.readme.v0020"] };

// @ts-expect-error Supported facts require at least one project-owned source.
export const unsupportedSupportedFact: SupportedEvidence<"burnlens"> = { state: "supported", strength: "verified", summary: "Unsourced claim.", sourceIds: [] };

// @ts-expect-error Missing evidence is a planning state, not a public claim.
export const missingFactWithClaim: MissingEvidence = { state: "missing", reason: "Not established.", evidenceNeeded: ["Owner-confirmed evidence."], summary: "Do not render this." };

// @ts-expect-error Not-applicable evidence cannot carry source-backed claim fields.
export const notApplicableFactWithSources: NotApplicableEvidence = { state: "not_applicable", reason: "The artifact makes no such claim.", sourceIds: ["burnlens-release"] };

// @ts-expect-error The registry-controlled state vocabulary uses an underscore.
export const invalidNotApplicableSpelling: NotApplicableEvidence = { state: "not-applicable", reason: "Invalid state spelling." };

// @ts-expect-error Archive placement is coupled to link-only treatment and no route.
export const archiveUsingCaseStudyTreatment: ProjectPlacement = { lane: "archive", treatment: "designed-case-study", route: "/work/archive", routeType: "full-case-study", visualWorld: "field-atlas" };

// @ts-expect-error A failure dividend is incomplete without its public boundary.
export const failureWithoutBoundary: FailureDividend<"burnlens"> = { id: "INVALID", failure: "A bounded failure.", buildChange: "A bounded change.", earnedCapability: "A bounded capability.", sourceIds: ["burnlens-release"] };

// @ts-expect-error Internal gate records are not public link targets.
export const internalGateAsPublicLink: PublicLinkSourceId = "portfolio.blueprint.008";
