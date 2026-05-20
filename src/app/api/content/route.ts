import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

import type { SiteSettings } from "@/lib/site";
import type { Translations } from "@/lib/translations";

export const runtime = "nodejs";

const TRANSLATIONS_PATH = "src/content/translations.json";
const SITE_PATH = "src/content/site.json";
const TRANSLATIONS_FILE = path.join(
  process.cwd(),
  "src",
  "content",
  "translations.json"
);
const SITE_FILE = path.join(process.cwd(), "src", "content", "site.json");
const REPO = process.env.GITHUB_REPO || "brunovoxmusic/aluplexamp";
const BRANCH = process.env.GITHUB_BRANCH || "main";

type GitHubContentFile = {
  content?: string;
  encoding?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function getGitHubHeaders() {
  const token = process.env.GITHUB_CONTENT_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readLocalBundle() {
  const [translationsFile, siteFile] = await Promise.all([
    fs.readFile(TRANSLATIONS_FILE, "utf8"),
    fs.readFile(SITE_FILE, "utf8"),
  ]);

  return {
    translations: JSON.parse(translationsFile) as Translations,
    site: JSON.parse(siteFile) as SiteSettings,
    source: "deployment",
  };
}

async function readGitHubFile<T>(repoPath: string): Promise<T> {
  const encodedPath = repoPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodedPath}?ref=${encodeURIComponent(BRANCH)}`,
    {
      headers: getGitHubHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`github_read_failed_${repoPath}_${response.status}`);
  }

  const file = (await response.json()) as GitHubContentFile;

  if (file.encoding !== "base64" || !file.content) {
    throw new Error(`github_invalid_content_${repoPath}`);
  }

  return JSON.parse(Buffer.from(file.content, "base64").toString("utf8")) as T;
}

async function readContentBundle() {
  if (process.env.NODE_ENV === "production") {
    try {
      const [translations, site] = await Promise.all([
        readGitHubFile<Translations>(TRANSLATIONS_PATH),
        readGitHubFile<SiteSettings>(SITE_PATH),
      ]);

      return { translations, site, source: "github" };
    } catch {
      return readLocalBundle();
    }
  }

  return readLocalBundle();
}

export async function GET() {
  try {
    const bundle = await readContentBundle();

    return jsonResponse({
      content: bundle.translations,
      translations: bundle.translations,
      site: bundle.site,
      source: bundle.source,
    });
  } catch {
    return jsonResponse({ error: "content_read_failed" }, 500);
  }
}
