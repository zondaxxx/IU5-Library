import { useEffect, useState } from "react";

export interface LibraryFile {
  path: string;
  size: number;
  mime: string;
  source: string;
  local: boolean;
}

interface Catalog {
  source: string;
  files: LibraryFile[];
}

let catalogPromise: Promise<Catalog> | undefined;

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    catalogPromise ??= fetch(
      `${import.meta.env.BASE_URL}documents/index.json`,
    ).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as Catalog;
    });
    catalogPromise.then(setCatalog).catch((reason) => setError(String(reason)));
  }, []);

  return { catalog, error, loading: !catalog && !error };
}

export function fileUrl(file: LibraryFile) {
  if (!file.local) return `/open?path=${encodeURIComponent(file.path)}`;
  const encoded = file.path.split("/").map(encodeURIComponent).join("/");
  return `${import.meta.env.BASE_URL}documents/files/${encoded}`;
}

export function folderUrl(path: string) {
  return `/collection?path=${encodeURIComponent(path)}`;
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} КБ`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} МБ`;
  return `${(bytes / 1024 ** 3).toFixed(1)} ГБ`;
}

const FAVORITES_KEY = "iu5-library-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(FAVORITES_KEY) || "[]",
      ) as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onChange = () => {
      try {
        setFavorites(
          JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]") as string[],
        );
      } catch {
        setFavorites([]);
      }
    };
    window.addEventListener("storage", onChange);
    window.addEventListener("iu5-favorites-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("iu5-favorites-change", onChange);
    };
  }, []);

  function toggle(path: string) {
    const next = favorites.includes(path)
      ? favorites.filter((item) => item !== path)
      : [...favorites, path];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("iu5-favorites-change"));
  }

  return { favorites, toggle };
}
