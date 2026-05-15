import { promises as fs } from "node:fs";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import type { Language, Translations } from "@/lib/translations";

export const runtime = "nodejs";

const CONTENT_PATH = "src/content/translations.json";
const CONTENT_FILE = path.join(
  process.cwd(),
  "src",
  "content",
  "translations.json"
);
const REPO = process.env.GITHUB_REPO || "brunovoxmusic/aluplexamp";
const BRANCH = process.env.GITHUB_BRANCH || "main";

type SavePayload = {
  password?: string;
  content?: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
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

async function readLocalContent() {
  const file = await fs.readFile(CONTENT_FILE, "utf8");
  return JSON.parse(file) as Translations;
}

async function writeLocalContent(content: Translations) {
  await fs.writeFile(CONTENT_FILE, `${JSON.stringify(content, null, 2)}\n`);
}

async function saveToGitHub(content: Translations) {
  const token = process.env.GITHUB_CONTENT_TOKEN;

  if (!token) {
    throw new Error("missing_github_content_token");
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const encodedPath = CONTENT_PATH.split("/").map(encodeURIComponent).join("/");
  const currentFileResponse = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodedPath}?ref=${encodeURIComponent(BRANCH)}`,
    { headers }
  );

  if (!currentFileResponse.ok) {
    throw new Error(`github_read_failed_${currentFileResponse.status}`);
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
        message: "Update ALUPLEXamp CMS content",
        content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString(
          "base64"
        ),
      }),
    }
  );

  if (!saveResponse.ok) {
    throw new Error(`github_write_failed_${saveResponse.status}`);
  }

  return saveResponse.json();
}

export async function GET() {
  try {
    return jsonResponse({ content: await readLocalContent() });
  } catch {
    return jsonResponse({ error: "content_read_failed" }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SavePayload;

    if (!verifyPassword(body.password)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    if (!validateTranslations(body.content)) {
      return jsonResponse({ error: "invalid_content" }, 400);
    }

    if (process.env.NODE_ENV === "production") {
      await saveToGitHub(body.content);
    } else {
      await writeLocalContent(body.content);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "save_failed";
    return jsonResponse({ error: message }, 500);
  }
}
