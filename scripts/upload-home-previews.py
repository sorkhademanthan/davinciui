#!/usr/bin/env python3
"""Upload homepage preview videos to Cloudflare R2 (optional CDN move).

The homepage defaults to serving /preview-videos/home from the app's own
static assets. To serve them from R2 instead:

  1. Fill R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY /
     R2_BUCKET_NAME in the repo-root .env (gitignored).
  2. Run:  python3 scripts/upload-home-previews.py
  3. Set NEXT_PUBLIC_HOME_PREVIEW_VIDEO_BASE in Vercel to
     https://<bucket-public-host>/preview-videos/home

Requires: pip install boto3
"""
import os
import sys
from pathlib import Path

import boto3
from botocore.config import Config

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = REPO_ROOT / "apps/web/public/preview-videos/home"
CONTENT_TYPES = {".webm": "video/webm", ".mp4": "video/mp4", ".webp": "image/webp"}


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for candidate in (REPO_ROOT / ".env", REPO_ROOT / "apps/web/.env.local"):
        if not candidate.exists():
            continue
        for line in candidate.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            env.setdefault(key.strip(), value.strip())
    return env


def require(env: dict[str, str], key: str) -> str:
    value = env.get(key) or os.environ.get(key)
    if not value or value.startswith("your_"):
        print(f"Error: {key} is missing or still a placeholder")
        sys.exit(1)
    return value


def main() -> None:
    env = load_env()
    account_id = require(env, "R2_ACCOUNT_ID")
    bucket = require(env, "R2_BUCKET_NAME")

    source = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE_DIR
    if not source.is_dir():
        print(f"Error: {source} does not exist")
        sys.exit(1)

    client = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=require(env, "R2_ACCESS_KEY_ID"),
        aws_secret_access_key=require(env, "R2_SECRET_ACCESS_KEY"),
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )

    uploaded = 0
    total = 0
    for path in sorted(source.rglob("*")):
        if not path.is_file() or path.suffix not in CONTENT_TYPES:
            continue
        key = f"preview-videos/home/{path.relative_to(source).as_posix()}"
        client.upload_file(
            str(path),
            bucket,
            key,
            ExtraArgs={
                "ContentType": CONTENT_TYPES[path.suffix],
                "CacheControl": "public, max-age=604800, stale-while-revalidate=86400",
            },
        )
        uploaded += 1
        total += path.stat().st_size
        print(f"uploaded {key}")

    print(f"\n{uploaded} objects ({total / 1024 / 1024:.1f} MB) -> {bucket}")


if __name__ == "__main__":
    main()
