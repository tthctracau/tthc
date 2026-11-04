import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChart as PieChartIcon, ChevronDown, ChevronUp, Layers, CheckCircle } from 'lucide-react';
import { TTHCItem } from '../types';

interface CategoryPieChartProps {
  items: TTHCItem[];
  totalAllCount: number;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const COLOR_PALETTE = [
  '#dc2626', // red-600
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#db2777', // pink-600
  '#4f46e5', // indigo-600
  '#65a30d', // lime-600
  '#0d9488', // teal-600
  '#9333ea', // purple-600
  '#64748b', // slate-500
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  items,
  totalAllCount,
  selectedCategory,
  onSelectCategory,
}) => {
  // Default to collapsed state as requested by user
  const [isOpen, setIsOpen] = useState(false);

  // Group items by category
  const chartData = useMemo(() => {
    if (!items || items.length === 0) return [];

    const map = new Map<string, number>();
    items.forEach((item) => {
      const cat = (item.category || 'Khác').trim();
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const sorted = Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: ((count / items.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);

    // If more than 10 categories, take top 9 and group the rest into "Lĩnh vực khác"
    if (sorted.length > 10) {
      const top9 = sorted.slice(0, 9);
      const remaining = sorted.slice(9);
      const otherTotal = remaining.reduce((acc, curr) => acc + curr.value, 0);

      if (otherTotal > 0) {
        top9.push({
          name: 'Các lĩnh vực khác',
          value: otherTotal,
          percentage: ((otherTotal / items.length) * 100).toFixed(1),
        });
      }
      return top9;
    }

    return sorted;
  }, [items]);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700 max-w-xs z-50">
          <p className="font-bold text-yellow-300 text-[13px]">{data.name}</p>
          <div className="mt-1 flex items-center justify-between gap-4 text-slate-300">
            <span>Số lượng thủ tục:</span>
            <strong className="text-white text-sm">{data.value} TTHC</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300 mt-0.5">
            <span>Tỷ lệ phân bổ:</span>
            <strong className="text-emerald-400">{data.percentage}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden mb-6 transition-colors">
      {/* Chart Header Bar */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-4 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-slate-800 transition ${
          isOpen ? 'border-b border-slate-100 dark:border-slate-800' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              <span>BIỂU ĐỒ PHÂN BỔ THỦ TỤC HÀNH CHÍNH THEO LĨNH VỰC</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                {items.length} TTHC ({chartData.length} nhóm)
              </span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              {isOpen
                ? 'Quan sát tỷ lệ và cơ cấu giải quyết công việc theo từng lĩnh vực chuyên môn (Cột E)'
                : 'Đang thu gọn • Bấm vào đây để mở rộng xem biểu đồ tỷ lệ theo từng lĩnh vực'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-400">
            {isOpen ? 'Thu gọn' : 'Mở rộng'}
          </span>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            aria-label={isOpen ? 'Thu gọn biểu đồ' : 'Mở rộng biểu đồ'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pie Chart Display (7 cols on large screens) */}
          <div className="lg:col-span-7 h-[300px] sm:h-[340px] w-full flex items-center justify-center">
            {chartData.length === 0 ? (
              <p className="text-slate-400 text-xs">Không có dữ liệu phù hợp để vẽ biểu đồ.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={customTooltip} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
                      if (parseFloat(percentage) < 4) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#ffffff"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-bold text-[10px]"
                        >
                          {percentage}%
                        </text>
                      );
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth={1}
                        className="cursor-pointer transition-opacity hover:opacity-85"
                        onClick={() => {
                          if (entry.name !== 'Các lĩnh vực khác') {
                            onSelectCategory(entry.name);
                          }
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Interactive Legend List (5 cols on large screens) */}
          <div className="lg:col-span-5 space-y-2 max-h-[320px] overflow-y-auto pr-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>Chi tiết số lượng & Tỷ lệ (Nhấn để lọc):</span>
            </p>

            {chartData.map((entry, idx) => {
              const isSelected = selectedCategory === entry.name;
              return (
                <div
                  key={`legend-${idx}`}
                  onClick={() => {
                    if (entry.name !== 'Các lĩnh vực khác') {
                      onSelectCategory(isSelected ? 'Tất cả' : entry.name);
                    }
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer border ${
                    isSelected
                      ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-700 shadow-2xs font-bold text-red-900 dark:text-red-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
                    />
                    <span className="truncate" title={entry.name}>
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {entry.value}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono min-w-[42px] text-right">
                      ({entry.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
