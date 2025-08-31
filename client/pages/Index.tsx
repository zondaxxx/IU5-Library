import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Code2, Calculator, Cpu, Layers, Network, Binary, Atom } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Category {
  title: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // tailwind bg text color pairs
  tags: string[];
  semesters: number[]; // IU-5 typical 1..8
}

const CATEGORIES: Category[] = [
  {
    title: "Высшая математика",
    slug: "visshaya-matematika",
    icon: Calculator,
    color: "bg-blue-50 text-blue-600",
    tags: ["диффуры", "линал", "матан"],
    semesters: [1, 2, 3],
  },
  {
    title: "Программирование",
    slug: "programmirovanie",
    icon: Code2,
    color: "bg-emerald-50 text-emerald-600",
    tags: ["C/C++", "Python", "алгоритмы"],
    semesters: [1, 2, 3, 4],
  },
  {
    title: "Компьютерная архитектура",
    slug: "kompyuternaya-arhitektura",
    icon: Cpu,
    color: "bg-purple-50 text-purple-600",
    tags: ["АСМ", "микропроц."],
    semesters: [3, 4],
  },
  {
    title: "Схемотехника",
    slug: "shemo-tehnika",
    icon: Layers,
    color: "bg-amber-50 text-amber-600",
    tags: ["ЦАП/АЦП", "логика"],
    semesters: [2, 3],
  },
  {
    title: "Сети и телеком",
    slug: "seti-telekom",
    icon: Network,
    color: "bg-cyan-50 text-cyan-600",
    tags: ["OSI", "TCP/IP"],
    semesters: [5, 6],
  },
  {
    title: "Теория информации",
    slug: "teoriya-informacii",
    icon: Binary,
    color: "bg-rose-50 text-rose-600",
    tags: ["Шеннон", "кодирование"],
    semesters: [5],
  },
  {
    title: "Физика",
    slug: "fizika",
    icon: Atom,
    color: "bg-indigo-50 text-indigo-600",
    tags: ["механика", "электричество"],
    semesters: [1, 2],
  },
  {
    title: "Материалы кафедры ИУ-5",
    slug: "kafedra-iu5",
    icon: BookOpen,
    color: "bg-slate-50 text-slate-700",
    tags: ["методички", "презентации"],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
  },
];

export default function Index() {
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState<string>("all");

  const results = useMemo(() => {
    return CATEGORIES.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = q
        ? c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
        : true;
      const matchesSemester = semester === "all" ? true : c.semesters.includes(Number(semester));
      return matchesQuery && matchesSemester;
    });
  }, [query, semester]);

  return (
    <div className="space-y-8">
      <Hero query={query} onQuery={setQuery} />

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Разделы</h2>
          <Tabs value={semester} onValueChange={setSemester}>
            <TabsList className="rounded-full">
              <TabsTrigger value="all" className="rounded-full">Все</TabsTrigger>
              <TabsTrigger value="1" className="rounded-full">1 семестр</TabsTrigger>
              <TabsTrigger value="2" className="rounded-full">2</TabsTrigger>
              <TabsTrigger value="3" className="rounded-full">3</TabsTrigger>
              <TabsTrigger value="4" className="rounded-full">4</TabsTrigger>
              <TabsTrigger value="5" className="rounded-full">5</TabsTrigger>
              <TabsTrigger value="6" className="rounded-full">6</TabsTrigger>
              <TabsTrigger value="7" className="rounded-full">7</TabsTrigger>
              <TabsTrigger value="8" className="rounded-full">8</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map((c) => (
            <CategoryCard key={c.slug} c={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Hero({ query, onQuery }: { query: string; onQuery: (v: string) => void }) {
  return (
    <section className="rounded-2xl border bg-card/70 p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Библиотека материалов · ИУ-5</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Структурированная методичка со ссылками и файлами: предметы, семестры, шпаргалки и полезные ресурсы. Минималистично — как в iOS.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Поиск по предметам, темам или тегам"
            className="h-12 pl-12 pr-4 rounded-2xl text-base"
            aria-label="Поиск"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "матан",
            "линал",
            "алгоритмы",
            "Python",
            "микропроцессоры",
            "сети",
            "кодирование",
          ].map((t) => (
            <Badge key={t} variant="secondary" className="rounded-full px-3 py-1">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ c }: { c: Category }) {
  const Icon = c.icon;
  return (
    <Card className="p-5 hover:shadow-md transition-shadow rounded-2xl">
      <Link to={`/c/${c.slug}`} className="block">
        <div className="flex items-start gap-4">
          <div className={`size-11 rounded-2xl grid place-items-center ${c.color}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-tight tracking-tight line-clamp-1">{c.title}</h3>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {c.tags.map((t) => (
                <span key={t} className="text-xs text-muted-foreground">#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
