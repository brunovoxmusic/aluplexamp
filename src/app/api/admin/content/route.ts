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

type GitHubContentFile = {
  content?: string;
  encoding?: string;
  sha?: string;
};

type SaveResult = {
  path: string;
  commitSha?: string;
  commitUrl?: string;
};

type SavePayload = {
  password?: string;
  content?: unknown;
  translations?: unknown;
  site?: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
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

  const isValidMaintenanceCopy = (copy: unknown) =>
    typeof copy === "object" &&
    copy !== null &&
    !Array.isArray(copy) &&
    typeof (copy as Record<string, unknown>).eyebrow === "string" &&
    typeof (copy as Record<string, unknown>).title === "string" &&
    typeof (copy as Record<string, unknown>).message === "string" &&
    typeof (copy as Record<string, unknown>).secondaryMessage === "string" &&
    typeof (copy as Record<string, unknown>).imageAlt === "string";

  const localizedMaintenance =
    value.maintenance &&
    typeof value.maintenance === "object" &&
    !Array.isArray(value.maintenance)
      ? (value.maintenance as Record<string, unknown>).localized
      : undefined;

  const validLocalizedMaintenance =
    localizedMaintenance === undefined ||
    (typeof localizedMaintenance === "object" &&
      localizedMaintenance !== null &&
      !Array.isArray(localizedMaintenance) &&
      ["sk", "en", "de"].every((language) => {
        const copy = (localizedMaintenance as Record<string, unknown>)[language];
        return copy === undefined || isValidMaintenanceCopy(copy);
      }));

  const heroBackground = value.heroBackground;
  const validHeroBackground =
    heroBackground === undefined ||
    (typeof heroBackground === "object" &&
      heroBackground !== null &&
      !Array.isArray(heroBackground) &&
      ((heroBackground as Record<string, unknown>).mode === "static" ||
        (heroBackground as Record<string, unknown>).mode === "slideshow") &&
      typeof (heroBackground as Record<string, unknown>).staticImage === "string" &&
      Array.isArray((heroBackground as Record<string, unknown>).slides) &&
      ((heroBackground as Record<string, unknown>).slides as unknown[]).every(
        (src) => typeof src === "string"
      ));

  const contactSettings = value.contactSettings;
  const validContactSettings =
    contactSettings === undefined ||
    (typeof contactSettings === "object" &&
      contactSettings !== null &&
      !Array.isArray(contactSettings) &&
      typeof (contactSettings as Record<string, unknown>).publicEmail === "string" &&
      typeof (contactSettings as Record<string, unknown>).formEmail === "string" &&
      typeof (contactSettings as Record<string, unknown>).phone === "string" &&
      typeof (contactSettings as Record<string, unknown>).instagram === "string" &&
      typeof (contactSettings as Record<string, unknown>).youtube === "string" &&
      typeof (contactSettings as Record<string, unknown>).facebook === "string");

  const isValidAudioTrack = (track: unknown) =>
    typeof track === "object" &&
    track !== null &&
    !Array.isArray(track) &&
    typeof (track as Record<string, unknown>).id === "string" &&
    typeof (track as Record<string, unknown>).enabled === "boolean" &&
    typeof (track as Record<string, unknown>).src === "string" &&
    typeof (track as Record<string, unknown>).tagKey === "string" &&
    typeof (track as Record<string, unknown>).nameKey === "string" &&
    typeof (track as Record<string, unknown>).gearKey === "string" &&
    typeof (track as Record<string, unknown>).settingsKey === "string" &&
    typeof (track as Record<string, unknown>).descKey === "string";

  const audioLibrary = value.audioLibrary;
  const validAudioLibrary =
    audioLibrary === undefined ||
    (typeof audioLibrary === "object" &&
      audioLibrary !== null &&
      !Array.isArray(audioLibrary) &&
      Array.isArray((audioLibrary as Record<string, unknown>).tracks) &&
      ((audioLibrary as Record<string, unknown>).tracks as unknown[]).every(
        isValidAudioTrack
      ));

  const validMaintenance =
    value.maintenance === undefined ||
    (typeof value.maintenance === "object" &&
      value.maintenance !== null &&
      !Array.isArray(value.maintenance) &&
      typeof (value.maintenance as Record<string, unknown>).enabled === "boolean" &&
      typeof (value.maintenance as Record<string, unknown>).eyebrow === "string" &&
      typeof (value.maintenance as Record<string, unknown>).title === "string" &&
      typeof (value.maintenance as Record<string, unknown>).message === "string" &&
      typeof (value.maintenance as Record<string, unknown>).secondaryMessage ===
        "string" &&
      typeof (value.maintenance as Record<string, unknown>).imageUrl === "string" &&
      typeof (value.maintenance as Record<string, unknown>).imageAlt === "string" &&
      validLocalizedMaintenance);

  return (
    requiredStrings.every((key) => typeof value[key] === "string") &&
    Array.isArray(value.keywords) &&
    value.keywords.every((keyword) => typeof keyword === "string") &&
    validHeroBackground &&
    validContactSettings &&
    validAudioLibrary &&
    validMaintenance
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

function getGitHubHeaders() {
  const token = process.env.GITHUB_CONTENT_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
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

async function readGitHubBundle(): Promise<ContentBundle> {
  const [translations, site] = await Promise.all([
    readGitHubFile<Translations>(TRANSLATIONS_PATH),
    readGitHubFile<SiteSettings>(SITE_PATH),
  ]);

  return { translations, site };
}

async function readContentBundle(): Promise<{ bundle: ContentBundle; source: string }> {
  if (process.env.NODE_ENV === "production") {
    try {
      return { bundle: await readGitHubBundle(), source: "github" };
    } catch {
      return { bundle: await readLocalBundle(), source: "deployment" };
    }
  }

  return { bundle: await readLocalBundle(), source: "local" };
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
): Promise<SaveResult> {
  const token = process.env.GITHUB_CONTENT_TOKEN;

  if (!token) {
    throw new Error("missing_github_content_token");
  }

  const headers = getGitHubHeaders();
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

  const savedFile = (await saveResponse.json()) as {
    commit?: { sha?: string; html_url?: string };
  };

  return {
    path: repoPath,
    commitSha: savedFile.commit?.sha,
    commitUrl: savedFile.commit?.html_url,
  };
}

async function saveBundleToGitHub(bundle: ContentBundle) {
  const translationsResult = await saveFileToGitHub(
    TRANSLATIONS_PATH,
    bundle.translations,
    "Update ALUPLEXamp CMS text content"
  );
  const siteResult = await saveFileToGitHub(
    SITE_PATH,
    bundle.site,
    "Update ALUPLEXamp CMS site settings"
  );

  return [translationsResult, siteResult];
}

function normalizePayload(body: SavePayload): ContentBundle | null {
  const translations = body.translations ?? body.content;
  const site = body.site;

  if (!validateTranslations(translations) || !validateSiteSettings(site)) {
    return null;
  }

  return { translations, site };
}

export async function GET(request: NextRequest) {
  try {
    const authKey = getClientIp(request);
    const password = request.headers.get("x-admin-password") ?? undefined;

    if (isRateLimited(authKey)) {
      return jsonResponse({ error: "rate_limited" }, 429);
    }

    if (!verifyPassword(password)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    clearRateLimit(authKey);

    const { bundle, source } = await readContentBundle();

    return jsonResponse({
      content: bundle.translations,
      translations: bundle.translations,
      site: bundle.site,
      source,
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

    let saveResults: SaveResult[] = [];
    let savedTo = "local";

    if (process.env.NODE_ENV === "production") {
      saveResults = await saveBundleToGitHub(bundle);
      savedTo = "github";
    } else {
      await writeLocalBundle(bundle);
    }

    return jsonResponse({
      success: true,
      savedTo,
      branch: BRANCH,
      results: saveResults,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "save_failed";
    return jsonResponse({ error: message }, 500);
  }
}
