import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Placeholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          {description}
        </p>
      ) : null}
      <div className="mt-6">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/">Вернуться на главную</Link>
        </Button>
      </div>
    </div>
  );
}
