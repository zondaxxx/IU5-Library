import type { RequestHandler } from "express";

const API_BASE = "https://cloud-api.yandex.net/v1/disk";

export const rawYandex: RequestHandler = async (req, res) => {
  const publicKey = String(req.query.key || "");
  const path = (req.query.path as string) || undefined;
  const url = new URL(`${API_BASE}/public/resources`);
  if (publicKey) url.searchParams.set("public_key", publicKey);
  if (path) url.searchParams.set("path", path);
  try {
    const r = await fetch(url.toString());
    const text = await r.text();
    res
      .status(r.status)
      .setHeader("content-type", "application/json; charset=utf-8")
      .send(text);
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
};
