import React from 'react';
import { ExternalLink, Copy, Check, FileText, Edit, Trash2, Building2 } from 'lucide-react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';
import { HighlightText } from '../utils/searchHelper';

interface TthcGridProps {
  items: TTHCItem[];
  searchQuery?: string;
  onSelectQr: (item: TTHCItem) => void;
  onSelectSlip: (item: TTHCItem) => void;
  copiedUrl: string | null;
  onCopyUrl: (url: string) => void;
  onEditItem?: (item: TTHCItem) => void;
  onDeleteItem?: (item: TTHCItem) => void;
}

export const TthcGrid: React.FC<TthcGridProps> = ({
  items,
  searchQuery = '',
  onSelectQr,
  onSelectSlip,
  copiedUrl,
  onCopyUrl,
  onEditItem,
  onDeleteItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-6 shadow-sm">
        <p className="text-slate-600 font-bold text-base">Không tìm thấy thủ tục hành chính nào phù hợp với điều kiện tìm kiếm.</p>
        <p className="text-slate-400 text-xs mt-1.5">
          Vui lòng thử gõ từ khóa không dấu, đổi phạm vi tìm kiếm hoặc chọn "Đặt lại" để xem toàn bộ danh mục.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {items.map((item) => {
        const isToanTrinh = item.level === 'Toàn trình';
        const agency = item.agency || 'UBND Phường Trà Câu';

        return (
          <div
            key={`${item.stt}-${item.code}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition"
          >
            <div>
              {/* Header Badge & STT */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  STT: #{item.stt} | Mã: <HighlightText text={item.code} query={searchQuery} />
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isToanTrinh
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  <HighlightText text={item.level} query={searchQuery} />
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-3">
                <HighlightText text={item.title} query={searchQuery} />
              </h3>

              {/* Category & Agency */}
              <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium border border-slate-200">
                  <HighlightText text={item.category} query={searchQuery} />
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <HighlightText text={agency} query={searchQuery} />
                </span>
              </div>
            </div>

            {/* Bottom QR & Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => onSelectQr(item)}
                className="shrink-0 p-1 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition group cursor-pointer"
                title="Bấm để phóng to mã QR"
              >
                <QrCodeImage value={item.url} url={item.url} size={48} className="rounded" />
                <span className="text-[9px] text-slate-400 block text-center mt-0.5 group-hover:text-red-700">
                  Phóng to
                </span>
              </button>

              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline flex items-center gap-1 truncate"
                  title={item.url}
                >
                  <span className="truncate">{item.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>

                <div className="flex flex-wrap items-center gap-1">
                  <button
                    onClick={() => onCopyUrl(item.url)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition cursor-pointer"
                    title="Sao chép link"
                  >
                    {copiedUrl === item.url ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onSelectSlip(item)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition cursor-pointer"
                    title="Xem Phiếu hướng dẫn nộp hồ sơ"
                  >
                    Phiếu nộp
                  </button>

                  {onEditItem && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition cursor-pointer"
                      title="Sửa thủ tục này"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600 inline mr-0.5" />
                      Sửa
                    </button>
                  )}

                  {onDeleteItem && (
                    <button
                      onClick={() => onDeleteItem(item)}
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-semibold transition cursor-pointer"
                      title="Xóa thủ tục hành chính này"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600 inline mr-0.5" />
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
