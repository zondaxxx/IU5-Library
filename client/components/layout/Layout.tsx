import { PropsWithChildren } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh flex flex-col bg-[radial-gradient(1200px_600px_at_100%_-50%,hsl(var(--primary)/0.06),transparent),radial-gradient(900px_400px_at_-20%_-80%,hsl(var(--primary)/0.05),transparent)]">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
