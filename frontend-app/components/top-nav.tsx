"use client";

import {
  BookOpen,
  Heart,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { MenuBar } from "@/components/ui/glow-menu";

const items = [
  {
    icon: BookOpen,
    label: "Recipes",
    href: "/recipes",
    gradient:
      "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: Heart,
    label: "Favorites",
    href: "/favorites",
    gradient:
      "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
  {
    icon: ShoppingBasket,
    label: "Shopping list",
    href: "/shopping-list",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-emerald-500",
  },
  {
    icon: Sparkles,
    label: "Cook from pantry",
    href: "/cook",
    gradient:
      "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
];

function activeLabel(pathname: string): string | undefined {
  const match = items.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  return match?.label;
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = activeLabel(pathname);
  return (
    <MenuBar
      items={items}
      activeItem={active}
      onItemClick={(label) => {
        const item = items.find((i) => i.label === label);
        if (item) router.push(item.href);
      }}
    />
  );
}
