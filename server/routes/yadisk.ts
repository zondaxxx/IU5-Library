import type { RequestHandler } from "express";
import { YandexIndexResponse, YandexIndexedItem } from "../../shared/api";
import { YADISK_PUBLIC_KEYS } from "../../shared/sources";

const API_BASE = "https://cloud-api.yandex.net/v1/disk";

function detectSemester(path: string): number | null {
  const decoded = decodeURIComponent(path);
  const m = decoded.match(/(^|\b|\/)\s*([1-8])\s*(?:семестр|сем|sem)\b/i);
  return m ? Number(m[2]) : null;
}

const CATEGORY_KEYWORDS: Record<string, RegExp[]> = {
  "visshaya-matematika": [/матан/i, /высшая/i, /линал/i, /дифф/i, /математ/i],
  programmirovanie: [
    /программ/i,
    /прога/i,
    /оп\b|основы программ/i,
    /алгоритм/i,
    /python/i,
    /c\+\+|\bc(?!loud)/i,
    /java\b/i,
    /js|javascript|typescript/i,
  ],
  "kompyuternaya-arhitektura": [/архитектур/i, /асм|asm/i, /микропроц/i],
  "shemo-tehnika": [/схемотех/i, /логик/i, /цап|ацп/i],
  "seti-telekom": [/сети|сетев/i, /tcp|ip|osi/i, /телеком/i],
  "teoriya-informacii": [/информац/i, /кодирован/i, /шеннон/i],
  fizika: [/физик/i, /механик/i, /электрич/i],
  "kafedra-iu5": [/кафедр/i, /методич/i, /презентац/i, /ИУ-?5/i, /шпаргал/i],
};

function detectCategorySlug(path: string): string | undefined {
  const lower = decodeURIComponent(path.toLowerCase());
  for (const [slug, regs] of Object.entries(CATEGORY_KEYWORDS)) {
    if (regs.some((r) => r.test(lower))) return slug;
  }
  return undefined;
}

function parsePublicKey(link: string): { key: string; initialPath: string } {
  try {
    const u = new URL(link);
    // Pattern: /d/<id>/optional/path
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex(
      (p) => p === "d" || p === "i" || p === "disk" || p === "public",
    );
    if (idx >= 0 && parts[idx + 1]) {
      const id = parts[idx + 1];
      const rest = parts.slice(idx + 2).join("/");
      const base = `${u.origin}/${parts[idx]}/${id}`;
      return { key: base, initialPath: rest ? decodeURIComponent(rest) : "" };
    }
    return { key: link, initialPath: "" };
  } catch {
    return { key: link, initialPath: "" };
  }
}

async function listFolder(
  publicKey: string,
  subPath = "",
): Promise<YandexIndexedItem[]> {
  const items: YandexIndexedItem[] = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    const url = new URL(`${API_BASE}/public/resources`);
    url.searchParams.set("public_key", publicKey);
    if (subPath) url.searchParams.set("path", subPath);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    const res = await fetch(url.toString());
    if (!res.ok) {
      if (res.status === 404) {
        // Path may not exist or is not accessible; stop at this branch.
        break;
      }
      throw new Error(`Yandex API error ${res.status}`);
    }
    const json = await res.json();
    const embedded = json._embedded?.items ?? [];
    for (const it of embedded) {
      const p = subPath ? `${subPath}/${it.name}` : it.name;
      const entry: YandexIndexedItem = {
        publicKey,
        path: p,
        name: it.name,
        type: it.type === "dir" ? "dir" : "file",
        size: typeof it.size === "number" ? it.size : undefined,
        mime: it.mime_type ?? null,
      };
      entry.semester = detectSemester(p) ?? detectSemester(publicKey);
      entry.categorySlug =
        detectCategorySlug(p) ||
        detectCategorySlug(json.name || "") ||
        detectCategorySlug(publicKey) ||
        "kafedra-iu5";
      items.push(entry);
      if (it.type === "dir") {
        try {
          const sub = await listFolder(publicKey, p);
          items.push(...sub);
        } catch {
          // skip problematic subfolder
        }
      }
    }
    const total = json._embedded?.total ?? embedded.length;
    offset += embedded.length;
    if (offset >= total || embedded.length === 0) break;
  }
  return items;
}

export const indexYandex: RequestHandler = async (req, res) => {
  try {
    const keysParam = (req.query.keys as string | undefined) || "";
    const keys = keysParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const sources = keys.length ? keys : YADISK_PUBLIC_KEYS;

    const all: YandexIndexedItem[] = [];
    for (const raw of sources) {
      const { key, initialPath } = parsePublicKey(raw);
      try {
        const listed = await listFolder(key, initialPath);
        all.push(...listed);
      } catch (e: any) {
        if (String(e?.message || e).includes("404")) {
          const listedRoot = await listFolder(key);
          all.push(...listedRoot);
        } else {
          throw e;
        }
      }
    }

    const response: YandexIndexResponse = { items: all };
    res.json(response);
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
};

export const openYandexFile: RequestHandler = async (req, res) => {
  const publicKey = String(req.query.key || "");
  const path = String(req.query.path || "");
  if (!publicKey || !path) return res.status(400).send("Missing key or path");
  const url = new URL(`${API_BASE}/public/resources/download`);
  url.searchParams.set("public_key", publicKey);
  url.searchParams.set("path", path);
  const r = await fetch(url.toString());
  if (!r.ok) return res.status(r.status).send("Failed to resolve file");
  const j = await r.json();
  const href = j.href as string;
  res.redirect(href);
};
