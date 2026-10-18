import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FolderOpen, Search } from "lucide-react";
import LibraryFiles from "@/components/LibraryFiles";
import { folderUrl, useCatalog } from "@/lib/catalog";
import { Input } from "@/components/ui/input";

const LABELS: Record<string, string> = {
  "0 sem": "Перед началом учёбы",
  "1 course": "1 курс",
  "2 course": "2 курс",
  "3 course": "3 курс",
};

export default function LibraryHome() {
  const { catalog, error, loading } = useCatalog();
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState("all");
  const files = catalog?.files ?? [];
  const folders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const file of files) {
      if (!file.path.includes("/")) continue;
      const folder = file.path.split("/")[0];
      counts.set(folder, (counts.get(folder) ?? 0) + 1);
    }
    return [...counts].sort(([a], [b]) => a.localeCompare(b, "ru"));
  }, [files]);
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ru");
    if (!needle) return [];
    return files.filter(
      (file) =>
        file.path.toLocaleLowerCase("ru").includes(needle) &&
        (semester === "all" || file.path.includes(`/${semester} sem/`)),
    );
  }, [files, query, semester]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-card p-6 sm:p-10">
        <div className="mb-6 flex items-center gap-3 text-primary">
          <BookOpen className="size-8" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            ИУ-5 · МГТУ им. Н. Э. Баумана
          </span>
        </div>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
          Библиотека учебных материалов
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Конспекты, методички, лабораторные и другие материалы по курсам и
          семестрам. В каталоге {files.length.toLocaleString("ru-RU")} файлов.
        </p>
        <div className="relative mt-7 max-w-3xl">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти предмет, тему или файл"
            aria-label="Поиск по библиотеке"
            className="h-12 rounded-2xl pl-12 text-base"
          />
        </div>
        {query && (
          <div
            className="mt-4 flex flex-wrap gap-2"
            aria-label="Фильтр по семестру"
          >
            {["all", "1", "2", "3", "4", "5", "6"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSemester(value)}
                className={`rounded-full px-3 py-1.5 text-sm ${semester === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {value === "all" ? "Все семестры" : `${value} семестр`}
              </button>
            ))}
          </div>
        )}
      </section>
      {loading && <p className="text-muted-foreground">Загружаем каталог…</p>}
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive p-5 text-destructive"
        >
          Не удалось загрузить каталог: {error}
        </p>
      )}
      {catalog &&
        (query.trim() ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">
              Результаты поиска · {results.length.toLocaleString("ru-RU")}
            </h2>
            <LibraryFiles files={results.slice(0, 100)} />
            {results.length > 100 && (
              <p className="text-sm text-muted-foreground">
                Показаны первые 100 результатов. Уточните запрос.
              </p>
            )}
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Разделы</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {folders.map(([name, count]) => (
                <Link
                  key={name}
                  to={folderUrl(name)}
                  className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <FolderOpen className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold group-hover:text-primary">
                      {LABELS[name] ?? name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count.toLocaleString("ru-RU")} файлов
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            {files.some((file) => !file.path.includes("/")) && (
              <div className="space-y-3 pt-4">
                <h2 className="text-xl font-semibold">Общие документы</h2>
                <LibraryFiles
                  files={files.filter((file) => !file.path.includes("/"))}
                />
              </div>
            )}
          </section>
        ))}
    </div>
  );
}
