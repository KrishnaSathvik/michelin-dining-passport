import { PassportClientShell } from "@/components/passport/PassportClientShell";
import { getRestaurants } from "@/lib/data/restaurants";

export default function PassportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const restaurants = getRestaurants();
  return (
    <PassportClientShell restaurants={restaurants}>
      {children}
    </PassportClientShell>
  );
}
