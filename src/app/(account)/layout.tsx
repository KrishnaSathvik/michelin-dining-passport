import { Container } from "@/components/layout/Container";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-bg py-10 sm:py-14">
      <Container>{children}</Container>
    </div>
  );
}
