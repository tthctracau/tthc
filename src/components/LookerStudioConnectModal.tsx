import React from 'react';
import { X, ExternalLink, BarChart3, Database, ShieldCheck, Check, Copy } from 'lucide-react';
import { SPREADSHEET_URL, SPREADSHEET_ID, SHEET_NAME_TARGET } from '../services/googleSheetsService';

interface LookerStudioConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LookerStudioConnectModal: React.FC<LookerStudioConnectModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const lookerStudioCreateUrl = `https://lookerstudio.google.com/datasources/create?connectorId=google-sheets`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(SPREADSHEET_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-yellow-400 text-red-950 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Kết nối Google Looker Studio</h3>
              <p className="text-red-200 text-xs">Trực quan hóa và báo cáo BI chuyên nghiệp</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
            <div className="flex items-center gap-2 font-bold text-red-900 dark:text-red-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-red-700 dark:text-red-400" />
              <span>Bảo mật & Chính xác tuyệt đối:</span>
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              Hệ thống chỉ sử dụng duy nhất nguồn dữ liệu do bạn cung cấp tại trang tính <strong>"{SHEET_NAME_TARGET}"</strong> và không lấy bất kỳ thông tin nào từ bên ngoài.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">1. Địa chỉ Google Sheet nguồn:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={SPREADSHEET_URL}
                className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-mono text-[11px] select-all truncate"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg flex items-center gap-1 shrink-0 transition cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">2. Các trường dữ liệu trong báo cáo:</label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="font-bold text-slate-900 dark:text-slate-100">Tên TTHC:</span> Tên thủ tục hành chính
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="font-bold text-slate-900 dark:text-slate-100">Cơ quan ban hành:</span> Thẩm quyền giải quyết
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="font-bold text-slate-900 dark:text-slate-100">Lĩnh vực:</span> Nhóm ngành nghiệp vụ
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="font-bold text-slate-900 dark:text-slate-100">Mức độ:</span> Toàn trình / Một phần
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block font-bold text-slate-800 dark:text-slate-200">3. Mở tạo Báo cáo trên Looker Studio chính thức:</label>
            <p className="text-slate-500 dark:text-slate-400">
              Nhấn nút dưới đây để chuyển hướng tới Google Looker Studio, chọn đầu nối <strong>Google Sheets</strong> và dán URL trang tính trên.
            </p>
            <a
              href={lookerStudioCreateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-sm transition active:scale-95 text-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở Google Looker Studio với nguồn này</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
