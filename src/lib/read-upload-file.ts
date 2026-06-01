import { strFromU8, unzipSync } from "fflate";
import { ParseError } from "@/lib/parser";

const CHAT_EXT = /\.(txt|json)$/i;
const ZIP_EXT = /\.zip$/i;

export function isZipFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ZIP_EXT.test(name) || file.type === "application/zip" || file.type === "application/x-zip-compressed";
}

export function isAcceptedUploadFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".txt") || name.endsWith(".json") || name.endsWith(".zip");
}

function basename(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] ?? path;
}

/** Prefer WhatsApp `_chat.txt`, then other chat-like names, then largest text export. */
function rankChatPath(path: string, byteLength: number): number {
  const base = basename(path).toLowerCase();
  let score = 0;
  if (base === "_chat.txt") score += 10_000;
  else if (base.includes("chat") && base.endsWith(".txt")) score += 5_000;
  else if (base.endsWith(".txt")) score += 1_000;
  else if (base.endsWith(".json")) score += 800;
  score += Math.min(byteLength, 50_000_000) / 1000;
  return score;
}

function listChatEntries(unzipped: Record<string, Uint8Array>): { path: string; data: Uint8Array }[] {
  return Object.entries(unzipped)
    .filter(([path, data]) => {
      if (!data?.byteLength) return false;
      if (path.endsWith("/")) return false;
      if (path.includes("__MACOSX")) return false;
      if (path.startsWith(".")) return false;
      return CHAT_EXT.test(path);
    })
    .map(([path, data]) => ({ path, data }));
}

export function extractChatFromZipBytes(
  zipBytes: Uint8Array,
  maxExtractedBytes: number
): { text: string; sourcePath: string } {
  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(zipBytes);
  } catch {
    throw new ParseError("Could not open that ZIP. Try exporting again or upload the .txt file inside.");
  }

  const entries = listChatEntries(unzipped);
  if (entries.length === 0) {
    throw new ParseError(
      'No .txt or .json chat file found in that ZIP. Export with "Without media", then upload the ZIP or the chat file inside.'
    );
  }

  const totalBytes = entries.reduce((sum, e) => sum + e.data.byteLength, 0);
  if (totalBytes > maxExtractedBytes) {
    throw new ParseError(
      `Extracted chat is too large (over ${Math.round(maxExtractedBytes / (1024 * 1024))} MB). Try a smaller export or upgrade tier limits.`
    );
  }

  const chosen = entries.sort((a, b) => rankChatPath(b.path, b.data.byteLength) - rankChatPath(a.path, a.data.byteLength))[0]!;

  try {
    const text = strFromU8(chosen.data);
    if (!text.trim()) {
      throw new ParseError("The chat file inside the ZIP is empty. Export the chat again without media.");
    }
    return { text, sourcePath: chosen.path };
  } catch (err) {
    if (err instanceof ParseError) throw err;
    throw new ParseError("Could not read the chat file inside that ZIP. Try uploading the .txt directly.");
  }
}

export async function readChatExportFile(
  file: File,
  maxExtractedBytes: number
): Promise<{ text: string; displayName: string }> {
  if (isZipFile(file)) {
    const zipBytes = new Uint8Array(await file.arrayBuffer());
    const { text, sourcePath } = extractChatFromZipBytes(zipBytes, maxExtractedBytes);
    const base = basename(sourcePath).replace(/\.[^.]+$/, "") || file.name.replace(/\.zip$/i, "");
    return { text, displayName: base };
  }

  const text = await file.text();
  if (!text.trim()) {
    throw new ParseError("The file looks empty. Export your chat again and re-upload.");
  }
  const displayName = file.name.replace(/\.[^.]+$/, "") || "Imported chat";
  return { text, displayName };
}
