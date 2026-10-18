#!/usr/bin/env python3
"""Mirror the public IU5 folder and write a static catalog for the site."""

from __future__ import annotations

import argparse
import json
import os
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

PUBLIC_KEY = "https://disk.yandex.com/d/4PO5hHMPMaeAEQ"
ROOT = "/IU5"
API = "https://cloud-api.yandex.net/v1/disk/public/resources"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "documents"
MIRROR_EXTENSIONS = {
    ".pdf", ".djvu", ".doc", ".docx", ".odt", ".rtf",
    ".xls", ".xlsx", ".ods", ".ppt", ".pptx", ".pps", ".ppsx", ".odp",
    ".txt", ".md", ".png", ".jpg", ".jpeg",
}


def should_mirror(path: str) -> bool:
    return Path(path).suffix.lower() in MIRROR_EXTENSIONS


def api(endpoint: str, **params: object) -> dict:
    query = urllib.parse.urlencode({"public_key": PUBLIC_KEY, **params})
    url = f"{API}{endpoint}?{query}"
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=45) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError) as error:
            if attempt == 4:
                raise RuntimeError(f"Yandex API failed for {params.get('path')}: {error}") from error
            time.sleep(2**attempt)
    raise AssertionError("unreachable")


def list_folder(path: str) -> tuple[list[str], list[dict]]:
    folders: list[str] = []
    files: list[dict] = []
    offset = 0
    while True:
        data = api("", path=path, limit=200, offset=offset)
        embedded = data.get("_embedded", {})
        items = embedded.get("items", [])
        for item in items:
            item_path = f"{path}/{item['name']}"
            if item["type"] == "dir":
                folders.append(item_path)
            elif item["type"] == "file":
                files.append({
                    "path": item_path.removeprefix(ROOT + "/"),
                    "size": item.get("size", 0),
                    "mime": item.get("mime_type") or "application/octet-stream",
                    "source": f"{PUBLIC_KEY}/IU5/" + urllib.parse.quote(item_path.removeprefix(ROOT + "/"), safe="/"),
                    "local": should_mirror(item_path),
                })
        offset += len(items)
        if not items or offset >= embedded.get("total", offset):
            break
    return folders, files


def crawl() -> list[dict]:
    pending = [ROOT]
    files: list[dict] = []
    folder_count = 0
    with ThreadPoolExecutor(max_workers=10) as pool:
        while pending:
            futures = {pool.submit(list_folder, folder): folder for folder in pending}
            pending = []
            for future in as_completed(futures):
                folders, found = future.result()
                pending.extend(folders)
                files.extend(found)
                folder_count += 1
            print(f"Indexed {folder_count} folders, {len(files)} files", flush=True)
    files.sort(key=lambda item: item["path"].casefold())
    return files


def safe_target(relative: str) -> Path:
    parts = Path(relative).parts
    if not parts or any(part in (".", "..") for part in parts) or os.path.isabs(relative):
        raise ValueError(f"Unsafe path: {relative}")
    return OUTPUT / "files" / relative


def download(item: dict) -> tuple[str, str]:
    relative = item["path"]
    target = safe_target(relative)
    if target.is_file() and target.stat().st_size == item["size"]:
        return "skipped", relative
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_name(target.name + ".part")
    source_path = ROOT + "/" + relative
    for attempt in range(2):
        try:
            href = api("/download", path=source_path)["href"]
            with urllib.request.urlopen(href, timeout=5) as response, tmp.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
            if tmp.stat().st_size != item["size"]:
                raise IOError(f"Size mismatch for {relative}")
            tmp.replace(target)
            return "downloaded", relative
        except (urllib.error.URLError, TimeoutError, OSError, KeyError):
            tmp.unlink(missing_ok=True)
            if attempt == 1:
                raise
            time.sleep(2**attempt)
    raise AssertionError("unreachable")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--index-only", action="store_true")
    parser.add_argument("--use-index", action="store_true", help="Resume using the saved catalog")
    parser.add_argument("--ipv4", action="store_true", help="Use IPv4 when IPv6 is unavailable")
    args = parser.parse_args()
    if args.ipv4:
        original_getaddrinfo = socket.getaddrinfo

        def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
            return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

        socket.getaddrinfo = ipv4_getaddrinfo
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if args.use_index:
        files = json.loads((OUTPUT / "index.json").read_text(encoding="utf-8"))["files"]
        for item in files:
            item["local"] = should_mirror(item["path"])
            item["source"] = f"{PUBLIC_KEY}/IU5/" + urllib.parse.quote(item["path"], safe="/")
    else:
        files = crawl()
    total_bytes = sum(item["size"] for item in files)
    print(f"Total: {len(files)} files, {total_bytes:,} bytes", flush=True)
    (OUTPUT / "index.json").write_text(
        json.dumps({"source": f"{PUBLIC_KEY}/IU5", "files": files}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if args.index_only:
        return
    errors: list[str] = []
    done = 0
    mirrored = [item for item in files if item["local"]]
    with ThreadPoolExecutor(max_workers=32) as pool:
        futures = {pool.submit(download, item): item for item in mirrored}
        for future in as_completed(futures):
            done += 1
            try:
                future.result()
            except Exception as error:
                errors.append(f"{futures[future]['path']}: {error}")
                futures[future]["local"] = False
            if done % 100 == 0 or done == len(mirrored):
                print(f"Downloaded/checked {done}/{len(mirrored)}; errors: {len(errors)}", flush=True)
    if errors:
        (OUTPUT / "download-errors.txt").write_text("\n".join(errors) + "\n", encoding="utf-8")
        (OUTPUT / "index.json").write_text(
            json.dumps({"source": f"{PUBLIC_KEY}/IU5", "files": files}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Could not mirror {len(errors)} files; catalog links to their Yandex originals", flush=True)
    else:
        (OUTPUT / "download-errors.txt").unlink(missing_ok=True)


if __name__ == "__main__":
    main()
