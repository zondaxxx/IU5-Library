import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const PUBLIC_KEY = "https://disk.yandex.com/d/4PO5hHMPMaeAEQ";

export default function RemoteFile() {
  const [params] = useSearchParams();
  const path = params.get("path") || "";
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const source = `${PUBLIC_KEY}/IU5/${path.split("/").map(encodeURIComponent).join("/")}`;

  useEffect(() => {
    if (!path) {
      setError("Путь к файлу не указан.");
      return;
    }
    const url = new URL(
      "https://cloud-api.yandex.net/v1/disk/public/resources/download",
    );
    url.searchParams.set("public_key", PUBLIC_KEY);
    url.searchParams.set("path", `/IU5/${path}`);
    fetch(url)
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Ошибка Яндекс Диска: ${response.status}`);
        return (await response.json()) as { href: string };
      })
      .then(({ href }) => {
        setDownloadUrl(href);
      })
      .catch((reason) => setError(String(reason)));
  }, [path]);

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border bg-card p-8 text-center">
      <h1 className="text-xl font-semibold">
        {downloadUrl
          ? "Ссылка на файл готова"
          : "Открываем файл с Яндекс Диска…"}
      </h1>
      <p className="break-words text-muted-foreground">
        {path.split("/").slice(-1)[0]}
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Скачать или открыть файл
          </a>
        )}
        <a href={source} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          Открыть на Яндекс Диске
        </a>
        <Link to="/" className="text-primary underline">
          В библиотеку
        </Link>
      </div>
    </div>
  );
}
