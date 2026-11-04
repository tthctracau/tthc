import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { TTHCItem } from '../types';

interface LookerStudioChartsProps {
  items: TTHCItem[];
}

export const LookerStudioCharts: React.FC<LookerStudioChartsProps> = ({ items }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'level' | 'agency'>('category');

  // Breakdown by Category
  const categoryData = useMemo(() => {
    const map: Record<string, { toanTrinh: number; motPhan: number; total: number }> = {};
    items.forEach((item) => {
      const cat = item.category || 'Khác';
      if (!map[cat]) {
        map[cat] = { toanTrinh: 0, motPhan: 0, total: 0 };
      }
      map[cat].total += 1;
      if (item.level === 'Toàn trình') {
        map[cat].toanTrinh += 1;
      } else {
        map[cat].motPhan += 1;
      }
    });

    return Object.entries(map)
      .map(([name, counts]) => ({
        name,
        'Toàn trình': counts.toanTrinh,
        'Một phần': counts.motPhan,
        'Tổng số': counts.total,
      }))
      .sort((a, b) => b['Tổng số'] - a['Tổng số']);
  }, [items]);

  // Breakdown by Level
  const levelData = useMemo(() => {
    const toanTrinh = items.filter((i) => i.level === 'Toàn trình').length;
    const motPhan = items.filter((i) => i.level === 'Một phần').length;
    const total = items.length || 1;

    return [
      {
        name: 'Toàn trình (100% trực tuyến)',
        shortName: 'Toàn trình',
        value: toanTrinh,
        percentage: ((toanTrinh / total) * 100).toFixed(1),
        color: '#059669', // Emerald 600
      },
      {
        name: 'Một phần (Một phần trực tuyến)',
        shortName: 'Một phần',
        value: motPhan,
        percentage: ((motPhan / total) * 100).toFixed(1),
        color: '#d97706', // Amber 600
      },
    ];
  }, [items]);

  // Breakdown by Agency
  const agencyData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      const ag = item.agency || 'UBND Phường Trà Câu';
      map[ag] = (map[ag] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        'Số lượng': count,
      }))
      .sort((a, b) => b['Số lượng'] - a['Số lượng'])
      .slice(0, 8);
  }, [items]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6">
      {/* Chart Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-50 text-red-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Trực quan hóa Dữ liệu Báo cáo (Looker Visualizations)</h3>
            <p className="text-slate-500 text-[11px]">
              Biểu đồ phân tích động cập nhật theo các bộ lọc đã chọn
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'category' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Lĩnh vực
          </button>
          <button
            onClick={() => setActiveTab('level')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'level' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cơ cấu Mức độ
          </button>
          <button
            onClick={() => setActiveTab('agency')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'agency' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Cơ quan
          </button>
        </div>
      </div>

      {/* Visual Chart Area */}
      <div className="pt-4">
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Không có dữ liệu phù hợp với bộ lọc hiện tại để vẽ biểu đồ.
          </div>
        ) : activeTab === 'category' ? (
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-red-700" />
              <span>Số lượng Thủ tục hành chính phân bổ theo từng Lĩnh vực (Toàn trình vs Một phần)</span>
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      fontWeight: 500,
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Bar dataKey="Toàn trình" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Một phần" stackId="a" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : activeTab === 'level' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ shortName, percentage, value }) => `${shortName}: ${value} (${percentage}%)`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} TTHC`, name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-5 space-y-3">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">DVC Toàn trình</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-md">
                    {levelData[0].percentage}%
                  </span>
                </div>
                <p className="text-2xl font-black text-emerald-900 mt-1">{levelData[0].value} TTHC</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Tiếp nhận hồ sơ & trả kết quả 100% qua môi trường mạng</p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">DVC Một phần</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-600 text-white rounded-md">
                    {levelData[1].percentage}%
                  </span>
                </div>
                <p className="text-2xl font-black text-amber-900 mt-1">{levelData[1].value} TTHC</p>
                <p className="text-[11px] text-amber-700 mt-0.5">Một phần quy trình nộp hồ sơ hoặc nhận kết quả trực tuyến</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
              <span>Phân bố TTHC theo Cơ quan ban hành / Thẩm quyền tiếp nhận giải quyết</span>
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agencyData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 500 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Số lượng" fill="#1d4ed8" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
