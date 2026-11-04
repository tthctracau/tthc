import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieChartIcon, BarChart3, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { TTHCItem } from '../types';

interface LevelComparisonChartProps {
  allItems: TTHCItem[];
  filteredItems: TTHCItem[];
  selectedCategory: string;
}

export const LevelComparisonChart: React.FC<LevelComparisonChartProps> = ({
  allItems,
  filteredItems,
  selectedCategory,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [dataScope, setDataScope] = useState<'all' | 'filtered'>('all');

  const dataset = dataScope === 'filtered' ? filteredItems : allItems;
  const total = dataset.length;

  const toanTrinhCount = dataset.filter((item) => item.level === 'Toàn trình').length;
  const motPhanCount = dataset.filter((item) => item.level === 'Một phần').length;

  const toanTrinhPercent = total > 0 ? ((toanTrinhCount / total) * 100).toFixed(1) : '0';
  const motPhanPercent = total > 0 ? ((motPhanCount / total) * 100).toFixed(1) : '0';

  const chartData = [
    {
      name: 'Dịch vụ công Toàn trình',
      shortName: 'Toàn trình',
      value: toanTrinhCount,
      percentage: toanTrinhPercent,
      color: '#047857', // Emerald 700
      bg: '#ecfdf5',
    },
    {
      name: 'Dịch vụ công Một phần',
      shortName: 'Một phần',
      value: motPhanCount,
      percentage: motPhanPercent,
      color: '#b45309', // Amber 700
      bg: '#fffbeb',
    },
  ];

  // Category breakdown top 5 for bar chart or supplementary info
  const categoryBreakdown = React.useMemo(() => {
    const cats: Record<string, { toanTrinh: number; motPhan: number; total: number }> = {};
    dataset.forEach((item) => {
      if (!cats[item.category]) {
        cats[item.category] = { toanTrinh: 0, motPhan: 0, total: 0 };
      }
      cats[item.category].total += 1;
      if (item.level === 'Toàn trình') {
        cats[item.category].toanTrinh += 1;
      } else {
        cats[item.category].motPhan += 1;
      }
    });

    return Object.entries(cats)
      .map(([name, counts]) => ({
        category: name,
        'Toàn trình': counts.toanTrinh,
        'Một phần': counts.motPhan,
        total: counts.total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [dataset]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-red-700" />
            <span>Biểu đồ So sánh Dịch vụ công Toàn trình vs Một phần</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tỷ lệ & số lượng thủ tục hành chính trực tuyến thuộc thẩm quyền giải quyết của UBND Phường Trà Câu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Selector (Only show if category filtered) */}
          {selectedCategory !== 'Tất cả' && (
            <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-semibold">
              <button
                onClick={() => setDataScope('all')}
                className={`px-2.5 py-1 rounded-md transition ${
                  dataScope === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({allItems.length})
              </button>
              <button
                onClick={() => setDataScope('filtered')}
                className={`px-2.5 py-1 rounded-md transition ${
                  dataScope === 'filtered'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {selectedCategory} ({filteredItems.length})
              </button>
            </div>
          )}

          {/* Chart Type Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => setChartType('donut')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                chartType === 'donut'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Biểu đồ Tròn</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                chartType === 'bar'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biểu đồ Cột</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5">
        {/* Visual Chart Area */}
        <div className="lg:col-span-7 h-64 sm:h-72 w-full flex items-center justify-center">
          {total === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-60" />
               Không có dữ liệu để hiển thị biểu đồ
            </div>
          ) : chartType === 'donut' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percentage, value }) => `${value} TTHC (${percentage}%)`}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} TTHC (${((value / total) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-slate-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="shortName" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} TTHC`, 'Số lượng']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={55}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Breakdown Stats & Legend Details */}
        <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Chi tiết phân bổ {dataScope === 'filtered' && selectedCategory !== 'Tất cả' ? `(${selectedCategory})` : '(Toàn xã)'}
          </div>

          {/* Card: Toan Trinh */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">Dịch vụ công Toàn trình</p>
                <p className="text-xs text-emerald-700 mt-0.5">Xử lý trực tuyến 100% từ nộp hồ sơ đến nhận kết quả</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-800">{toanTrinhCount}</span>
              <span className="text-xs font-medium text-emerald-700 block">{toanTrinhPercent}%</span>
            </div>
          </div>

          {/* Card: Mot Phan */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Dịch vụ công Một phần</p>
                <p className="text-xs text-amber-700 mt-0.5">Thực hiện trực tuyến một số công đoạn trong quy trình</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-800">{motPhanCount}</span>
              <span className="text-xs font-medium text-amber-700 block">{motPhanPercent}%</span>
            </div>
          </div>

          {/* Progress comparison bar */}
          <div className="mt-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Tỷ lệ bao phủ Toàn trình</span>
              <span className="text-emerald-700 font-bold">{toanTrinhPercent}%</span>
            </div>
            <div className="w-full bg-amber-200 h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${toanTrinhPercent}%` }}
                title={`Toàn trình: ${toanTrinhPercent}%`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${motPhanPercent}%` }}
                title={`Một phần: ${motPhanPercent}%`}
              />
            </div>
          </div>

          {/* Top Categories summary if available */}
          {categoryBreakdown.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Lĩnh vực có nhiều TTHC nhất: </span>
              {categoryBreakdown.slice(0, 3).map((cat, idx) => (
                <span key={cat.category} className="inline-block mr-2 mt-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                  {cat.category}: <strong>{cat.total}</strong> ({cat['Toàn trình']} TT / {cat['Một phần']} MP)
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
