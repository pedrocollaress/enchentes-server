import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white px-6 py-3">
      <div className="flex items-center justify-start">
        <Badge variant="secondary" className="text-xs font-normal">
          v0.0.1
        </Badge>
      </div>
    </footer>
  );
}
