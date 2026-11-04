import React, { useRef } from 'react';
import { X, Printer, ExternalLink } from 'lucide-react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';

interface TthcSlipModalProps {
  item: TTHCItem | null;
  onClose: () => void;
}

export const TthcSlipModal: React.FC<TthcSlipModalProps> = ({ item, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-red-800 text-white p-4 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-base flex items-center gap-2">
            PHIẾU HƯỚNG DẪN TRA CỨU MÃ QR TTHC
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSlip}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-red-950 font-bold text-xs rounded transition"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Printable Slip */}
        <div className="p-6 overflow-y-auto space-y-6" ref={printRef}>
          {/* Printable Header */}
          <div className="text-center border-b border-slate-300 pb-4">
            <p className="text-xs font-bold uppercase text-slate-700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="text-xs font-semibold uppercase text-slate-600 mb-3">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">UBND PHƯỜNG TRÀ CÂU  • TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</p>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-2 uppercase">
              PHIẾU HƯỚNG DẪN THỰC HIỆN THỦ TỤC HÀNH CHÍNH TRỰC TUYẾN
            </h2>
          </div>

          {/* Procedure Info Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-sm">
            <div className="bg-slate-50 p-3 border-b border-slate-300 font-bold text-slate-800">
              Thông tin thủ tục hành chính
            </div>
            <div className="divide-y divide-slate-200">
              <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-500 font-medium w-36 shrink-0">Mã TTHC:</span>
                <span className="font-mono font-bold text-slate-900">{item.code}</span>
              </div>

              <div className="p-3 flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500 font-medium w-36 shrink-0">Tên thủ tục:</span>
                <span className="font-bold text-slate-900 flex-1">{item.title}</span>
              </div>

              <div className="p-3 flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500 font-medium w-36 shrink-0">Lĩnh vực:</span>
                <span className="font-medium text-slate-800">{item.category}</span>
              </div>

              <div className="p-3 flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500 font-medium w-36 shrink-0">Mức độ cung cấp:</span>
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold w-max ${
                  item.level === 'Toàn trình' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  Dịch vụ công {item.level}
                </span>
              </div>

              <div className="p-3 flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500 font-medium w-36 shrink-0">Cơ quan thực hiện:</span>
                <span className="font-medium text-slate-800">Trung tâm Phục vụ hành chính công phường Trà Câu</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-300">
            <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-sm shrink-0">
              <QrCodeImage value={item.url} size={160} />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="font-bold text-slate-900 text-sm">HƯỚNG DẪN QUÉT MÃ QR NỘP HỒ SƠ:</h4>
              <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside text-left">
                <li>Mở ứng dụng <strong>Camera</strong>, <strong>Zalo</strong> hoặc <strong>VNeID</strong>.</li>
                <li>Quét mã QR ở bên cạnh để mở liên kết thủ tục.</li>
                <li>Đăng nhập tài khoản Dịch vụ công Quốc gia/VNeID.</li>
                <li>Điền đầy đủ thông tin hồ sơ và đính kèm tài liệu theo quy định.</li>
              </ol>
            </div>
          </div>

          {/* Direct URL */}
          <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-700 mb-1">Đường dẫn truy cập trực tiếp:</p>
            <p className="font-mono text-blue-700 break-all">{item.url}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
