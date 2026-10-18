import { ExternalLink, FileText, Star } from "lucide-react";
import { LibraryFile, fileUrl, formatSize, useFavorites } from "@/lib/catalog";

export default function LibraryFiles({ files }: { files: LibraryFile[] }) {
  const { favorites, toggle } = useFavorites();

  if (!files.length) {
    return (
      <p className="rounded-2xl border p-8 text-center text-muted-foreground">
        Файлы не найдены.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {files.map((file) => (
        <div
          key={file.path}
          className="flex items-center gap-3 border-b p-4 last:border-b-0 hover:bg-muted/50"
        >
          <FileText
            className="size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <a
              href={fileUrl(file)}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-words font-medium hover:text-primary hover:underline"
            >
              {file.path.split("/").slice(-1)[0]}
            </a>
            <p className="mt-0.5 break-all text-xs text-muted-foreground">
              {file.path} · {formatSize(file.size)}
              {file.local ? "" : " · Яндекс Диск"}
            </p>
          </div>
          <button
            type="button"
            aria-label={
              favorites.includes(file.path)
                ? "Убрать из избранного"
                : "Добавить в избранное"
            }
            title={
              favorites.includes(file.path)
                ? "Убрать из избранного"
                : "Добавить в избранное"
            }
            onClick={() => toggle(file.path)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary"
          >
            <Star
              className="size-5"
              fill={favorites.includes(file.path) ? "currentColor" : "none"}
            />
          </button>
          <a
            href={fileUrl(file)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Открыть ${file.path.split("/").slice(-1)[0]}`}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary"
          >
            <ExternalLink className="size-5" />
          </a>
        </div>
      ))}
    </div>
  );
}
