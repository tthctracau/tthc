import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Building2, Tag, FileText, RotateCcw, Filter, FileDown, History } from 'lucide-react';
import {
  RecentTthcItem,
  getRecentlyViewedItems,
  clearRecentlyViewedItems,
  removeRecentlyViewedItem,
} from '../services/recentViewsManager';

interface LookerStudioFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedAgency: string;
  onAgencyChange: (value: string) => void;
  availableAgencies: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  availableCategories: string[];
  selectedLevel: string;
  onLevelChange: (value: string) => void;
  onResetFilters: () => void;
  onExportPdf?: () => void;
  onSelectRecentProcedure?: (item: RecentTthcItem) => void;
  matchCount: number;
  totalCount: number;
}

export const LookerStudioFilters: React.FC<LookerStudioFiltersProps> = ({
  search,
  onSearchChange,
  selectedAgency,
  onAgencyChange,
  availableAgencies,
  selectedCategory,
  onCategoryChange,
  availableCategories,
  selectedLevel,
  onLevelChange,
  onResetFilters,
  onExportPdf,
  onSelectRecentProcedure,
  matchCount,
  totalCount,
}) => {
  const [recentItems, setRecentItems] = useState<RecentTthcItem[]>(() => getRecentlyViewedItems());

  useEffect(() => {
    const handleUpdate = () => {
      setRecentItems(getRecentlyViewedItems());
    };
    window.addEventListener('recently_viewed_changed', handleUpdate);
    return () => window.removeEventListener('recently_viewed_changed', handleUpdate);
  }, []);

  const SHOW_RECENT_VIEWED = false;

  const isFiltered =
    search.trim() !== '' ||
    selectedAgency !== 'Tất cả' ||
    selectedCategory !== 'Tất cả' ||
    selectedLevel !== 'Tất cả';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600/80 dark:border-emerald-700 shadow-sm overflow-hidden mb-6 transition-colors">
      {/* Looker Studio Control Header with Green (xanh lá/lục) background and high-contrast text */}
      <div className="bg-gradient-to-r from-green-800 via-emerald-700 to-green-800 text-white p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/20 text-white border border-white/30 shadow-xs shrink-0">
            <Filter className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm sm:text-base tracking-wide flex items-center gap-2 drop-shadow-xs uppercase">
              BỘ LỌC DỮ LIỆU BÁO CÁO (Report Controls)
            </h2>
            <p className="text-emerald-100 text-[11px] sm:text-xs font-medium mt-0.5">
              Lọc trực quan theo tên TTHC, cơ quan ban hành, lĩnh vực và mức độ dịch vụ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-xs">
            Khớp: <strong className="text-yellow-300 font-extrabold">{matchCount}</strong> / {totalCount} TTHC
          </span>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-emerald-950 bg-white hover:bg-yellow-300 rounded-lg transition cursor-pointer shadow-xs active:scale-95"
              title="Đặt lại toàn bộ các bộ lọc"
            >
              <RotateCcw className="w-3 h-3 text-emerald-900" />
              <span>Đặt lại</span>
            </button>
          )}

          {/* Button: Xuất Báo Cáo / Niêm Yết PDF */}
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-lg text-xs shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
              title="Xuất Bảng Niêm Yết TTHC (Trang Ngang 3x3) hoặc Báo Cáo PDF theo bộ lọc dữ liệu"
            >
              <FileDown className="w-3.5 h-3.5 text-red-900" />
              <span>Xuất Báo Cáo / Niêm Yết PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Interactive Looker Studio Dropdown / Search Controls */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Tên thủ tục hành chính */}
          <div className="flex flex-col">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Tên thủ tục hành chính:</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Nhập tên hoặc mã TTHC..."
                className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none transition"
              />
              {search && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  title="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* THÀNH PHẦN HIỂN THỊ DANH SÁCH THỦ TỤC HÀNH CHÍNH ĐÃ XEM GẦN ĐÂY (ẨN THEO YÊU CẦU) */}
            {SHOW_RECENT_VIEWED && (
              <div className="mt-2.5 bg-white border border-black rounded-xl p-2.5 shadow-2xs font-['Times_New_Roman',serif] text-black">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black text-[12px]">
                  <span className="font-bold text-black flex items-center gap-1.5 uppercase">
                    <History className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>ĐÃ XEM GẦN ĐÂY ({recentItems.length})</span>
                  </span>
                  {recentItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearRecentlyViewedItems()}
                      className="text-[11px] font-bold text-slate-700 hover:text-red-700 underline transition cursor-pointer"
                      title="Xóa toàn bộ lịch sử đã xem"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {recentItems.length === 0 ? (
                  <p className="text-[12px] text-slate-600 italic py-1 leading-snug">
                    Chưa có thủ tục đã xem. Hãy nhấn vào dòng thủ tục trong bảng để xem chi tiết.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[165px] overflow-y-auto pr-0.5">
                    {recentItems.map((item) => (
                      <div
                        key={item.code}
                        onClick={() => {
                          if (onSelectRecentProcedure) {
                            onSelectRecentProcedure(item);
                          } else {
                            onSearchChange(item.code);
                          }
                        }}
                        className="group flex items-start justify-between gap-1.5 p-1.5 rounded-lg border border-black/30 hover:border-black bg-white hover:bg-yellow-50/70 transition cursor-pointer text-black"
                        title={`Bấm để xem lại chi tiết thủ tục: ${item.title}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-bold px-1.5 py-0.2 rounded border border-black bg-white text-black">
                              {item.code}
                            </span>
                            <span
                              style={{ backgroundColor: item.level === 'Toàn trình' ? '#ffff00' : '#00ff00' }}
                              className="text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-black text-black"
                            >
                              {item.level}
                            </span>
                          </div>
                          <p className="text-[13px] font-bold leading-tight truncate text-black group-hover:underline">
                            {item.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentlyViewedItem(item.code);
                          }}
                          className="p-1 text-slate-400 hover:text-black hover:bg-slate-200 rounded transition cursor-pointer shrink-0"
                          title="Xóa mục này khỏi danh sách đã xem"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Cơ quan ban hành / Giải quyết */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>Cơ quan ban hành:</span>
            </label>
            <div className="relative">
              <select
                value={selectedAgency}
                onChange={(e) => onAgencyChange(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer appearance-none pr-8 transition"
              >
                <option value="Tất cả">Tất cả cơ quan ban hành</option>
                {availableAgencies.map((agency) => (
                  <option key={agency} value={agency} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {agency}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* 3. Lĩnh vực */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
              <span>Lĩnh vực thủ tục:</span>
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer appearance-none pr-8 transition"
              >
                <option value="Tất cả">Tất cả lĩnh vực ({availableCategories.length})</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* 4. Mức độ */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Mức độ dịch vụ công:</span>
            </label>
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => onLevelChange(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer appearance-none pr-8 transition"
              >
                <option value="Tất cả">Tất cả mức độ</option>
                <option value="Toàn trình" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Toàn trình (100% trực tuyến)</option>
                <option value="Một phần" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Một phần (Một phần trực tuyến)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
