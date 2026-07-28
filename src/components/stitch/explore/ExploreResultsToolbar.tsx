import { PageContainer } from "@/components/stitch/PageContainer";

type ExploreResultsToolbarProps = {
  total: number;
  page: number;
  totalPages: number;
};

export function ExploreResultsToolbar({
  total,
  page,
  totalPages,
}: ExploreResultsToolbarProps) {
  const rangeLabel =
    total === 0
      ? "0 restaurants"
      : totalPages > 1
        ? `Page ${page} of ${totalPages} · ${total} restaurant${total === 1 ? "" : "s"}`
        : `${total} restaurant${total === 1 ? "" : "s"}`;

  return (
    <PageContainer className="pb-6">
      <div
        id="explore-results"
        className="scroll-mt-[calc(var(--dp-header-height)+var(--dp-explore-sticky-height))] border-b border-dp-border pb-4"
      >
        <p
          className="dp-meta text-dp-ink-secondary"
          aria-live="polite"
          data-explore-results-meta
        >
          {rangeLabel}
        </p>
      </div>
    </PageContainer>
  );
}
