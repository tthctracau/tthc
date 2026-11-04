import React from 'react';
import { Layers, CheckCircle2, Clock, FolderKanban, Building } from 'lucide-react';
import { TTHCItem } from '../types';

interface LookerStudioKPIsProps {
  filteredItems: TTHCItem[];
  totalAllCount: number;
}

export const LookerStudioKPIs: React.FC<LookerStudioKPIsProps> = ({ filteredItems, totalAllCount }) => {
  const currentCount = filteredItems.length;
  const toanTrinhCount = filteredItems.filter((i) => i.level === 'Toàn trình').length;
  const motPhanCount = filteredItems.filter((i) => i.level === 'Một phần').length;

  const toanTrinhPct = currentCount > 0 ? ((toanTrinhCount / currentCount) * 100).toFixed(1) : '0';
  const motPhanPct = currentCount > 0 ? ((motPhanCount / currentCount) * 100).toFixed(1) : '0';

  const uniqueCategories = new Set(filteredItems.map((i) => i.category)).size;
  const uniqueAgencies = new Set(filteredItems.map((i) => i.agency || 'UBND Phường Trà Câu')).size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6 transition-colors font-['Times_New_Roman',serif]">
      {/* KPI 1: Tổng số TTHC (#ff7f7f) */}
      <div
        style={{ backgroundColor: '#ff7f7f' }}
        className="rounded-xl border border-black/15 p-4 shadow-xs hover:shadow-md transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-slate-950 uppercase tracking-wide">TỔNG SỐ TTHC</span>
          <div className="p-1.5 rounded-lg bg-white/70 text-slate-900 border border-black/10 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-950">{currentCount}</span>
          <span className="text-xs text-slate-800 font-bold">/ {totalAllCount} gốc</span>
        </div>
        <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">Thủ tục đang hiển thị</p>
      </div>

      {/* KPI 2: Toàn trình (#ff9999) */}
      <div
        style={{ backgroundColor: '#ff9999' }}
        className="rounded-xl border border-black/15 p-4 shadow-xs hover:shadow-md transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-slate-950 uppercase tracking-wide">DVC TOÀN TRÌNH</span>
          <div className="p-1.5 rounded-lg bg-white/70 text-slate-900 border border-black/10 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-950">{toanTrinhCount}</span>
          <span className="text-xs font-black text-slate-950 bg-white/80 border border-black/15 px-1.5 py-0.5 rounded shadow-2xs">
            {toanTrinhPct}%
          </span>
        </div>
        <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">Trực tuyến 100% quy trình</p>
      </div>

      {/* KPI 3: Một phần (#ffb2b2) */}
      <div
        style={{ backgroundColor: '#ffb2b2' }}
        className="rounded-xl border border-black/15 p-4 shadow-xs hover:shadow-md transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-slate-950 uppercase tracking-wide">DVC MỘT PHẦN</span>
          <div className="p-1.5 rounded-lg bg-white/70 text-slate-900 border border-black/10 shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-950">{motPhanCount}</span>
          <span className="text-xs font-black text-slate-950 bg-white/80 border border-black/15 px-1.5 py-0.5 rounded shadow-2xs">
            {motPhanPct}%
          </span>
        </div>
        <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">Một phần quy trình trực tuyến</p>
      </div>

      {/* KPI 4: Số Lĩnh vực (#ffcccc) */}
      <div
        style={{ backgroundColor: '#ffcccc' }}
        className="rounded-xl border border-black/15 p-4 shadow-xs hover:shadow-md transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-slate-950 uppercase tracking-wide">LĨNH VỰC</span>
          <div className="p-1.5 rounded-lg bg-white/70 text-slate-900 border border-black/10 shadow-2xs">
            <FolderKanban className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-950">{uniqueCategories}</span>
          <span className="text-xs text-slate-800 font-bold">lĩnh vực</span>
        </div>
        <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">Phân loại theo nghiệp vụ</p>
      </div>

      {/* KPI 5: Số Cơ quan (#ffe5e5) */}
      <div
        style={{ backgroundColor: '#ffe5e5' }}
        className="rounded-xl border border-black/15 p-4 shadow-xs hover:shadow-md transition col-span-2 sm:col-span-1"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-slate-950 uppercase tracking-wide">CƠ QUAN BAN HÀNH</span>
          <div className="p-1.5 rounded-lg bg-white/70 text-slate-900 border border-black/10 shadow-2xs">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-950">{uniqueAgencies}</span>
          <span className="text-xs text-slate-800 font-bold">cơ quan</span>
        </div>
        <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">Thẩm quyền tiếp nhận/xử lý</p>
      </div>
    </div>
  );
};
