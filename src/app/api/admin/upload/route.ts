import { timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const REPO = process.env.GITHUB_REPO || "brunovoxmusic/aluplexamp";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const MAX_AUDIO_SIZE_BYTES = 24 * 1024 * 1024;
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".m4a", ".ogg"]);

type GitHubContentFile = {
  sha?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
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

function getGitHubHeaders() {
  const token = process.env.GITHUB_CONTENT_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function safeFilename(name: string) {
  const parsed = path.parse(name);
  const extension = parsed.ext.toLowerCase();
  const base = parsed.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "audio-sample"}-${Date.now()}${extension}`;
}

function isValidAudioFile(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  return (
    file.size > 0 &&
    file.size <= MAX_AUDIO_SIZE_BYTES &&
    AUDIO_EXTENSIONS.has(extension) &&
    (file.type.startsWith("audio/") || file.type === "application/octet-stream")
  );
}

async function uploadToGitHub(repoPath: string, buffer: Buffer) {
  const token = process.env.GITHUB_CONTENT_TOKEN;

  if (!token) {
    throw new Error("missing_github_content_token");
  }

  const headers = getGitHubHeaders();
  const encodedPath = repoPath.split("/").map(encodeURIComponent).join("/");
  const currentFileResponse = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodedPath}?ref=${encodeURIComponent(BRANCH)}`,
    { headers, cache: "no-store" }
  );
  const currentFile = currentFileResponse.ok
    ? ((await currentFileResponse.json()) as GitHubContentFile)
    : null;
  const saveResponse = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodedPath}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        branch: BRANCH,
        ...(currentFile?.sha ? { sha: currentFile.sha } : {}),
        message: "Upload ALUPLEXamp audio asset",
        content: buffer.toString("base64"),
      }),
    }
  );

  if (!saveResponse.ok) {
    throw new Error(`github_upload_failed_${saveResponse.status}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const password = formData.get("password");
    const kind = formData.get("kind");
    const file = formData.get("file");

    if (!verifyPassword(typeof password === "string" ? password : undefined)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    if (kind !== "audio" || !(file instanceof File)) {
      return jsonResponse({ error: "invalid_upload_payload" }, 400);
    }

    if (!isValidAudioFile(file)) {
      return jsonResponse({ error: "invalid_audio_file" }, 400);
    }

    const filename = safeFilename(file.name);
    const repoPath = `public/audio/${filename}`;
    const publicSrc = `/audio/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (process.env.NODE_ENV === "production") {
      await uploadToGitHub(repoPath, buffer);
    } else {
      const targetPath = path.join(process.cwd(), "public", "audio", filename);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, buffer);
    }

    return jsonResponse({ src: publicSrc });
  } catch (error) {
    console.error("[ADMIN UPLOAD]", error);
    return jsonResponse({ error: "upload_failed" }, 500);
  }
}
