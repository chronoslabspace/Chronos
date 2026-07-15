import {
  githubReadmeCandidates,
  inferUploadType,
  isGithubRepoUrl,
} from "../../domain/workspace/knowledge";
import type { KnowledgeType } from "../../domain/workspace/types";

export type PreparedKnowledge = {
  type: KnowledgeType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
};

/**
 * Read an uploaded file into a knowledge record (RAG-lite).
 * PDF is stored as a titled reference + any extractable/pasted text.
 * MD/TXT are stored as full text content.
 */
export async function prepareUploadFile(file: File): Promise<PreparedKnowledge> {
  const type = inferUploadType(file.name);
  if (!type) {
    throw new Error("Only PDF, Markdown (.md), and TXT files are supported.");
  }

  if (type === "pdf") {
    return {
      type: "pdf",
      title: file.name,
      content: `[PDF] ${file.name}\nSize: ${file.size} bytes. Paste excerpts if you need searchable text.`,
      metadata: {
        filename: file.name,
        mime: file.type || "application/pdf",
        size: file.size,
        source: "upload",
      },
    };
  }

  const text = await file.text();
  return {
    type,
    title: file.name,
    content: text,
    metadata: {
      filename: file.name,
      mime: file.type || "text/plain",
      size: file.size,
      source: "upload",
    },
  };
}

/**
 * Import a website URL or GitHub README.
 * GitHub: tries raw README from main/master.
 * Website: stores URL; attempts fetch when CORS allows.
 */
export async function prepareImportUrl(rawUrl: string): Promise<PreparedKnowledge> {
  const url = rawUrl.trim();
  if (!url) throw new Error("URL is required.");

  if (isGithubRepoUrl(url) || /raw\.githubusercontent\.com/i.test(url)) {
    return prepareGithubReadme(url);
  }

  let content = "";
  let title = url;
  try {
    const res = await fetch(url, { method: "GET" });
    if (res.ok) {
      const text = await res.text();
      // Strip tags lightly for RAG-lite keyword search
      content = text
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 50_000);
      const titleMatch = text.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch?.[1]) title = titleMatch[1].trim().slice(0, 200);
    } else {
      content = `Imported URL (fetch ${res.status}). Content will be available when the source allows access.`;
    }
  } catch {
    content =
      "Imported URL. Browser could not fetch body (CORS). Title is searchable; paste content if needed.";
  }

  return {
    type: "url",
    title,
    content,
    metadata: { url, source: "website" },
  };
}

async function prepareGithubReadme(input: string): Promise<PreparedKnowledge> {
  const candidates = /raw\.githubusercontent\.com/i.test(input)
    ? [input]
    : githubReadmeCandidates(input);

  if (candidates.length === 0) {
    throw new Error("Could not parse GitHub repository URL.");
  }

  let lastError = "README not found";
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate);
      if (!res.ok) {
        lastError = `README fetch ${res.status}`;
        continue;
      }
      const content = (await res.text()).slice(0, 100_000);
      const parts = candidate.split("/");
      const repo = parts[4] ?? "repo";
      return {
        type: "github",
        title: `${repo} README`,
        content,
        metadata: {
          url: input,
          raw_url: candidate,
          source: "github_readme",
        },
      };
    } catch (err) {
      lastError = (err as Error).message;
    }
  }

  throw new Error(`Could not import GitHub README: ${lastError}`);
}
