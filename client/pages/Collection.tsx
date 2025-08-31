import { useParams } from "react-router-dom";
import Placeholder from "@/components/common/Placeholder";

export default function CollectionPage() {
  const { slug } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Раздел: {formatSlug(slug || "")}</h1>
        <p className="mt-2 text-muted-foreground">Здесь будут структурированные материалы по выбранной теме. Пришлите ссылки/файлы — я добавлю содержимое.</p>
      </div>
      <Placeholder title="Страница в разработке" description="Эта страница будет наполнена материалами после того, как вы пришлёте файлы и ссылки." />
    </div>
  );
}

function formatSlug(s: string) {
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
