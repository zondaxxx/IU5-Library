import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Placeholder from "@/components/common/Placeholder";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Страница не найдена</h1>
      <Placeholder title="404 — нет такой страницы" description="Проверьте адрес или вернитесь на главную страницу." />
    </div>
  );
};

export default NotFound;
