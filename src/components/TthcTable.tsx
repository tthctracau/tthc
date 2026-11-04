import React from 'react';
import { ExternalLink, Copy, Check, FileText, Edit, Trash2, Building2 } from 'lucide-react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';
import { HighlightText } from '../utils/searchHelper';

interface TthcTableProps {
  items: TTHCItem[];
  searchQuery?: string;
  onSelectQr: (item: TTHCItem) => void;
  onSelectSlip: (item: TTHCItem) => void;
  copiedUrl: string | null;
  onCopyUrl: (url: string) => void;
  onEditItem: (item: TTHCItem) => void;
  onDeleteItem?: (item: TTHCItem) => void;
}

export const TthcTable: React.FC<TthcTableProps> = ({
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-3 w-14 text-center border-r border-slate-200">STT</th>
              <th className="py-3.5 px-3 w-32 border-r border-slate-200">Mã TTHC</th>
              <th className="py-3.5 px-4 border-r border-slate-200">Tên TTHC & Cơ quan ban hành</th>
              <th className="py-3.5 px-3 w-28 text-center border-r border-slate-200">Mức độ</th>
              <th className="py-3.5 px-3 w-24 text-center border-r border-slate-200">Mã QR</th>
              <th className="py-3.5 px-4 min-w-[320px]">Đường dẫn & Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {items.map((item, index) => {
              const isEven = index % 2 === 0;
              const isToanTrinh = item.level === 'Toàn trình';
              const agency = item.agency || 'UBND Phường Trà Câu';

              return (
                <tr
                  key={`${item.stt}-${item.code}`}
                  className={`hover:bg-red-50/40 transition ${isEven ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-700 border-r border-slate-200">
                    {item.stt}
                  </td>

                  <td className="py-3 px-3 font-mono font-medium text-slate-900 border-r border-slate-200 whitespace-nowrap text-xs">
                    <HighlightText text={item.code} query={searchQuery} />
                  </td>

                  <td className="py-3 px-4 border-r border-slate-200">
                    <div className="font-semibold text-slate-900 leading-snug">
                      <HighlightText text={item.title} query={searchQuery} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium border border-slate-200">
                        <HighlightText text={item.category} query={searchQuery} />
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <HighlightText text={agency} query={searchQuery} />
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center border-r border-slate-200">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isToanTrinh
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <HighlightText text={item.level} query={searchQuery} />
                    </span>
                  </td>

                  <td className="py-2.5 px-2 text-center border-r border-slate-200">
                    <button
                      onClick={() => onSelectQr(item)}
                      className="inline-block p-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition shadow-2xs group cursor-pointer"
                      title="Bấm để phóng to mã QR và tải về"
                    >
                      <QrCodeImage value={item.url} url={item.url} size={48} className="rounded" />
                      <span className="text-[10px] text-slate-500 block group-hover:text-red-700 font-medium mt-0.5">
                        Phóng to
                      </span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-2">
                      {/* Public portal link */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline break-all group"
                      >
                        <span className="line-clamp-1">{item.url}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition" />
                      </a>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onCopyUrl(item.url)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition cursor-pointer ${
                            copiedUrl === item.url
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title="Sao chép liên kết Cổng Dịch vụ công"
                        >
                          {copiedUrl === item.url ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Sao chép link</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onSelectSlip(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200 transition cursor-pointer"
                          title="Xem Phiếu hướng dẫn nộp hồ sơ trực tuyến"
                        >
                          <FileText className="w-3 h-3 text-red-600" />
                          <span>Phiếu nộp hồ sơ</span>
                        </button>

                        <button
                          onClick={() => onEditItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded text-xs font-medium border border-slate-200 transition cursor-pointer"
                          title="Chỉnh sửa thông tin TTHC này"
                        >
                          <Edit className="w-3 h-3 text-blue-600" />
                          <span>Sửa</span>
                        </button>

                        {onDeleteItem && (
                          <button
                            onClick={() => onDeleteItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-semibold border border-red-200 transition cursor-pointer"
                            title="Xóa thủ tục hành chính này"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
