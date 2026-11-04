import React from 'react';
import {
  Search,
  X,
  LayoutGrid,
  Table,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  PieChart,
  Building2,
  Tag,
} from 'lucide-react';
import { CATEGORIES } from '../data/tthcData';

interface FilterControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  selectedAgency: string;
  onAgencyChange: (agency: string) => void;
  availableAgencies: string[];
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onReset: () => void;
  onOpenAddModal: () => void;
  isModified?: boolean;
  onResetToDefault?: () => void;
  showChart?: boolean;
  onToggleChart?: () => void;
  matchCount?: number;
  totalCount?: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  selectedAgency,
  onAgencyChange,
  availableAgencies,
  viewMode,
  onViewModeChange,
  onReset,
  onOpenAddModal,
  isModified,
  onResetToDefault,
  showChart,
  onToggleChart,
  matchCount,
  totalCount,
}) => {
  const isFiltered =
    search !== '' ||
    selectedCategory !== 'Tất cả' ||
    selectedLevel !== 'Tất cả' ||
    selectedAgency !== 'Tất cả';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6 space-y-4">
      {/* Universal Search Bar & Actions */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Main Single Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm thủ tục hành chính, mã TTHC, cơ quan ban hành, lĩnh vực, mức độ..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
          />

          {/* Clear Button & Match indicator */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition"
                title="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {matchCount !== undefined && totalCount !== undefined && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                {matchCount}/{totalCount}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add New TTHC Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 active:scale-95 cursor-pointer"
            title="Thêm mới thủ tục hành chính vào danh mục"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm TTHC</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-red-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-red-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới</span>
            </button>
          </div>

          {/* Toggle Chart Button */}
          {onToggleChart && (
            <button
              onClick={onToggleChart}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                showChart
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title={showChart ? 'Ẩn biểu đồ so sánh' : 'Hiển thị biểu đồ so sánh'}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showChart ? 'Ẩn biểu đồ' : 'Biểu đồ'}</span>
            </button>
          )}

          {/* Reset Filters / Clear Search */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              title="Xóa tìm kiếm và đặt lại toàn bộ tiêu chí lọc"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}

          {/* Restore Original Data if modified */}
          {isModified && onResetToDefault && (
            <button
              onClick={onResetToDefault}
              className="flex items-center gap-1 px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              title="Khôi phục danh mục gốc ban đầu"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Khôi phục gốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors (Cơ quan ban hành, Mức độ, Lĩnh vực) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Filter by Agency (Cơ quan ban hành / Giải quyết) */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Cơ quan ban hành / Thẩm quyền:</span>
          </label>
          <select
            value={selectedAgency}
            onChange={(e) => onAgencyChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="Tất cả">Tất cả cơ quan</option>
            {availableAgencies.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Service Level (Mức độ DVC) */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Mức độ dịch vụ công:</span>
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="Tất cả">Tất cả mức độ</option>
            <option value="Toàn trình">Toàn trình (Toàn bộ quy trình trực tuyến)</option>
            <option value="Một phần">Một phần (Một phần quy trình trực tuyến)</option>
          </select>
        </div>

        {/* Filter by Category (Lĩnh vực) */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Lĩnh vực thủ tục:</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="Tất cả">Tất cả lĩnh vực</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filter Pills for Quick Access */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategoryChange('Tất cả')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              selectedCategory === 'Tất cả'
                ? 'bg-red-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả lĩnh vực
          </button>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-red-700 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
