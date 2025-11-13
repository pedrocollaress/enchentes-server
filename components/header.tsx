"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Header() {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    console.log("pathname", pathname);
    if (pathname === "/") {
      return [{ label: "Dashboard", href: "/" }];
    }
    if (pathname === "/reports") {
      return [
        { label: "Dashboard", href: "/" },
        { label: "Relatórios", href: "/reports" },
      ];
    }
    return [{ label: "Dashboard", href: "/" }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white px-6 py-4">
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-muted-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}
