import { PaymentRequest, PaymentDetail } from '../types';
import { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';

export interface PDFDocOptions {
  status?: string;
  showWatermark?: boolean;
  images?: Record<string, string>; // e.g., { tpgLogo: 'data:image/png;base64,...' }
}
import { formatDate, formatCurrency } from './formatters';

export function getModernPaymentRequestDocDefinition(
  data: PaymentRequest,
  pdfOptions?: PDFDocOptions
): TDocumentDefinitions {
  const pageContentStack: any[] = [];

  // Start with the initial content elements
  pageContentStack.push(
    /* ---------- HEADER BLOCK (NEW) ---------- */
    {
      table: {
        widths: ['20%', '50%', '30%'], // Adjusted widths for the new layout
        body: [
          [
            {
              image: 'tpgLogo',
              width: 60,
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


    /* ---------- PAYMENT METHOD ---------- */
    {
      columns: [
        { text: '☐ Tiền mặt', style: 'checkbox' },
        { text: '☐ Chuyển khoản', style: 'checkbox' }
      ],
      margin: [0, 2, 0, 2]
    },
    

    /* ---------- FORM FIELDS ---------- */
    { text: `1. Người đề nghị: ${data.nguoiDeNghi}   ĐT/Số nội bộ: __________________`, style: 'paragraph' },
    // Line 2: Bộ phận / Dự án
    {
      columns: [
        { text: `2. Bộ phận (1): ${data.boPhan || ''}`, style: 'formFieldText', width: '50%' },
        { text: `Dự án(2): __________________`, style: 'formFieldText', width: '50%' }
      ],
      margin: [0, 0, 0, 2]
    },
    // Line 3: Ngân sách sử dụng
    {
      columns: [
        { text: `3. Ngân sách sử dụng:\u00A0\u00A0☑ Ngân sách hoạt động\u00A0\u00A0☐ Ngân sách Dự Án`, style: 'formFieldText', width: 'auto' },
        {
          text: [
            { text: 'Mã khoản mục ngân sách: ', style: 'formFieldText' },
            { text: `${data.maKhoanMuc || ''}`, style: ['formFieldText', 'blueText'] }
          ],
          width: '*', 
          alignment: 'left'
        }
      ],
      margin: [0, 0, 0, 2]
    },
    // Line 4: Kế hoạch chi hàng tháng
    {
      text: `4. Kế hoạch chi hàng tháng:\u00A0\u00A0☑ Trong kế hoạch Chi\u00A0\u00A0☐ Ngoài kế hoạch Chi`,
      style: 'formFieldText',
      margin: [0, 0, 0, 2]
    },
    { text: '5. Nội dung thanh toán:', style: 'paragraph' },
    { text: data.noiDungThanhToan, style: ['paragraph', 'blueText'], margin: [15, 0, 0, 2] },
    { text: `6. Nhà thầu/ nhà cung cấp/ Đối tác: ${data.nhaCungCap || ''}`, style: 'paragraph' },
    { text: `7. Số tiền thanh toán: `, style: 'paragraph' }
  );

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

    pageContentStack.push({ text: 'Chi tiết thanh toán:', style: 'subheader', margin: [0, 8, 0, 2] });
    pageContentStack.push({
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
            ? '#eeeeee'
            : rowIndex % 2 === 0
            ? '#f9f9f9'
            : null,
      }
    });
  }

  // New Signature Section using tables
  pageContentStack.push({ text: '', margin: [0, 5, 0, 0] }); // Add a small top margin before signature blocks

  // Table 1: BỘ PHẬN ĐỀ NGHỊ
  pageContentStack.push({
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
              { text: '\n\n', style: 'sigSubTitle' },
              { text: 'Ký và ghi rõ họ tên', style: 'sigActionText' },
              { text: 'Ngày ...../...../.....', style: 'sigActionText' }
            ],
            margin: [0,1,0,1]
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
    margin: [0, 0, 0, 5]
  });

  // Table 2: BỘ PHẬN TÀI CHÍNH KẾ TOÁN
  pageContentStack.push({
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
    margin: [0, 0, 0, 5]
  });

  // Table 3: PHÊ DUYỆT CỦA BAN TỔNG GIÁM ĐỐC
  pageContentStack.push({
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
      hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0.25,
      vLineWidth: (_i: number, _node: any) => 0.5,
      hLineColor: () => 'black',
      vLineColor: () => 'black',
      paddingTop: () => 1, paddingBottom: () => 1, paddingLeft: () => 1, paddingRight: () => 1,
    },
    margin: [0, 0, 0, 10]
  });

  const docDefinition: TDocumentDefinitions = {
    pageMargins: [30, 30, 30, 30], // Added page margins
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
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: pageContentStack,
              }
            ]
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.5 : 0,
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0,
          hLineColor: () => '#333',
          vLineColor: () => '#333',
          paddingTop: () => 0,
          paddingBottom: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        }
      }
    ],
    styles: {
      tpgLogo: { fontSize: 36, bold: true, alignment: 'center' },
      companyName: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 0.5] },
      documentTitle: { fontSize: 13, bold: true, alignment: 'center', margin: [0, 0.5, 0, 0] },
      blueText: { color: '#0070C0' },
      formFieldText: { fontSize: 10, alignment: 'left' },
      infoLabelSmall: { fontSize: 8, bold: false, margin: [0,0.2,0,0.2] },
      infoValueSmall: { fontSize: 8, bold: false, margin: [0,0.2,0,0.2], alignment: 'left' },
      subheader: { fontSize: 13, bold: true, margin: [0, 5, 0, 2] },
      info: { fontSize: 10, margin: [0, 0.5, 0, 0.5] },
      infoAmount: { fontSize: 11, bold: true, margin: [0, 2, 0, 0] },
      infoAmountText: { fontSize: 10, italics: true, margin: [0, 0, 0, 4] },
      paragraph: { fontSize: 10, margin: [0, 0, 0, 2], alignment: 'justify' },
      tableHeader: { bold: true, fontSize: 9, fillColor: '#eeeeee', alignment: 'center' },
      tableCell: { fontSize: 8, margin: [2, 1, 2, 1] },
      tableCellNumber: { fontSize: 8, margin: [2, 1, 2, 1], alignment: 'right' },
      totalRowCell: { bold: true, fontSize: 9, margin: [2, 1, 2, 1] },
      totalRowCellAmount: { bold: true, fontSize: 9, margin: [2, 1, 2, 1], alignment: 'right' },
      checkbox: { fontSize: 10, margin: [0, 0.5, 0, 0.5] },
      sigSectionHeader: { fontSize: 9, bold: true, alignment: 'left', fillColor: '#EFEFEF', margin: [2,1,2,1] },
      sigTitle: { fontSize: 9, bold: true, alignment: 'center', margin: [0, 1, 0, 0.5] },
      sigSubTitle: { fontSize: 8, italics: true, alignment: 'center', margin: [0, 0.5, 0, 1] },
      sigActionText: { fontSize: 8, alignment: 'center', margin: [0, 0.5, 0, 0.5] },
      sigFinalApprovalHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: '#EFEFEF', margin: [2,1,2,1] },
      sigFinalDateText: { fontSize: 8, alignment: 'center' }
    },
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.1 }
  };

  // Remove the separate page footer if it exists
  delete docDefinition.footer;

  // Attach images if provided
  if (pdfOptions?.images) {
    (docDefinition as any).images = pdfOptions.images;
  }
  return docDefinition;
}