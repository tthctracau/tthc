import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  ExternalLink,
  Clock,
  Coins,
  FileText,
  Building2,
  Tag,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';
import { getDetailedTthcInfo } from '../services/tthcDetailHelper';

interface TthcDetailModalProps {
  item: TTHCItem | null;
  onClose: () => void;
  onOpenQrZoom?: (item: TTHCItem) => void;
}

export const TthcDetailModal: React.FC<TthcDetailModalProps> = ({
  item,
  onClose,
  onOpenQrZoom,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  const details = getDetailedTthcInfo(item);
  const isToanTrinh = item.level === 'Toàn trình';

  const handleCopyLink = () => {
    if (!item.url) return;
    navigator.clipboard.writeText(item.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-serif overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] sm:text-[16px] leading-tight text-white tracking-wide uppercase">
                CHI TIẾT THỦ TỤC HÀNH CHÍNH
              </h3>
              <p className="text-[12px] text-red-100 hidden sm:block">
                UBND PHƯỜNG TRÀ CÂU  • TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-[13px] rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              title="In phiếu hướng dẫn chi tiết hồ sơ & thời hạn"
            >
              <Printer className="w-4 h-4 text-slate-900" />
              <span className="hidden sm:inline">In Phiếu Hướng Dẫn</span>
              <span className="sm:hidden">In</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          ref={printContentRef}
          className="p-4 sm:p-6 overflow-y-auto space-y-5 text-[14px] leading-relaxed text-black bg-white font-['Times_New_Roman',serif] print:p-0 print:overflow-visible"
        >
          {/* Header printable only */}
          <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-4 text-black">
            <div className="text-[14px] font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="text-[14px] font-bold uppercase mb-2">Độc lập - Tự do - Hạnh phúc</div>
            <div className="text-[14px] font-bold uppercase">UBND PHƯỜNG TRÀ CÂU  • TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</div>
            <h1 className="text-[18px] font-bold uppercase text-black mt-2">
              PHIẾU HƯỚNG DẪN THỰC HIỆN THỦ TỤC HÀNH CHÍNH
            </h1>
          </div>

          {/* Procedure Title Card */}
          <div className="p-4 rounded-xl bg-white border border-black shadow-2xs space-y-2.5 text-black">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-['Times_New_Roman',serif] font-bold text-[14px] px-2.5 py-1 rounded bg-white text-black border border-black">
                Mã TTHC: {details.code}
              </span>
              <span
                style={{ backgroundColor: isToanTrinh ? '#ffff00' : '#00ff00' }}
                className="px-2.5 py-1 rounded text-[14px] font-bold border border-black text-black shadow-2xs"
              >
                Dịch vụ công {details.level}
              </span>
              <span className="px-2.5 py-1 rounded text-[14px] font-medium bg-white text-black border border-black">
                Lĩnh vực: {details.category}
              </span>
            </div>

            <h2 className="text-[16px] sm:text-[18px] font-bold text-black leading-snug">
              {details.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] text-black pt-1 border-t border-black">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-black shrink-0" />
                <span>
                  <strong>Cơ quan ban hành:</strong> {details.agency}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-black shrink-0" />
                <span>
                  <strong>Cơ quan thực hiện:</strong> {details.receivingAgency}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Core Highlight Blocks: Thời hạn giải quyết, Phí & Lệ phí, Kết quả */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Box 1: Thời hạn giải quyết */}
            <div className="p-3.5 rounded-xl border border-black bg-white text-black flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-black font-bold text-[14px] mb-1.5">
                  <Clock className="w-4 h-4 text-black shrink-0" />
                  <span>THỜI HẠN GIẢI QUYẾT</span>
                </div>
                <p className="font-bold text-[15px] text-black">
                  {details.duration}
                </p>
                <p className="text-[14px] text-black mt-1">
                  {details.durationDetail}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-black text-[13px] text-black font-medium">
                ✓ Áp dụng theo Quyết định công bố TTHC của UBND tỉnh
              </div>
            </div>

            {/* Box 2: Phí & Lệ phí */}
            <div className="p-3.5 rounded-xl border border-black bg-white text-black flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-black font-bold text-[14px] mb-1.5">
                  <Coins className="w-4 h-4 text-black shrink-0" />
                  <span>PHÍ, LỆ PHÍ</span>
                </div>
                <p className="font-bold text-[15px] text-black">
                  {details.fee}
                </p>
                <p className="text-[14px] text-black mt-1">
                  {details.feeDetail}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-black text-[13px] text-black font-medium">
                ✓ Nộp trực tiếp tại Trung tâm Phục vụ hành chính công phường Trà Câu hoặc thanh toán trực tuyến qua VNeID
              </div>
            </div>
          </div>

          {/* Section: THÀNH PHẦN HỒ SƠ (Yêu cầu chính của người dùng) */}
          <div className="border border-black rounded-xl overflow-hidden shadow-2xs bg-white text-black">
            <div className="bg-white p-3 border-b border-black flex items-center justify-between text-black">
              <h4 className="font-bold text-black text-[14px] flex items-center gap-2 uppercase">
                <FileText className="w-4 h-4 text-black" />
                <span>THÀNH PHẦN HỒ SƠ QUY ĐỊNH (DANH MỤC GIẤY TỜ CẦN NỘP)</span>
              </h4>
              <span className="text-[13px] font-bold text-black bg-white px-2 py-0.5 rounded border border-black">
                {details.dossier.length} mục hồ sơ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] border-collapse bg-white text-black">
                <thead>
                  <tr className="bg-white text-black text-[14px] font-bold border-b border-black">
                    <th className="py-2.5 px-3 text-center w-12 border-r border-black">STT</th>
                    <th className="py-2.5 px-3 border-r border-black">Tên loại giấy tờ, tài liệu</th>
                    <th className="py-2.5 px-3 text-center w-28 border-r border-black">Bản chính</th>
                    <th className="py-2.5 px-3 text-center w-28 border-r border-black">Bản sao</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Ghi chú / Hướng dẫn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black text-black">
                  {details.dossier.map((doc, idx) => (
                    <tr
                      key={idx}
                      className="bg-white text-black"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-black border-r border-black">
                        {doc.stt}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-black border-r border-black">
                        {doc.name}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-black whitespace-nowrap">
                        <span className="font-medium text-black">{doc.original}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-black whitespace-nowrap">
                        <span className="font-medium text-black">{doc.copy}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[14px] text-black">
                        {doc.note || 'Theo biểu mẫu quy định'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-white border-t border-black text-[14px] text-black flex items-start gap-2">
              <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý khi nộp trực tuyến:</strong> Công dân chụp ảnh hoặc scan các tài liệu giấy tờ nêu trên (định dạng PDF hoặc JPEG/PNG rõ nét, không mờ nhòe) và đính kèm vào đúng mục tương ứng trên Cổng Dịch vụ công.
              </div>
            </div>
          </div>

          {/* Section: CÁCH THỨC VÀ TRÌNH TỰ THỰC HIỆN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cách thức nộp hồ sơ */}
            <div className="border border-black rounded-xl p-3.5 bg-white text-black space-y-2">
              <h4 className="font-bold text-[14px] text-black flex items-center gap-2">
                <Layers className="w-4 h-4 text-black" />
                <span>CÁCH THỨC THỰC HIỆN</span>
              </h4>
              <ul className="space-y-1.5 text-[14px] text-black">
                {details.submissionMethods.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trình tự thực hiện */}
            <div className="border border-black rounded-xl p-3.5 bg-white text-black space-y-2">
              <h4 className="font-bold text-[14px] text-black flex items-center gap-2">
                <Calendar className="w-4 h-4 text-black" />
                <span>TRÌNH TỰ GIẢI QUYẾT TẠI TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</span>
              </h4>
              <ul className="space-y-1.5 text-[14px] text-black">
                {details.executionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="font-bold text-black shrink-0">#{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section: MÃ QR TRA CỨU & NỘP TRỰC TUYẾN */}
          <div className="p-4 rounded-xl bg-white border border-black flex flex-col sm:flex-row items-center gap-5 text-black">
            <div className="shrink-0 flex flex-col items-center">
              <div
                onClick={() => onOpenQrZoom && onOpenQrZoom(item)}
                style={{ backgroundColor: '#ffcc99' }}
                className="p-2.5 rounded-xl border border-black shadow-sm cursor-pointer hover:shadow-md transition group"
                title="Bấm để phóng to mã QR"
              >
                {item.url ? (
                  <div className="bg-white p-1 rounded-lg border border-black/20">
                    <QrCodeImage url={item.url} size={130} />
                  </div>
                ) : (
                  <div className="w-[130px] h-[130px] flex items-center justify-center text-black text-xs">
                    Chưa có link
                  </div>
                )}
                <span className="text-[13px] font-bold text-black text-center block mt-1">
                  Mã QR nộp hồ sơ
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 text-center sm:text-left text-black">
              <h4 className="font-bold text-black text-[14px]">
                NỘP HỒ SƠ TRỰC TUYẾN QUA CỔNG DỊCH VỤ CÔNG:
              </h4>
              <p className="text-[14px] text-black">
                Sử dụng điện thoại thông minh mở ứng dụng <strong>Camera</strong>, <strong>Zalo</strong> hoặc <strong>VNeID</strong> để quét mã QR bên cạnh và bắt đầu nộp hồ sơ trực tuyến ngay lập tức.
              </p>

              {item.url && (
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: '#99ffcc' }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-black hover:opacity-90 font-bold rounded-lg text-[14px] border border-black shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>Mở Cổng Dịch Vụ Công</span>
                    <ExternalLink className="w-4 h-4 text-black" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 font-bold rounded-lg text-[13px] transition cursor-pointer"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-400">Đã chép link</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[13px] text-slate-600 dark:text-slate-300 shrink-0">
          <div className="text-center sm:text-left">
            <span>Trung tâm Phục vụ hành chính công phường Trà Câu • Hỗ trợ tiếp nhận và trả kết quả TTHC</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold rounded-lg text-[13px] transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-[13px] shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Hướng Dẫn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
