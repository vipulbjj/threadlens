import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { extractChatFromZipBytes, isAcceptedUploadFile, isZipFile } from "./read-upload-file";

describe("read-upload-file", () => {
  it("detects zip by extension and mime", () => {
    expect(isZipFile(new File([], "chat.zip", { type: "application/octet-stream" }))).toBe(true);
    expect(isZipFile(new File([], "chat.txt", { type: "text/plain" }))).toBe(false);
    expect(isAcceptedUploadFile(new File([], "export.ZIP"))).toBe(true);
    expect(isAcceptedUploadFile(new File([], "notes.pdf"))).toBe(false);
  });

  it("extracts _chat.txt from a minimal zip", () => {
    const body = "[1/1/24, 10:00:00] Alice: Hello";
    const zip = zipSync({ "_chat.txt": strToU8(body) });
    const { text, sourcePath } = extractChatFromZipBytes(zip, 10 * 1024 * 1024);
    expect(sourcePath).toBe("_chat.txt");
    expect(text).toContain("Alice: Hello");
  });

  it("prefers _chat.txt over other txt files", () => {
    const zip = zipSync({
      "readme.txt": strToU8("not a chat"),
      "folder/_chat.txt": strToU8("[1/1/24, 10:00:00] Bob: Hi"),
    });
    const { sourcePath, text } = extractChatFromZipBytes(zip, 10 * 1024 * 1024);
    expect(sourcePath).toContain("_chat.txt");
    expect(text).toContain("Bob: Hi");
  });

  it("rejects zip with no chat files", () => {
    const zip = zipSync({ "photo.jpg": strToU8("fake") });
    expect(() => extractChatFromZipBytes(zip, 10 * 1024 * 1024)).toThrow(/No .txt or .json/);
  });
});
