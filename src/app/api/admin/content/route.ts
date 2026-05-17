import { timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

import type { SiteSettings } from "@/lib/site";
import type { Language, Translations } from "@/lib/translations";

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
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;
const authAttemptStore = new Map<string, { count: number; resetAt: number }>();

type ContentBundle = {
  translations: Translations;
  site: SiteSettings;
};

type SavePayload = {
  password?: string;
  content?: unknown;
  translations?: unknown;
  site?: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = authAttemptStore.get(key);

  if (!current || current.resetAt <= now) {
    authAttemptStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  authAttemptStore.set(key, current);
  return current.count > RATE_LIMIT_MAX_ATTEMPTS;
}

function clearRateLimit(key: string) {
  authAttemptStore.delete(key);
}

function verifyPassword(password?: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }

  if (!password) return false;

  const expectedBuffer = Buffer.from(expected);
  const passwordBuffer = Buffer.from(password);

  return (
    expectedBuffer.length === passwordBuffer.length &&
    timingSafeEqual(expectedBuffer, passwordBuffer)
  );
}

function validateTranslations(content: unknown): content is Translations {
  if (!content || typeof content !== "object") return false;

  const value = content as Record<string, unknown>;
  const languages: Language[] = ["sk", "en", "de"];

  return languages.every((language) => {
    const entries = value[language];
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
      return false;
    }

    return Object.entries(entries).every(
      ([key, translation]) =>
        typeof key === "string" && typeof translation === "string"
    );
  });
}

function validateSiteSettings(content: unknown): content is SiteSettings {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return false;
  }

  const value = content as Record<string, unknown>;
  const requiredStrings = [
    "siteUrl",
    "brandName",
    "title",
    "description",
    "ogTitle",
    "ogDescription",
    "twitterTitle",
    "twitterDescription",
    "ogImage",
  ];

  return (
    requiredStrings.every((key) => typeof value[key] === "string") &&
    Array.isArray(value.keywords) &&
    value.keywords.every((keyword) => typeof keyword === "string")
  );
}

async function readLocalBundle(): Promise<ContentBundle> {
  const [translationsFile, siteFile] = await Promise.all([
    fs.readFile(TRANSLATIONS_FILE, "utf8"),
    fs.readFile(SITE_FILE, "utf8"),
  ]);

  return {
    translations: JSON.parse(translationsFile) as Translations,
    site: JSON.parse(siteFile) as SiteSettings,
  };
}

async function writeLocalBundle(bundle: ContentBundle) {
  await Promise.all([
    fs.writeFile(
      TRANSLATIONS_FILE,
      `${JSON.stringify(bundle.translations, null, 2)}\n`
    ),
    fs.writeFile(SITE_FILE, `${JSON.stringify(bundle.site, null, 2)}\n`),
  ]);
}

async function saveFileToGitHub(
  repoPath: string,
  content: unknown,
  message: string
) {
  const token = process.env.GITHUB_CONTENT_TOKEN;

  if (!token) {
    throw new Error("missing_github_content_token");
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const encodedPath = repoPath.split("/").map(encodeURIComponent).join("/");
  const currentFileResponse = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodedPath}?ref=${encodeURIComponent(BRANCH)}`,
    { headers }
  );

  if (!currentFileResponse.ok) {
    throw new Error(`github_read_failed_${repoPath}_${currentFileResponse.status}`);
  }

  const currentFile = (await currentFileResponse.json()) as { sha?: string };
  const saveResponse = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodedPath}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        branch: BRANCH,
        sha: currentFile.sha,
        message,
        content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString(
          "base64"
        ),
      }),
    }
  );

  if (!saveResponse.ok) {
    throw new Error(`github_write_failed_${repoPath}_${saveResponse.status}`);
  }
}

async function saveBundleToGitHub(bundle: ContentBundle) {
  await saveFileToGitHub(
    TRANSLATIONS_PATH,
    bundle.translations,
    "Update ALUPLEXamp CMS text content"
  );
  await saveFileToGitHub(
    SITE_PATH,
    bundle.site,
    "Update ALUPLEXamp CMS SEO settings"
  );
}

function normalizePayload(body: SavePayload): ContentBundle | null {
  const translations = body.translations ?? body.content;
  const site = body.site;

  if (!validateTranslations(translations) || !validateSiteSettings(site)) {
    return null;
  }

  return { translations, site };
}

export async function GET() {
  try {
    const bundle = await readLocalBundle();

    return jsonResponse({
      content: bundle.translations,
      translations: bundle.translations,
      site: bundle.site,
    });
  } catch {
    return jsonResponse({ error: "content_read_failed" }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SavePayload;
    const authKey = getClientIp(request);

    if (isRateLimited(authKey)) {
      return jsonResponse({ error: "rate_limited" }, 429);
    }

    if (!verifyPassword(body.password)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    clearRateLimit(authKey);

    const bundle = normalizePayload(body);

    if (!bundle) {
      return jsonResponse({ error: "invalid_content" }, 400);
    }

    if (process.env.NODE_ENV === "production") {
      await saveBundleToGitHub(bundle);
    } else {
      await writeLocalBundle(bundle);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "save_failed";
    return jsonResponse({ error: message }, 500);
  }
}
