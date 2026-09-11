import { describe, it, expect } from "vitest";
import generateLayout from "~/printouts/example";
import type { DefinitionsOptionsType } from "~/types";

const mockData: DefinitionsOptionsType = {
  currentDate: "15 มกราคม 2568",
  workPlace: "สำนักงานทดสอบ",
  boraEmployeeName: "สมชาย ใจดี",
  employeeSender: "สมหญิง รักดี",
  rcodeSender: "1001",
  itemsBox: [
    { boxNo: "A001", sumCard: 100 },
    { boxNo: "A002", sumCard: 95 },
    { boxNo: "A003", sumCard: 80 },
  ],
  totalCard: "275",
};

describe("generateLayout", () => {
  it("should return a valid TDocumentDefinitions object", () => {
    const result = generateLayout(mockData);

    expect(result).toHaveProperty("background");
    expect(result).toHaveProperty("header");
    expect(result).toHaveProperty("footer");
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("styles");
  });

  it("should define styles with header, subheader, paragraph, fiedForm", () => {
    const result = generateLayout(mockData);

    expect(result.styles).toEqual({
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 18 },
      paragraph: { fontSize: 14 },
      fiedForm: { fontSize: 14, bold: true },
    });
  });

  it("should have content as an array", () => {
    const result = generateLayout(mockData);
    expect(Array.isArray(result.content)).toBe(true);
  });
});

describe("buildBackground", () => {
  it("should return a function (DynamicBackground)", () => {
    const result = generateLayout(mockData);
    expect(typeof result.background).toBe("function");
  });

  it("should generate a rect canvas based on page size", () => {
    const result = generateLayout(mockData);
    const bgFn = result.background as Function;
    const bg = bgFn(1, { width: 595, height: 842 });

    expect(bg.canvas).toHaveLength(1);
    expect(bg.canvas[0].type).toBe("rect");
    expect(bg.canvas[0].x).toBe(10);
    expect(bg.canvas[0].y).toBe(10);
    expect(bg.canvas[0].w).toBe(575); // 595 - 20
    expect(bg.canvas[0].h).toBe(822); // 842 - 20
  });
});

describe("buildHeader", () => {
  it("should return a function (DynamicContent)", () => {
    const result = generateLayout(mockData);
    expect(typeof result.header).toBe("function");
  });

  it("should include page number, title, workplace, and date", () => {
    const result = generateLayout(mockData);
    const headerFn = result.header as Function;
    const header = headerFn(1, 3, { width: 595, height: 842 });

    expect(header.stack).toBeDefined();
    expect(header.stack.length).toBeGreaterThanOrEqual(4);

    // Page number
    expect(header.stack[0].text).toBe("หน้า 1/3");

    // Title
    expect(header.stack[1].text).toBe("ใบรายงานรับคืนบัตรไม่ครบ 100 ใบ");

    // Workplace
    expect(header.stack[2].text).toBe("สำนักงานทดสอบ");

    // Date
    expect(header.stack[3].text[1].text).toBe("15 มกราคม 2568");
  });
});

describe("buildFooter", () => {
  it("should return a function (DynamicContent)", () => {
    const result = generateLayout(mockData);
    expect(typeof result.footer).toBe("function");
  });

  it("should include signature blocks with sender and receiver names", () => {
    const result = generateLayout(mockData);
    const footerFn = result.footer as Function;
    const footer = footerFn(1, 1, { width: 595, height: 842 });

    expect(footer.stack).toBeDefined();

    // Signature columns
    const columns = footer.stack[1].columns;
    expect(columns).toHaveLength(2);

    // Sender signature
    expect(columns[0].stack[0].text).toContain("ผู้ส่งคืนบัตร");
    expect(columns[0].stack[1].text).toContain("สมหญิง รักดี");

    // Receiver signature
    expect(columns[1].stack[0].text).toContain("ผู้รับคืนบัตร");
    expect(columns[1].stack[1].text).toContain("สมชาย ใจดี");
  });

  it("should handle undefined boraEmployeeName", () => {
    const dataWithoutName: DefinitionsOptionsType = {
      ...mockData,
      boraEmployeeName: undefined,
    };

    const result = generateLayout(dataWithoutName);
    const footerFn = result.footer as Function;
    const footer = footerFn(1, 1, { width: 595, height: 842 });

    const columns = footer.stack[1].columns;
    expect(columns[1].stack[1].text).toContain("");
  });
});

describe("buildContent", () => {
  it("should include summary text with rcodeSender and totals", () => {
    const result = generateLayout(mockData);
    const content = result.content as any[];
    const stack = content[0].stack;

    // Summary text
    const summaryText = stack[0].text;
    expect(summaryText[0].text).toContain("1001");
    expect(summaryText[1].text).toContain("3 กล่อง");
    expect(summaryText[2].text).toContain("275 ใบ");
  });

  it("should build table with correct number of rows", () => {
    const result = generateLayout(mockData);
    const content = result.content as any[];
    const table = content[0].stack[1].table;

    // 1 header row + 3 data rows
    expect(table.body).toHaveLength(4);
    expect(table.headerRows).toBe(1);
  });

  it("should format table rows with index and box info", () => {
    const result = generateLayout(mockData);
    const content = result.content as any[];
    const table = content[0].stack[1].table;
    const dataRows = table.body.slice(1); // skip header

    expect(dataRows[0][1]).toEqual({ text: "1", alignment: "center", bold: false });
    expect(dataRows[0][2]).toEqual({ text: "A001 (100)", alignment: "center", bold: false });

    expect(dataRows[2][1]).toEqual({ text: "3", alignment: "center", bold: false });
    expect(dataRows[2][2]).toEqual({ text: "A003 (80)", alignment: "center", bold: false });
  });

  it("should have noBorders layout", () => {
    const result = generateLayout(mockData);
    const content = result.content as any[];
    const tableContent = content[0].stack[1];

    expect(tableContent.layout).toBe("noBorders");
  });

  it("should handle empty itemsBox", () => {
    const emptyData: DefinitionsOptionsType = {
      ...mockData,
      itemsBox: [],
    };

    const result = generateLayout(emptyData);
    const content = result.content as any[];
    const table = content[0].stack[1].table;

    // Only header row
    expect(table.body).toHaveLength(1);
  });

  it("should handle undefined itemsBox", () => {
    const noBoxData: DefinitionsOptionsType = {
      ...mockData,
      itemsBox: undefined,
    };

    const result = generateLayout(noBoxData);
    const content = result.content as any[];
    const table = content[0].stack[1].table;

    // Only header row (buildTableRows returns [])
    expect(table.body).toHaveLength(1);
  });

  it("should have table widths as 30%, *, *, 30%", () => {
    const result = generateLayout(mockData);
    const content = result.content as any[];
    const table = content[0].stack[1].table;

    expect(table.widths).toEqual(["30%", "*", "*", "30%"]);
  });
});

describe("table header", () => {
  it("should have ลำดับที่ and กล่องที่ as bold centered cells", () => {
    const result = generateLayout(mockData);
    const content = result.content as any[];
    const headerRow = content[0].stack[1].table.body[0];

    expect(headerRow[1]).toEqual({ text: "ลำดับที่", alignment: "center", bold: true });
    expect(headerRow[2]).toEqual({ text: "กล่องที่", alignment: "center", bold: true });
  });

  it("should have empty cells at first and last position", () => {
    const result = generateLayout(mockData);
    const content = result.content as any[];
    const headerRow = content[0].stack[1].table.body[0];

    expect(headerRow[0]).toEqual({});
    expect(headerRow[3]).toEqual({});
  });
});
