import type { Content, ContentCanvas, ContentColumns, ContentStack, ContentTable, DynamicBackground, DynamicContent, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import type { DefinitionsOptionsType } from "~/types";

const BORDER_OFFSET = 10;
const PAGE_MARGIN = 20;

function centeredCell(text: string, bold = false): TableCell {
  return { text, alignment: "center", bold };
}

function emptyCell(): TableCell {
  return { text: "", alignment: "center" };
}

function fullWidthLine(pageWidth: number): ContentCanvas {
  return {
    canvas: [
      { type: "line", x1: 0, y1: 0, x2: pageWidth - PAGE_MARGIN, y2: 0, lineWidth: 1 },
    ],
  };
}

function signatureBlock(label: string, name: string): ContentStack {
  return {
    stack: [
      {
        text: `........................................................${label}`,
        alignment: "center",
        margin: [0, 10, 0, 0],
      },
      {
        text: `(  ${name}  )`,
        alignment: "center",
      },
    ],
  };
}

function buildBackground(): DynamicBackground {
  return (_currentPage, pageSize) => ({
    canvas: [
      {
        type: "rect",
        x: BORDER_OFFSET,
        y: BORDER_OFFSET,
        w: pageSize.width - PAGE_MARGIN,
        h: pageSize.height - PAGE_MARGIN,
        lineWidth: 1,
        lineColor: "#000",
      },
    ],
  });
}

function buildHeader(data: DefinitionsOptionsType): DynamicContent {
  return (currentPage, pageCount, pageSize) => ({
    margin: [BORDER_OFFSET, PAGE_MARGIN, 0, 0],
    stack: [
      {
        text: `หน้า ${currentPage}/${pageCount}`,
        absolutePosition: { x: 540, y: 20 },
        bold: true,
      },
      { text: "ใบรายงานรับคืนบัตรไม่ครบ 100 ใบ", alignment: "center", style: "header" },
      { text: data.workPlace, alignment: "center", style: "header" },
      {
        text: [
          { text: "วันที่รับคืน\t", bold: true },
          { text: data.currentDate },
        ], alignment: "left", margin: [PAGE_MARGIN, 0],
      },
      fullWidthLine(pageSize.width),
    ],
  });
}

function buildFooter(data: DefinitionsOptionsType): DynamicContent {
  return (_currentPage, _pageCount, pageSize) => ({
    margin: [BORDER_OFFSET, 0, BORDER_OFFSET, 0],
    stack: [
      fullWidthLine(pageSize.width),
      {
        columns: [
          signatureBlock("ผู้ส่งคืนบัตร", data.employeeSender),
          signatureBlock("ผู้รับคืนบัตร", data.boraEmployeeName ?? ""),
        ],
      } satisfies ContentColumns,
    ],
  });
}

function buildTableHeader(): TableCell[] {
  return [
    {},
    centeredCell("ลำดับที่", true),
    centeredCell("กล่องที่", true),
    {},
  ];
}

function buildTableRows(data: DefinitionsOptionsType): TableCell[][] {
  return data.itemsBox?.map((item, index) => [
    emptyCell(),
    centeredCell(`${index + 1}`),
    centeredCell(`${item.boxNo} (${item.sumCard})`),
    emptyCell(),
  ]) ?? [];
}

function buildContent(data: DefinitionsOptionsType): Content {
  const boxTable: ContentTable = {
    table: {
      headerRows: 1,
      widths: ["30%", "*", "*", "30%"],
      body: [buildTableHeader(), ...buildTableRows(data)],
    },
    layout: "noBorders",
  };

  return {
    stack: [
      {
        text: [
          { text: `สรุปรายการการรับคืนบัตร ${data.rcodeSender} ` },
          { text: `\tจำนวน ${data.itemsBox?.length} กล่อง` },
          { text: `\tจำนวน ${data.totalCard} ใบ` },
        ],
      },
      boxTable,
    ],
    margin: [BORDER_OFFSET, 5, BORDER_OFFSET, 0],
  } satisfies ContentStack;
}

export default function generateLayout(data: DefinitionsOptionsType): TDocumentDefinitions {
  return {
    background: buildBackground(),
    header: buildHeader(data),
    footer: buildFooter(data),
    content: [buildContent(data)],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 18 },
      paragraph: { fontSize: 14 },
      fiedForm: { fontSize: 14, bold: true },
    },
  };
}
