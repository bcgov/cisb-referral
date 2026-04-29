import { describe, it, expect, vi, beforeEach } from "vitest";
import { toCsv, downloadCsv } from "../../utils/csv";

describe("toCsv", () => {
  it("should join headers and rows with CRLF", () => {
    const csv = toCsv(
      ["A", "B"],
      [
        ["1", "2"],
        ["3", "4"],
      ],
    );
    expect(csv).toBe("A,B\r\n1,2\r\n3,4");
  });

  it("should return only the header line when there are no rows", () => {
    const csv = toCsv(["Name", "Age"], []);
    expect(csv).toBe("Name,Age");
  });

  it("should double-quote cells containing commas", () => {
    const csv = toCsv(["Val"], [["hello, world"]]);
    expect(csv).toBe('Val\r\n"hello, world"');
  });

  it("should escape embedded double quotes", () => {
    const csv = toCsv(["Val"], [['say "hi"']]);
    expect(csv).toBe('Val\r\n"say ""hi"""');
  });

  it("should double-quote cells containing newlines", () => {
    const csv = toCsv(["Val"], [["line1\nline2"]]);
    expect(csv).toBe('Val\r\n"line1\nline2"');
  });

  it("should defang formula-prefix characters", () => {
    const formulaPrefixes = ["=CMD()", "+1", "-1", "@SUM(A1)"];
    for (const input of formulaPrefixes) {
      const csv = toCsv(["Val"], [[input]]);
      expect(csv).not.toContain(`\r\n${input}`);
      expect(csv).toContain("'");
    }
  });

  it("should prepend single quote to = prefix", () => {
    const csv = toCsv(["Val"], [["=1+1"]]);
    expect(csv).toBe("Val\r\n'=1+1");
  });

  it("should handle tab prefix as formula injection vector", () => {
    const csv = toCsv(["Val"], [["\tcmd"]]);
    expect(csv).toContain("'");
  });

  it("should not alter plain text values", () => {
    const csv = toCsv(["Name"], [["Alice"]]);
    expect(csv).toBe("Name\r\nAlice");
  });

  it("should handle empty string cells", () => {
    const csv = toCsv(["A", "B"], [["", "val"]]);
    expect(csv).toBe("A,B\r\n,val");
  });

  it("should handle a cell with both a formula prefix and a quote", () => {
    const csv = toCsv(["Val"], [['=say "hi"']]);
    expect(csv).toBe('Val\r\n"\'=say ""hi"""');
  });
});

describe("downloadCsv", () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLMock = vi.fn().mockReturnValue("blob:test");
    revokeObjectURLMock = vi.fn();
    clickSpy = vi.fn();

    globalThis.URL.createObjectURL = createObjectURLMock as typeof URL.createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock as typeof URL.revokeObjectURL;

    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement);

    vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
  });

  it("should create a blob with a UTF-8 BOM prefix", () => {
    downloadCsv("test.csv", "A,B\r\n1,2");

    expect(createObjectURLMock).toHaveBeenCalledOnce();
    const blob: Blob = createObjectURLMock.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/csv;charset=utf-8");
  });

  it("should trigger a download with the given filename", () => {
    downloadCsv("referrals-export.csv", "data");

    const createElement = document.createElement as ReturnType<typeof vi.fn>;
    const anchor = createElement.mock.results.at(-1)?.value;
    expect(anchor.download).toBe("referrals-export.csv");
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("should revoke the object URL after download", () => {
    downloadCsv("test.csv", "data");
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:test");
  });

  it("should include BOM so Excel detects UTF-8 encoding", () => {
    const BlobSpy = vi.spyOn(globalThis, "Blob");

    downloadCsv("test.csv", "Héllo");

    expect(BlobSpy).toHaveBeenCalledOnce();
    const [parts] = BlobSpy.mock.calls[0];
    expect(parts?.[0]).toBe("\uFEFF");

    BlobSpy.mockRestore();
  });
});
