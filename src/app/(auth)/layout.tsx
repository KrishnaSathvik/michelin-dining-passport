import { Container } from "@/components/layout/Container";

export default function AuthLayout({
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
