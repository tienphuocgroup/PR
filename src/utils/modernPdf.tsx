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
                margin: [0, 8, 0, 0] // Vertical alignment for TPG logo
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
                margin: [0, 2, 0, 0] // Align this block slightly lower to match company name/title block
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
          paddingTop: () => 1, paddingBottom: () => 1, paddingLeft: () => 4, paddingRight: () => 4,
        }
      },
      // Line separator after main header block
      {
        canvas: [{ type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: 'black' }],
        margin: [0, 0, 0, 1] // Minimal margin after the line
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
        margin: [0, 1, 0, 1]
      },
      // Line separator after Số/Ngày/PR block, before PAYMENT METHOD
      {
        canvas: [{ type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 0.5, lineColor: '#999999' }],
        margin: [0, 0, 0, 4]
      },

      /* ---------- PAYMENT METHOD ---------- */
      {
        columns: [
          { text: '☐ Tiền mặt', style: 'checkbox' },
          { text: '☐ Chuyển khoản', style: 'checkbox' }
        ],
        margin: [0, 2, 0, 2]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.75, lineColor: '#999999' }
        ],
        margin: [0, 2, 0, 4]
      },

      /* ---------- FORM FIELDS ---------- */
      { text: `1. Người đề nghị: ${data.nguoiDeNghi}   ĐT/Số nội bộ: __________________`, style: 'paragraph' },
      { text: `2. Bộ phận (1): ${data.boPhan}   Dự án(2): __________________`, style: 'paragraph' },
      { text: `3. Ngân sách sử dụng: ☐ Ngân sách hoạt động   ☐ Ngân sách Dự Án   Mã khoản mục ngân sách: ${data.maKhoanMuc || ''}`, style: 'paragraph' },
      { text: `4. Kế hoạch chi hàng tháng: ☐ Trong kế hoạch Chi   ☐ Ngoài kế hoạch Chi`, style: 'paragraph' },
      { text: '5. Nội dung thanh toán:', style: 'paragraph' },
      { text: data.noiDungThanhToan, style: 'paragraph', margin: [15, 0, 0, 2] },
      { text: `6. Nhà thầu/ nhà cung cấp/ Đối tác: ${data.nhaCungCap || ''}`, style: 'paragraph' },
      { text: `7. Số tiền thanh toán: ${formatCurrency(data.soTien)}`, style: 'paragraph' },
    ],

    /* ---------- STYLES ---------- */
    styles: {
      tpgLogo: { fontSize: 36, bold: true, alignment: 'center' },
      companyName: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 0.5] },
      documentTitle: { fontSize: 13, bold: true, alignment: 'center', margin: [0, 0.5, 0, 0] },
      infoLabelSmall: { fontSize: 8, bold: false, margin: [0,0.2,0,0.2] },
      infoValueSmall: { fontSize: 8, bold: false, margin: [0,0.2,0,0.2], alignment: 'left' },
      subheader: { fontSize: 13, bold: true, margin: [0, 5, 0, 2] }, // Reduced for 'Chi tiet thanh toan'
      info: { fontSize: 10, margin: [0, 0.5, 0, 0.5] }, // Used for Số/Ngày/PR and potentially old footer
      infoAmount: { fontSize: 11, bold: true, margin: [0, 2, 0, 0] },
      infoAmountText: { fontSize: 10, italics: true, margin: [0, 0, 0, 4] },
      paragraph: { fontSize: 10, margin: [0, 0, 0, 2], alignment: 'justify' },
      tableHeader: { bold: true, fontSize: 9, fillColor: '#eeeeee', alignment: 'center' },
      tableCell: { fontSize: 8, margin: [2, 1, 2, 1] },
      tableCellNumber: { fontSize: 8, margin: [2, 1, 2, 1], alignment: 'right' },
      totalRowCell: { bold: true, fontSize: 9, margin: [2, 1, 2, 1] },
      totalRowCellAmount: { bold: true, fontSize: 9, margin: [2, 1, 2, 1], alignment: 'right' },
      checkbox: { fontSize: 10, margin: [0, 0.5, 0, 0.5] },

      // New styles for the signature section
      sigSectionHeader: { fontSize: 9, bold: true, alignment: 'left', fillColor: '#EFEFEF', margin: [2,1,2,1] },
      sigTitle: { fontSize: 9, bold: true, alignment: 'center', margin: [0, 1, 0, 0.5] },
      sigSubTitle: { fontSize: 8, italics: true, alignment: 'center', margin: [0, 0.5, 0, 1] },
      sigActionText: { fontSize: 8, alignment: 'center', margin: [0, 0.5, 0, 0.5] },
      sigFinalApprovalHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: '#EFEFEF', margin: [2,1,2,1] },
      sigFinalDateText: { fontSize: 8, alignment: 'center' }
    },

    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.1 }
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

    docDefinition.content.push({ text: 'Chi tiết thanh toán:', style: 'subheader', margin: [0, 8, 0, 2] });
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
        paddingLeft: () => 4, paddingRight: () => 4, paddingTop: () => 1, paddingBottom: () => 1,
        fillColor: (rowIndex: number) =>
          rowIndex === 0
            ? '#eeeeee'             // header row (already styled)
            : rowIndex % 2 === 0
            ? '#f9f9f9'             // even data rows
            : null,                 // odd data rows
      }
    });
  }

  // New Signature Section using tables
  (docDefinition.content as any[]).push({ text: '', margin: [0, 5, 0, 0] }); // Add a small top margin before signature blocks

  // Table 1: BỘ PHẬN ĐỀ NGHỊ
  docDefinition.content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          { text: 'BỘ PHẬN ĐỀ NGHỊ', style: 'sigSectionHeader', colSpan: 2, alignment: 'left' }, {}
        ],
        [
          {
            stack: [
              { text: 'Lập phiếu', style: 'sigTitle' },
              { text: 'Nhân viên bộ phận', style: 'sigSubTitle' },
              { text: '\n\n', style: 'sigSubTitle' }, // Spacer for signature
              { text: 'Ký và ghi rõ họ tên', style: 'sigActionText' },
              { text: 'Ngày ...../...../.....', style: 'sigActionText' }
            ],
            margin: [0,1,0,1] // Cell content margin
          },
          {
            stack: [
              { text: 'Kiểm tra/ Xét duyệt', style: 'sigTitle' },
              { text: 'Phụ trách Bộ Phận/ Khối', style: 'sigSubTitle' },
              { text: '\n\n', style: 'sigSubTitle' },
              { text: 'Ký và ghi rõ họ tên', style: 'sigActionText' },
              { text: 'Ngày ...../...../.....', style: 'sigActionText' }
            ],
            margin: [0,1,0,1]
          }
        ]
      ]
    },
    layout: {
      hLineWidth: (i: number, node: { table: { body: any[] } }) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0.25,
      vLineWidth: (i: number, node: { table: { widths: any[] } }) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0.25,
      hLineColor: () => 'black',
      vLineColor: () => 'black',
      paddingTop: () => 1, paddingBottom: () => 1, paddingLeft: () => 1, paddingRight: () => 1,
    },
    margin: [0, 0, 0, 5] // Margin below this table
  });

  // Table 2: BỘ PHẬN TÀI CHÍNH KẾ TOÁN
  (docDefinition.content as any[]).push({
    table: {
      widths: ['33.33%', '33.33%', '33.34%'],
      body: [
        [
          { text: 'BỘ PHẬN TÀI CHÍNH KẾ TOÁN', style: 'sigSectionHeader', colSpan: 3, alignment: 'left' }, {}, {}
        ],
        [
          {
            stack: [
              { text: 'Kiểm tra', style: 'sigTitle' },
              { text: 'Kiểm soát ngân sách', style: 'sigSubTitle' },
              { text: '\n\n', style: 'sigSubTitle' },
              { text: 'Ký và ghi rõ họ tên', style: 'sigActionText' },
              { text: 'Ngày ...../...../.....', style: 'sigActionText' }
            ],
            margin: [0,1,0,1]
          },
          {
            stack: [
              { text: 'Kiểm tra', style: 'sigTitle' },
              { text: 'Kế toán trưởng', style: 'sigSubTitle' },
              { text: '\n\n', style: 'sigSubTitle' },
              { text: 'Ký và ghi rõ họ tên', style: 'sigActionText' },
              { text: 'Ngày ...../...../.....', style: 'sigActionText' }
            ],
            margin: [0,1,0,1]
          },
          {
            stack: [
              { text: 'Xét duyệt', style: 'sigTitle' },
              { text: 'Giám đốc tài chính', style: 'sigSubTitle' },
              { text: '\n\n', style: 'sigSubTitle' },
              { text: 'Ký và ghi rõ họ tên', style: 'sigActionText' },
              { text: 'Ngày ...../...../.....', style: 'sigActionText' }
            ],
            margin: [0,1,0,1]
          }
        ]
      ]
    },
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0.25,
      vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0.25,
      hLineColor: () => 'black',
      vLineColor: () => 'black',
      paddingTop: () => 1, paddingBottom: () => 1, paddingLeft: () => 1, paddingRight: () => 1,
    },
    margin: [0, 0, 0, 5] // Margin below this table
  });

  // Table 3: PHÊ DUYỆT CỦA BAN TỔNG GIÁM ĐỐC
  (docDefinition.content as any[]).push({
    table: {
      widths: ['*'],
      body: [
        [
          { text: 'PHÊ DUYỆT CỦA BAN TỔNG GIÁM ĐỐC', style: 'sigFinalApprovalHeader', alignment: 'center' }
        ],
        [
          { text: '\n\n\n', style: 'sigSubTitle' } // Spacer for signature
        ],
        [
          { text: 'Ngày ....../....../......', style: 'sigFinalDateText', alignment: 'center' }
        ]
      ]
    },
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0.25, // Thick lines for table top, under header, and table bottom
      vLineWidth: (_i: number, _node: any) => 0.5,
      hLineColor: () => 'black',
      vLineColor: () => 'black',
      paddingTop: () => 1, paddingBottom: () => 1, paddingLeft: () => 1, paddingRight: () => 1,
    },
    margin: [0, 0, 0, 10] // Margin below this table (page bottom margin)
  });

  // Remove the separate page footer if it exists, as the date line is now part of the content
  delete docDefinition.footer;

  return docDefinition;
}