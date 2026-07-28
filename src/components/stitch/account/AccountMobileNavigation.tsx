import { Select } from "@/components/stitch/Select";
import type { AccountNavItem, AccountSectionId } from "./models";

type AccountMobileNavigationProps = {
  items: AccountNavItem[];
  activeId: AccountSectionId;
  onNavigate: (id: AccountSectionId) => void;
};

export function AccountMobileNavigation({
  items,
  activeId,
  onNavigate,
}: AccountMobileNavigationProps) {
  return (
    <div className="md:hidden" data-account-nav="mobile">
      <Select
        label="Jump to section"
        value={activeId}
        onChange={(event) => {
          const id = event.target.value as AccountSectionId;
          onNavigate(id);
          document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
