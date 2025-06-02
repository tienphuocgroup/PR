import { PaymentRequest, PaymentDetail } from '../types';
import { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';

export interface PDFDocOptions {
  status?: string;
  showWatermark?: boolean;
}
import { formatDate, formatCurrency } from './formatters';

export function getModernPaymentRequestDocDefinition(
  data: PaymentRequest,
  pdfOptions?: PDFDocOptions
): TDocumentDefinitions {
  const docDefinition: TDocumentDefinitions = {
    ...(pdfOptions?.showWatermark && pdfOptions?.status && {
      watermark: {
        text: pdfOptions.status.toUpperCase(),
        color: 'gray',
        opacity: 0.2,
        bold: true,
        italics: false,
        angle: -45,
      }
    }),
    content: [
      /* ---------- HEADER BLOCK (NEW) ---------- */
      {
        table: {
          widths: ['20%', '50%', '30%'], // Adjusted widths for the new layout
          body: [
            [
              {
                text: 'TPG',
                style: 'tpgLogo',
                rowSpan: 2,
                alignment: 'center',
                margin: [0, 15, 0, 0] // Vertical alignment for TPG logo
              },
              {
                text: 'CÔNG TY CỔ PHẦN TẬP ĐOÀN TIẾN PHƯỚC',
                style: 'companyName',
                alignment: 'center',
              },
              {
                table: {
                  widths: ['auto', '*'],
                  body: [
                    [{ text: 'Mã tài liệu', style: 'infoLabelSmall', border: [false,false,false,false] }, { text: 'F_QP_M05_01', style: 'infoValueSmall', border: [false,false,false,false], alignment: 'left' }],
                    [{ text: 'Lần ban hành', style: 'infoLabelSmall', border: [false,false,false,false] }, { text: '01', style: 'infoValueSmall', border: [false,false,false,false], alignment: 'left' }],
                    [{ text: 'Ngày hiệu lực', style: 'infoLabelSmall', border: [false,false,false,false] }, { text: '18/7/22', style: 'infoValueSmall', border: [false,false,false,false], alignment: 'left' }]
                  ]
                },
                layout: { // Layout for the nested info table on the right
                  hLineWidth: (i, node) => (i > 0 && i < node.table.body.length) ? 0.5 : 0,
                  vLineWidth: () => 0,
                  hLineColor: () => 'black',
                  paddingTop: () => 0, paddingBottom: () => 0, paddingLeft: () => 2, paddingRight: () => 2,
                },
                rowSpan: 2,
                margin: [0, 5, 0, 0] // Align this block slightly lower to match company name/title block
              }
            ],
            [
              {text: '', border: [false,false,false,false]}, // Empty cell due to TPG logo rowSpan
              {
                text: 'PHIẾU ĐỀ NGHỊ THANH TOÁN',
                style: 'documentTitle',
                alignment: 'center'
              },
              {text: '', border: [false,false,false,false]} // Empty cell due to right-side info rowSpan
            ]
          ]
        },
        layout: { // Layout for the main header table (TPG | Company/Title | Info Block)
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length || (i === 1 && node.table.body.length === 2)) ? 0.5 : 0,
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length || (i > 0 && i < node.table.widths.length)) ? 0.5 : 0,
          hLineColor: () => 'black',
          vLineColor: () => 'black',
          paddingTop: () => 2, paddingBottom: () => 2, paddingLeft: () => 4, paddingRight: () => 4,
        }
      },
      // Line separator after main header block
      {
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: 'black' }],
        margin: [0, 0, 0, 2] // Minimal margin after the line
      },
      // Số, Ngày, Số PR, Nợ, Có block
      {
        table: {
          widths: ['60%', '40%'], // Give more space to Số/Ngày/PR
          body: [
            [
              {
                stack: [
                  { text: `Số: ${data.so || '..............................'}`, style: 'info' },
                  { text: `Ngày: ${data.ngay ? formatDate(data.ngay) : '..............................'}`, style: 'info' },
                  { text: data.soPR ? `Số PR: ${data.soPR}` : 'Số PR: ..........................', style: 'info' }
                ],
                border: [false, false, false, false]
              },
              {
                stack: [
                  { text: `Nợ: ${'..............................'}`, style: 'info', alignment: 'left' },
                  { text: `Có: ${'..............................'}`, style: 'info', alignment: 'left' }
                ],
                border: [false, false, false, false],
                margin: [20, 0, 0, 0] // Indent the Nợ/Có block to the right
              }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 3, 0, 3]
      },
      // Line separator after Số/Ngày/PR block, before PAYMENT METHOD
      {
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#999999' }],
        margin: [0, 0, 0, 10]
      },

      /* ---------- PAYMENT METHOD ---------- */
      {
        columns: [
          { text: '☐ Tiền mặt', style: 'checkbox' },
          { text: '☐ Chuyển khoản', style: 'checkbox' }
        ],
        margin: [0, 5, 0, 5]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.75, lineColor: '#999999' }
        ],
        margin: [0, 6, 0, 10]
      },

      /* ---------- FORM FIELDS ---------- */
      { text: `1. Người đề nghị: ${data.nguoiDeNghi}   ĐT/Số nội bộ: __________________`, style: 'paragraph' },
      { text: `2. Bộ phận (1): ${data.boPhan}   Dự án(2): __________________`, style: 'paragraph' },
      { text: `3. Ngân sách sử dụng: ☐ Ngân sách hoạt động   ☐ Ngân sách Dự Án   Mã khoản mục ngân sách: ${data.maKhoanMuc || ''}`, style: 'paragraph' },
      { text: `4. Kế hoạch chi hàng tháng: ☐ Trong kế hoạch Chi   ☐ Ngoài kế hoạch Chi`, style: 'paragraph' },
      { text: '5. Nội dung thanh toán:', style: 'paragraph' },
      { text: data.noiDungThanhToan, style: 'paragraph', margin: [15, 0, 0, 5] },
      { text: `6. Nhà thầu/ nhà cung cấp/ Đối tác: ${data.nhaCungCap || ''}`, style: 'paragraph' },
      { text: `7. Số tiền thanh toán: ${formatCurrency(data.soTien)}`, style: 'paragraph' },
    ],

    /* ---------- STYLES ---------- */
    styles: {
      // header: { fontSize: 16, bold: true, margin: [0, 0, 0, 15] }, // Original header style, commented out
      tpgLogo: { fontSize: 36, bold: true, alignment: 'center' }, // For "TPG"
      companyName: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 1] }, // For "CÔNG TY CỔ PHẦN TẬP ĐOÀN TIẾN PHƯỚC"
      documentTitle: { fontSize: 13, bold: true, alignment: 'center', margin: [0, 1, 0, 0] }, // For "PHIẾU ĐỀ NGHỊ THANH TOÁN"
      infoLabelSmall: { fontSize: 8, bold: false, margin: [0,0.5,0,0.5] }, // For labels like "Mã tài liệu"
      infoValueSmall: { fontSize: 8, bold: false, margin: [0,0.5,0,0.5], alignment: 'left' }, // For values like "F_QP_M05_01" (not bold in image)
      info: { fontSize: 10, margin: [0, 2, 0, 2] }, // Adjusted existing info style for Số/Ngày/PR
      subheader: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] },
      info: { fontSize: 10, margin: [0, 1, 0, 1] },
      infoAmount: { fontSize: 11, bold: true, margin: [0, 5, 0, 0] },
      infoAmountText: { fontSize: 10, italics: true, margin: [0, 0, 0, 10] },
      paragraph: { fontSize: 10, margin: [0, 0, 0, 5], alignment: 'justify' },
      tableHeader: { bold: true, fontSize: 9, fillColor: '#eeeeee', alignment: 'center' },
      tableCell: { fontSize: 8, margin: [2, 2, 2, 2] },
      tableCellNumber: { fontSize: 8, margin: [2, 2, 2, 2], alignment: 'right' },
      totalRowCell: { bold: true, fontSize: 9, margin: [2, 2, 2, 2] },
      totalRowCellAmount: { bold: true, fontSize: 9, margin: [2, 2, 2, 2], alignment: 'right' },
      signatureText: { fontSize: 10, bold: true, alignment: 'center' },
      signatureDate: { fontSize: 9, alignment: 'center', margin: [0, 2, 0, 0] },
      checkbox: { fontSize: 10, margin: [0, 1, 0, 1] },
      signatureHeader: { fontSize: 11, bold: true, alignment: 'center' },
    },

    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.2 }
  };

  /* ---------- DETAIL TABLE (if any) ---------- */
  if (data.chiTiet && data.chiTiet.length > 0) {
    const tableBody: TableCell[][] = [
      ['STT', 'Diễn giải', 'Số lượng', 'Đơn vị', 'Đơn giá', 'Thành tiền'].map(h => ({ text: h, style: 'tableHeader' })) as TableCell[]
    ];

    data.chiTiet.forEach((item: PaymentDetail) => {
      tableBody.push([
        { text: item.stt.toString(), style: 'tableCell', alignment: 'center' },
        { text: item.dienGiai, style: 'tableCell' },
        { text: item.soLuong.toLocaleString(), style: 'tableCellNumber' },
        { text: item.donVi, style: 'tableCell', alignment: 'center' },
        { text: formatCurrency(item.donGia), style: 'tableCellNumber' },
        { text: formatCurrency(item.thanhTien), style: 'tableCellNumber' },
      ]);
    });

    tableBody.push([
      { text: '', style: 'tableCell' },
      { text: 'TỔNG CỘNG', style: 'totalRowCell', colSpan: 4, alignment: 'right' }, {}, {}, {},
      { text: formatCurrency(data.soTien), style: 'totalRowCellAmount' },
    ]);

    docDefinition.content.push({ text: 'Chi tiết thanh toán:', style: 'subheader', margin: [0, 15, 0, 5] });
    docDefinition.content.push({
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: tableBody
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length || i === 1) ? 0.5 : 0.25,
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0.25,
        hLineColor: (i, node) => (i === 0 || i === node.table.body.length || i === 1) ? 'black' : 'gray',
        vLineColor: (i, node) => (i === 0 || i === node.table.widths.length) ? 'black' : 'gray',
        paddingLeft: () => 4, paddingRight: () => 4, paddingTop: () => 3, paddingBottom: () => 3,
        fillColor: (rowIndex: number) =>
          rowIndex === 0
            ? '#eeeeee'             // header row (already styled)
            : rowIndex % 2 === 0
            ? '#f9f9f9'             // even data rows
            : null,                 // odd data rows
      }
    });
  }

  /* ---------- SIGNATURE SECTIONS ---------- */
  // Bộ phận đề nghị
  docDefinition.content.push({ text: 'BỘ PHẬN ĐỀ NGHỊ', style: 'signatureHeader', margin: [0, 20, 0, 5] });
  docDefinition.content.push({
    columns: [
      {
        stack: [
          { text: 'Lập phiếu', style: 'signatureText' },
          { text: 'Nhân viên bộ phận', italics: true, fontSize: 9, alignment: 'center' },
          { text: '\n\n\n\n\n' },
          { text: 'Ký và ghi rõ họ tên', italics: true, fontSize: 9, alignment: 'center' },
          { text: 'Ngày ...../...../.....', italics: true, fontSize: 9, alignment: 'center' }
        ], width: '*'
      },
      {
        stack: [
          { text: 'Kiểm tra/ Xét duyệt', style: 'signatureText' },
          { text: 'Phụ trách Bộ Phận/Khối', italics: true, fontSize: 9, alignment: 'center' },
          { text: '\n\n\n\n\n' },
          { text: 'Ký và ghi rõ họ tên', italics: true, fontSize: 9, alignment: 'center' },
          { text: 'Ngày ...../...../.....', italics: true, fontSize: 9, alignment: 'center' }
        ], width: '*'
      },
    ]
  });

  // Bộ phận Tài chính Kế toán
  docDefinition.content.push({ text: 'BỘ PHẬN TÀI CHÍNH KẾ TOÁN', style: 'signatureHeader', margin: [0, 20, 0, 5] });
  docDefinition.content.push({
    columns: [
      {
        stack: [
          { text: 'Kiểm tra', style: 'signatureText' },
          { text: 'Kiểm soát ngân sách', italics: true, fontSize: 9, alignment: 'center' },
          { text: '\n\n\n\n\n' },
          { text: 'Ký và ghi rõ họ tên', italics: true, fontSize: 9, alignment: 'center' },
          { text: 'Ngày ...../...../.....', italics: true, fontSize: 9, alignment: 'center' }
        ], width: '*'
      },
      {
        stack: [
          { text: 'Kiểm tra', style: 'signatureText' },
          { text: 'Kế toán trưởng', italics: true, fontSize: 9, alignment: 'center' },
          { text: '\n\n\n\n\n' },
          { text: 'Ký và ghi rõ họ tên', italics: true, fontSize: 9, alignment: 'center' },
          { text: 'Ngày ...../...../.....', italics: true, fontSize: 9, alignment: 'center' }
        ], width: '*'
      },
      {
        stack: [
          { text: 'Xét duyệt', style: 'signatureText' },
          { text: 'Giám đốc tài chính', italics: true, fontSize: 9, alignment: 'center' },
          { text: '\n\n\n\n\n' },
          { text: 'Ký và ghi rõ họ tên', italics: true, fontSize: 9, alignment: 'center' },
          { text: 'Ngày ...../...../.....', italics: true, fontSize: 9, alignment: 'center' }
        ], width: '*'
      },
    ]
  });

  // Ban Tổng Giám Đốc
  docDefinition.content.push({
    text: 'PHÊ DUYỆT CỦA BAN TỔNG GIÁM ĐỐC',
    style: 'signatureHeader',
    margin: [0, 20, 0, 5],
    alignment: 'center'
  });

  /* ---------- FOOTER ---------- */
  docDefinition.footer = (currentPage: number, pageCount: number) => ({
    columns: [
      { text: `Ngày tạo: ${formatDate(new Date().toISOString())}`, alignment: 'left', style: 'info', margin: [40, 0, 0, 0] },
      { text: `Trang ${currentPage} / ${pageCount}`, alignment: 'right', style: 'info', margin: [0, 0, 40, 0] }
    ]
  });

  return docDefinition;
}