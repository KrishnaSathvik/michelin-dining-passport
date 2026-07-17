import { Container } from "@/components/layout/Container";

export default function ExploreLoading() {
  return (
    <div className="border-b border-border" aria-busy="true" aria-live="polite">
      <Container className="py-10 sm:py-14">
        <div className="h-3 w-24 animate-pulse bg-border" />
        <div className="mt-4 h-10 w-72 max-w-full animate-pulse bg-border" />
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse bg-border/80" />

        <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="hidden h-96 animate-pulse border border-border bg-bg-elevated/40 lg:block" />
          <div className="space-y-5">
            <div className="h-16 animate-pulse border border-border bg-bg-elevated/40" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse border border-border bg-bg-elevated/40"
                />
              ))}
            </div>
          </div>
        </div>
        <p className="sr-only">Loading restaurants…</p>
      </Container>
    </div>
  );
}
