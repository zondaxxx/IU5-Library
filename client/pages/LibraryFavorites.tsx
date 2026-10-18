import LibraryFiles from "@/components/LibraryFiles";
import { useCatalog, useFavorites } from "@/lib/catalog";

export default function LibraryFavorites() {
  const { catalog, error, loading } = useCatalog();
  const { favorites } = useFavorites();
  const files = (catalog?.files ?? []).filter((file) =>
    favorites.includes(file.path),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Избранное</h1>
        <p className="mt-2 text-muted-foreground">
          Файлы сохраняются в этом браузере.
        </p>
      </div>
      {loading && <p className="text-muted-foreground">Загружаем каталог…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          Не удалось загрузить каталог: {error}
        </p>
      )}
      {catalog && <LibraryFiles files={files} />}
    </div>
  );
}
