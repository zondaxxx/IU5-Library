import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Header() {
  const location = useLocation();
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
            <nav className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs sm:gap-2 sm:text-sm">
              <Link
                to="/"
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  location.pathname === "/"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Библиотека
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
          </div>
        </div>
      </div>
    </header>
  );
}
