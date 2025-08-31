export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Методичка ИУ-5 · Бауманка</p>
        <p className="opacity-90">Минималистичный дизайн в стиле iOS</p>
      </div>
    </footer>
  );
}
