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
      { text: 'PHIẾU ĐỀ NGHỊ THANH TOÁN', style: 'header', alignment: 'center' },
      { text: `Số: ${data.so}`, style: 'info' },
      { text: `Ngày lập: ${formatDate(data.ngay)}`, style: 'info' },
      data.soPR ? { text: `Số PR: ${data.soPR}`, style: 'info' } : null,
      { text: `Người đề nghị: ${data.nguoiDeNghi}`, style: 'info' },
      { text: `Bộ phận: ${data.boPhan}`, style: 'info' },
      data.nganSach ? { text: `Nguồn ngân sách: ${data.nganSach}`, style: 'info' } : null,
      data.maKhoanMuc ? { text: `Mã khoản mục: ${data.maKhoanMuc}`, style: 'info' } : null,
      data.keHoachChi ? { text: `Theo kế hoạch chi: ${data.keHoachChi}`, style: 'info' } : null,
      { text: 'Nội dung thanh toán:', style: 'subheader', margin: [0, 10, 0, 5] },
      { text: data.noiDungThanhToan, style: 'paragraph' },
      { text: `Nhà cung cấp: ${data.nhaCungCap}`, style: 'info', margin: [0, 5, 0, 5] },
      { text: `Số tiền: ${formatCurrency(data.soTien)}`, style: 'infoAmount' },
      { text: `(Bằng chữ: ${data.bangChu})`, style: 'infoAmountText' },
      data.ngayDenHan ? { text: `Ngày đến hạn thanh toán: ${formatDate(data.ngayDenHan)}`, style: 'info' } : null,
      data.chungTuDinhKem ? { text: `Chứng từ đính kèm: ${data.chungTuDinhKem}`, style: 'info' } : null,
    ].filter(Boolean), // Remove nulls from optional fields
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 15] },
      subheader: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] },
      info: { fontSize: 10, margin: [0, 1, 0, 1] },
      infoAmount: { fontSize: 11, bold: true, margin: [0, 5, 0, 0] },
      infoAmountText: { fontSize: 10, italics: true, margin: [0, 0, 0, 10] },
      paragraph: { fontSize: 10, margin: [0, 0, 0, 5], alignment: 'justify' },
      tableHeader: { bold: true, fontSize: 9, color: 'black', fillColor: '#eeeeee', alignment: 'center' },
      tableCell: { fontSize: 8, margin: [2, 2, 2, 2] },
      tableCellNumber: { fontSize: 8, margin: [2, 2, 2, 2], alignment: 'right' },
      totalRowCell: { bold: true, fontSize: 9, margin: [2, 2, 2, 2] },
      totalRowCellAmount: { bold: true, fontSize: 9, margin: [2, 2, 2, 2], alignment: 'right' },
      signatureText: { fontSize: 10, bold: true, alignment: 'center'},
      signatureDate: { fontSize: 9, alignment: 'center', margin: [0, 2, 0, 0]},
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.2,
    }
  };

  if (data.chiTiet && data.chiTiet.length > 0) {
    const tableBody: TableCell[][] = [
      [
        { text: 'STT', style: 'tableHeader' },
        { text: 'Diễn giải', style: 'tableHeader' },
        { text: 'Số lượng', style: 'tableHeader' },
        { text: 'Đơn vị', style: 'tableHeader' },
        { text: 'Đơn giá', style: 'tableHeader' },
        { text: 'Thành tiền', style: 'tableHeader' },
      ]
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
      { text: '', style: 'tableCell' }, // Empty for STT
      { text: 'TỔNG CỘNG', style: 'totalRowCell', colSpan: 4, alignment: 'right' },
      { text: '' }, { text: '' }, { text: '' }, // Empty cells due to colSpan for SL, DV, DonGia
      { text: formatCurrency(data.soTien), style: 'totalRowCellAmount' },
    ]);

    docDefinition.content.push({ text: 'Chi tiết thanh toán:', style: 'subheader', margin: [0,15,0,5] });
    docDefinition.content.push({
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: tableBody,
      },
      layout: {
        hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length || i === 1) ? 0.5 : 0.25,
        vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0.25,
        hLineColor: (i: number, node: any) => (i === 0 || i === node.table.body.length || i === 1) ? 'black' : 'gray',
        vLineColor: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 'black' : 'gray',
        paddingLeft: (_i: number, _node: any) => 4,
        paddingRight: (_i: number, _node: any) => 4,
        paddingTop: (_i: number, _node: any) => 3,
        paddingBottom: (_i: number, _node: any) => 3,
      }
    });
  }

  docDefinition.content.push({
    columns: [
      { stack: [{text: 'Người đề nghị', style: 'signatureText'}, {text: '(Ký, họ tên)', italics: true, fontSize: 9, alignment: 'center'}, {text: '\n\n\n\n\n'}, {text: data.nguoiDeNghi, style: 'signatureText'}], width: '*'},
      { stack: [{text: 'Trưởng bộ phận', style: 'signatureText'}, {text: '(Ký, họ tên)', italics: true, fontSize: 9, alignment: 'center'}, {text: '\n\n\n\n\n'}, {text: '.........................', style: 'signatureText'}], width: '*'},
      { stack: [{text: 'Giám đốc', style: 'signatureText'}, {text: '(Ký, họ tên)', italics: true, fontSize: 9, alignment: 'center'}, {text: '\n\n\n\n\n'}, {text: '.........................', style: 'signatureText'}], width: '*'},
    ],
    margin: [0, 30, 0, 0] // Add margin before signature section
  });
  
  // Add footer with page numbers
  docDefinition.footer = function(currentPage: number, pageCount: number) { 
    return { 
      columns: [
        { text: `Ngày tạo: ${formatDate(new Date().toISOString())}`, alignment: 'left', style: 'info', margin: [40, 0, 0, 0] },
        { text: `Trang ${currentPage.toString()} / ${pageCount}`, alignment: 'right', style: 'info', margin: [0, 0, 40, 0] }
      ]
    };
  };

  return docDefinition;
}