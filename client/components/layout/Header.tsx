import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <span className="text-sm font-semibold">ИУ</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-muted-foreground">Бауманка</span>
              <span className="text-base font-semibold tracking-tight">
                Методичка ИУ-5
              </span>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <nav className="hidden sm:flex items-center gap-2 rounded-full bg-muted p-1 text-sm">
              <Link
                to="/"
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  location.pathname === "/"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Библио��ека
              </Link>
              <Link
                to="/favorites"
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  location.pathname === "/favorites"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Избранное
              </Link>
            </nav>

            {!isHome && (
              <div className="relative hidden md:block w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9 rounded-full"
                  placeholder="Поиск материалов"
                  aria-label="Поиск"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
