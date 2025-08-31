import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { indexYandex, openYandexFile } from "./routes/yadisk";
import { rawYandex } from "./routes/yadisk-debug";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Yandex public indexing and open proxy
  app.get("/api/yadisk/index", indexYandex);
  app.get("/api/yadisk/file", openYandexFile);
  app.get("/api/yadisk/raw", rawYandex);

  return app;
}
