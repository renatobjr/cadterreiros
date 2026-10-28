import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyToClipboard } from "../../src/utils/clipboard";

function stubClipboard(impl: (() => Promise<void>) | null) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: impl ? { writeText: vi.fn(impl) } : undefined,
  });
}

function stubExecCommand(result: boolean) {
  Object.defineProperty(document, "execCommand", {
    configurable: true,
    value: vi.fn(() => result),
  });
  return document.execCommand as unknown as ReturnType<typeof vi.fn>;
}

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    stubClipboard(null);
  });

  it("usa a Clipboard API quando disponível", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    await expect(copyToClipboard("http://x/terreiro/a")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("http://x/terreiro/a");
  });

  it("cai para execCommand quando a Clipboard API falha", async () => {
    stubClipboard(() => Promise.reject(new Error("NotAllowedError")));
    const exec = stubExecCommand(true);

    await expect(copyToClipboard("http://x/terreiro/a")).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith("copy");
  });

  it("cai para execCommand quando não há Clipboard API", async () => {
    stubClipboard(null);
    const exec = stubExecCommand(true);

    await expect(copyToClipboard("texto")).resolves.toBe(true);
    expect(exec).toHaveBeenCalled();
  });

  it("devolve false quando as duas estratégias falham", async () => {
    stubClipboard(null);
    stubExecCommand(false);

    await expect(copyToClipboard("texto")).resolves.toBe(false);
  });
});
