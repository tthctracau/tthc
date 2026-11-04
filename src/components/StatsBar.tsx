import React from 'react';
import { CheckCircle2, AlertCircle, FileText, Filter } from 'lucide-react';

interface StatsBarProps {
  total: number;
  toanTrinhCount: number;
  motPhanCount: number;
  filteredCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  total,
  toanTrinhCount,
  motPhanCount,
  filteredCount,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Tổng thủ tục (TTHC)</p>
          <p className="text-xl font-extrabold text-slate-900">{total} <span className="text-xs font-normal text-slate-500">TTHC</span></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Dịch vụ công Toàn trình</p>
          <p className="text-xl font-extrabold text-emerald-700">{toanTrinhCount} <span className="text-xs font-normal text-slate-500">TTHC</span></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Dịch vụ công Một phần</p>
          <p className="text-xl font-extrabold text-amber-700">{motPhanCount} <span className="text-xs font-normal text-slate-500">TTHC</span></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
          <Filter className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Đang hiển thị</p>
          <p className="text-xl font-extrabold text-blue-700">{filteredCount} <span className="text-xs font-normal text-slate-500">kết quả</span></p>
        </div>
      </div>
    </div>
  );
};
