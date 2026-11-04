import React from 'react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';

interface PrintPdfDocumentProps {
  items: TTHCItem[];
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const PrintPdfDocument: React.FC<PrintPdfDocumentProps> = ({ items, containerRef }) => {
  return (
    <div 
      ref={containerRef}
      className="bg-white text-black font-serif text-[14px] p-6 sm:p-10 max-w-[1100px] mx-auto print:p-0 print:max-w-none"
    >
      {/* Official Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div className="text-center">
          <p className="text-[14px] font-bold uppercase tracking-tight">UBND PHƯỜNG TRÀ CÂU </p>
          <p className="text-[14px] font-extrabold uppercase tracking-tight">TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</p>
          <div className="w-16 h-0.5 bg-black mx-auto mt-1"></div>
        </div>

        <div className="text-center">
          <p className="text-[14px] font-bold uppercase tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="text-[14px] font-bold uppercase tracking-tight">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-24 h-0.5 bg-black mx-auto mt-1"></div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center my-6">
        <h1 className="text-base sm:text-xl font-extrabold text-black uppercase tracking-wide leading-tight">
          DANH MỤC THỦ TỤC HÀNH CHÍNH THUỘC THẨM QUYỀN GIẢI QUYẾT CỦA UBND PHƯỜNG TRÀ CÂU
        </h1>
        <p className="text-[13px] italic text-slate-700 mt-1">
          (Kèm theo thông báo và danh mục niêm yết công khai thủ tục hành chính trực tuyến)
        </p>
      </div>

      {/* Main Official Document Table */}
      <table className="w-full border-collapse border border-black text-[14px]">
        <thead>
          <tr className="bg-slate-200 text-black font-bold uppercase text-[14px] text-center">
            <th className="border border-black p-2 w-10">STT</th>
            <th className="border border-black p-2 w-28">Mã TTHC</th>
            <th className="border border-black p-2">Tên TTHC</th>
            <th className="border border-black p-2 w-24">Mức độ</th>
            <th className="border border-black p-2 w-24">Mã QR</th>
            <th className="border border-black p-2 w-64">Đường dẫn</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const isToanTrinh = item.level === 'Toàn trình';
            return (
              <tr key={item.stt} className="page-break-inside-avoid">
                <td className="border border-black p-2 text-center font-bold">
                  {index + 1}
                </td>
                <td className="border border-black p-2 font-mono font-semibold text-center whitespace-nowrap">
                  {item.code}
                </td>
                <td className="border border-black p-2 font-semibold leading-snug">
                  {item.title}
                </td>
                <td className="border border-black p-2 text-center align-middle">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
                    isToanTrinh 
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50' 
                      : 'border-amber-600 text-amber-800 bg-amber-50'
                  }`}>
                    {item.level}
                  </span>
                </td>
                <td className="border border-black p-1.5 text-center align-middle">
                  <div className="inline-block">
                    <QrCodeImage value={item.url} size={54} />
                  </div>
                </td>
                <td className="border border-black p-2 font-mono text-[10px] break-all text-blue-800 leading-tight">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-8 pt-4 flex justify-between items-end text-xs italic text-slate-700">
        <div>
          <p>Trà Câu, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
          <p className="font-semibold">TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG PHƯỜNG TRÀ CÂU</p>
        </div>
        <div className="text-right not-italic">
          <p className="font-bold">CHỦ TỊCH / NGUỜI ĐẠI DIỆN</p>
          <p className="text-[10px] text-slate-500 italic mt-12">(Đã ký tên và đóng dấu)</p>
        </div>
      </div>
    </div>
  );
};
