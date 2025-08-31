import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { YandexIndexResponse, YandexIndexedItem } from "@shared/api";
import { YADISK_PUBLIC_KEYS } from "@shared/sources";

export default function CollectionPage() {
  const { slug } = useParams();
  const [items, setItems] = useState<YandexIndexedItem[]>([]);
  const [q, setQ] = useState("");
  const [sem, setSem] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      const url = `/api/yadisk/index?keys=${encodeURIComponent(YADISK_PUBLIC_KEYS.join(","))}`;
      const r = await fetch(url);
      const data = (await r.json()) as YandexIndexResponse;
      setItems(data.items);
    };
    load();
  }, []);

  const list = useMemo(() => {
    return items
      .filter((i) => i.categorySlug === slug)
      .filter((i) => (sem === "all" ? true : i.semester === Number(sem)))
      .filter((i) => (q ? (i.name + " " + i.path).toLowerCase().includes(q.toLowerCase()) : true))
      .slice(0, 2000);
  }, [items, slug, q, sem]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{formatSlug(slug || "")}</h1>
        <p className="mt-2 text-muted-foreground">Автоматически индексированные материалы с Яндекс.Диска (просмотр без скачивания). Фильтры по семестрам и поиску.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск в разделе" className="rounded-full" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", 1, 2, 3, 4, 5, 6, 7, 8] as const).map((s) => (
            <button
              key={String(s)}
              onClick={() => setSem(String(s))}
              className={`rounded-full px-3 py-1 text-sm ${String(s) === sem ? "bg-background shadow-sm" : "bg-muted text-muted-foreground"}`}
            >
              {s === "all" ? "Все" : `${s} сем`}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center text-muted-foreground">Нет материалов — возможно, меняем фильтры или пришлите ещё ссылки.</div>
      ) : (
        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead className="hidden sm:table-cell">Тип</TableHead>
                <TableHead className="hidden sm:table-cell">Семестр</TableHead>
                <TableHead className="hidden md:table-cell">Путь</TableHead>
                <TableHead className="w-28">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((f) => (
                <TableRow key={`${f.publicKey}:${f.path}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[52vw] sm:max-w-[40vw] md:max-w-[28vw]">{f.name}</span>
                      {f.mime ? <Badge variant="secondary" className="hidden md:inline-flex rounded-full">{f.mime.split("/")[1] || f.mime}</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{f.semester ?? "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{f.path.replace(/\/[^/]+$/, "") || "/"}</TableCell>
                  <TableCell>
                    <a
                      className="text-primary hover:underline"
                      href={`/api/yadisk/file?key=${encodeURIComponent(f.publicKey)}&path=${encodeURIComponent(f.path)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function formatSlug(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
