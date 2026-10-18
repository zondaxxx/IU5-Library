import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FolderOpen, Search } from "lucide-react";
import LibraryFiles from "@/components/LibraryFiles";
import { folderUrl, LibraryFile, useCatalog } from "@/lib/catalog";
import { Input } from "@/components/ui/input";

export default function LibraryFolder() {
  const [params] = useSearchParams();
  const folder = params.get("path") || "";
  const [query, setQuery] = useState("");
  const { catalog, error, loading } = useCatalog();
  const { folders, directFiles, matchingFiles } = useMemo(() => {
    const prefix = folder ? `${folder}/` : "";
    const children = new Map<string, number>();
    const direct: LibraryFile[] = [];
    const matching: LibraryFile[] = [];
    const needle = query.trim().toLocaleLowerCase("ru");
    for (const file of catalog?.files ?? []) {
      if (!file.path.startsWith(prefix)) continue;
      const rest = file.path.slice(prefix.length);
      const slash = rest.indexOf("/");
      if (slash !== -1) {
        const name = rest.slice(0, slash);
        children.set(name, (children.get(name) ?? 0) + 1);
      } else direct.push(file);
      if (needle && rest.toLocaleLowerCase("ru").includes(needle))
        matching.push(file);
    }
    return {
      folders: [...children].sort(([a], [b]) => a.localeCompare(b, "ru")),
      directFiles: direct,
      matchingFiles: matching,
    };
  }, [catalog, folder, query]);
  const parts = folder.split("/").filter(Boolean);

  return (
    <div className="space-y-6">
      <nav
        aria-label="Путь к папке"
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link to="/" className="hover:text-primary">
          Библиотека
        </Link>
        {parts.map((part, index) => (
          <span key={index}>
            /{" "}
            <Link
              to={folderUrl(parts.slice(0, index + 1).join("/"))}
              className="hover:text-primary"
            >
              {part}
            </Link>
          </span>
        ))}
      </nav>
      <div>
        <h1 className="break-words text-3xl font-semibold tracking-tight">
          {parts.slice(-1)[0] || "Все материалы"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {folders.length} папок · {directFiles.length} файлов в этой папке
        </p>
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Искать в этой папке и вложенных папках"
          aria-label="Поиск в папке"
          className="rounded-full pl-10"
        />
      </div>
      {loading && <p className="text-muted-foreground">Загружаем каталог…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          Не удалось загрузить каталог: {error}
        </p>
      )}
      {catalog &&
        (query.trim() ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">
              Найдено {matchingFiles.length}
            </h2>
            <LibraryFiles files={matchingFiles.slice(0, 100)} />
            {matchingFiles.length > 100 && (
              <p className="text-sm text-muted-foreground">
                Показаны первые 100 результатов. Уточните запрос.
              </p>
            )}
          </section>
        ) : (
          <>
            {folders.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Папки</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {folders.map(([name, count]) => (
                    <Link
                      key={name}
                      to={folderUrl(folder ? `${folder}/${name}` : name)}
                      className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/50 hover:text-primary"
                    >
                      <FolderOpen className="size-5 shrink-0" />
                      <span className="min-w-0 flex-1 break-words font-medium">
                        {name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {count}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {directFiles.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Файлы</h2>
                <LibraryFiles files={directFiles} />
              </section>
            )}
            {folders.length === 0 && directFiles.length === 0 && (
              <p className="rounded-2xl border p-8 text-center text-muted-foreground">
                В этой папке пока нет файлов.
              </p>
            )}
          </>
        ))}
    </div>
  );
}
