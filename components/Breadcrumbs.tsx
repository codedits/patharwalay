"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function titleCase(segment: string) {
  const cleaned = decodeURIComponent(segment.replace(/[-_]+/g, " "));
  return cleaned.replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = (pathname || "/").split("/").filter(Boolean);

  // Show nothing on the homepage (optional). If you'd rather show just "Home", remove this.
  if (parts.length === 0) {
    return null;
  }

  const items = [
    { href: "/", label: "Home" },
    ...parts.map((seg, idx) => ({
      href: "/" + parts.slice(0, idx + 1).join("/"),
      label: titleCase(seg),
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
      <ol className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-white/90">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:opacity-80 transition-opacity">{item.label}</Link>
              )}
              {!isLast && <span className="text-white/60">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
