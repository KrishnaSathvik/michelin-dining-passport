import { Container } from "@/components/layout/Container";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="py-12 sm:py-16">
      <Container>{children}</Container>
    </div>
  );
}
