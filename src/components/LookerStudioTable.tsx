import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Table as TableIcon,
  LayoutGrid,
  QrCode,
  Maximize2,
  Copy,
  Check,
  Building2,
  Tag,
  FileDown,
  Grid3x3,
  FileText,
} from 'lucide-react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';
import { QrModal } from './QrModal';
import { AutoQrAssignModal } from './AutoQrAssignModal';
import { TthcDetailModal } from './TthcDetailModal';
import { saveCustomUrlOverride } from '../services/qrLinkManager';
import { addRecentlyViewedItem } from '../services/recentViewsManager';

interface LookerStudioTableProps {
  items: TTHCItem[];
  searchQuery: string;
  totalAllCount?: number;
  allItems?: TTHCItem[];
  onItemsUpdated?: (updatedList: TTHCItem[], message: string) => void;
  onExportPdf?: () => void;
  activeFilterInfo?: {
    search?: string;
    agency?: string;
    category?: string;
    level?: string;
  };
  externalSelectedItem?: TTHCItem | null;
  onClearExternalSelectedItem?: () => void;
}

export const LookerStudioTable: React.FC<LookerStudioTableProps> = ({
  items,
  searchQuery,
  totalAllCount,
  allItems,
  onItemsUpdated,
  onExportPdf,
  activeFilterInfo,
  externalSelectedItem,
  onClearExternalSelectedItem,
}) => {
  // Bật Bảng niêm yết (Trang ngang 3x3)
  const ENABLE_NOTICE_BOARD = true;

  // Tab state: 'table' (Dạng Bảng) hoặc 'grid' (Dạng Lưới)
  const [activeViewTab, setActiveViewTab] = useState<'table' | 'grid' | 'notice-board'>('table');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [sortField, setSortField] = useState<'stt' | 'code' | 'title' | 'level' | 'category'>('stt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal QR state
  const [selectedQrItem, setSelectedQrItem] = useState<TTHCItem | null>(null);
  // Modal Chi tiết TTHC: thành phần hồ sơ, thời hạn giải quyết, phí lệ phí
  const [selectedDetailItem, setSelectedDetailItem] = useState<TTHCItem | null>(null);

  // Sync external selected item from "Recently viewed" click
  React.useEffect(() => {
    if (externalSelectedItem) {
      setSelectedDetailItem(externalSelectedItem);
      addRecentlyViewedItem(externalSelectedItem);
    }
  }, [externalSelectedItem]);

  const handleOpenDetailModal = (item: TTHCItem) => {
    setSelectedDetailItem(item);
    addRecentlyViewedItem(item);
  };
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isAutoQrModalOpen, setIsAutoQrModalOpen] = useState<boolean>(false);
  const [targetItemForQrAssign, setTargetItemForQrAssign] = useState<TTHCItem | null>(null);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleUpdateItemUrl = (itemCode: string, newUrl: string) => {
    saveCustomUrlOverride(itemCode, newUrl);
    const sourceList = allItems || items;
    const updated = sourceList.map((i) => (i.code === itemCode ? { ...i, url: newUrl } : i));
    if (onItemsUpdated) {
      onItemsUpdated(updated, `Đã cập nhật đường link và tạo lại mã QR cho thủ tục "${itemCode}"`);
    }
  };

  // Sort items
  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'stt') {
        cmp = a.stt - b.stt;
      } else if (sortField === 'code') {
        cmp = a.code.localeCompare(b.code);
      } else if (sortField === 'title') {
        cmp = a.title.localeCompare(b.title, 'vi');
      } else if (sortField === 'level') {
        cmp = a.level.localeCompare(b.level, 'vi');
      } else if (sortField === 'category') {
        cmp = a.category.localeCompare(b.category, 'vi');
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [items, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const handleSort = (field: 'stt' | 'code' | 'title' | 'level' | 'category') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#33cccc]/80 dark:border-[#33cccc]/60 shadow-sm overflow-hidden mb-6 transition-colors">
      {/* 02 Tabs & Controls Header with #33cccc background */}
      <div
        style={{ backgroundColor: '#33cccc' }}
        className="p-4 border-b border-[#29a8a8] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs font-['Times_New_Roman',serif]"
      >
        <div>
          <h3 className="font-extrabold text-slate-950 text-sm sm:text-base flex items-center gap-2 uppercase tracking-wide">
            <span>BẢNG CHI TIẾT THỦ TỤC HÀNH CHÍNH</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/95 text-slate-950 border border-black/15 shadow-2xs">
              {items.length} thủ tục
            </span>
          </h3>
          <p className="text-slate-900 text-[11px] sm:text-xs mt-0.5 font-medium">
            💡 <strong>Mẹo:</strong> Nhấn vào bất kỳ dòng nào để xem chi tiết <strong>Thành phần hồ sơ</strong>, <strong>Thời hạn giải quyết</strong>, <strong>Phí lệ phí</strong> và hướng dẫn nộp.
          </p>
        </div>

        {/* 02 Tabs Switcher & Page size */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Tab Switcher: Bảng, Lưới, Bảng Niêm yết (3x3) */}
          <div className="flex bg-white/85 p-0.5 rounded-xl border border-black/15 shrink-0 text-xs shadow-2xs">
            <button
              onClick={() => {
                setActiveViewTab('table');
                if (pageSize === 9) setPageSize(15);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeViewTab === 'table'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-800 hover:text-black hover:bg-white/60'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Dạng Bảng</span>
            </button>
            <button
              onClick={() => {
                setActiveViewTab('grid');
                if (pageSize === 9) setPageSize(15);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeViewTab === 'grid'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-800 hover:text-black hover:bg-white/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dạng Lưới</span>
            </button>
            {ENABLE_NOTICE_BOARD && (
              <button
                onClick={() => {
                  setActiveViewTab('notice-board');
                  setPageSize(9);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeViewTab === 'notice-board'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-800 hover:text-black hover:bg-white/60'
                }`}
                title="Bảng niêm yết TTHC dạng trang ngang 3 cột x 3 dòng"
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                <span>Bảng Niêm yết (3x3)</span>
              </button>
            )}
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-950 font-bold">
            <span className="hidden sm:inline">Mỗi trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2.5 bg-white border border-black/20 text-slate-950 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer shadow-2xs"
            >
              {activeViewTab === 'notice-board' ? (
                <>
                  <option value={9}>9 mục (1 trang 3x3)</option>
                  <option value={18}>18 mục (2 trang 3x3)</option>
                  <option value={27}>27 mục (3 trang 3x3)</option>
                  <option value={45}>45 mục (5 trang 3x3)</option>
                </>
              ) : (
                <>
                  <option value={15}>15 mục</option>
                  <option value={25}>25 mục</option>
                  <option value={50}>50 mục</option>
                  <option value={100}>100 mục</option>
                </>
              )}
            </select>
          </div>

          {/* PDF Export Button */}
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold rounded-lg text-xs shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
              title="Xuất danh mục thủ tục hành chính đang lọc ra file PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-yellow-300" />
              <span>Xuất Báo cáo PDF ({items.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: HIỂN THỊ DẠNG BẢNG ================= */}
      {activeViewTab === 'table' && (
        <div className="overflow-x-auto bg-white font-['Times_New_Roman',serif]">
          <table className="w-full text-left text-[14px] border-collapse border border-black bg-white text-black font-['Times_New_Roman',serif]">
            <thead>
              <tr className="bg-white text-black font-bold uppercase text-[14px] border-b border-black">
                {/* 1. STT */}
                <th
                  onClick={() => handleSort('stt')}
                  className="py-3 px-3 text-center w-14 cursor-pointer hover:bg-slate-100 transition border border-black text-black font-bold text-[14px]"
                  title="Nhấn để sắp xếp theo STT"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>STT</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-black" />
                  </div>
                </th>

                {/* 2. Mã TTHC */}
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-3.5 w-32 cursor-pointer hover:bg-slate-100 transition border border-black text-black font-bold text-[14px] text-center"
                  title="Nhấn để sắp xếp theo Mã TTHC"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>MÃ TTHC</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-black" />
                  </div>
                </th>

                {/* 3. Tên thủ tục hành chính */}
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 min-w-[280px] cursor-pointer hover:bg-slate-100 transition border border-black text-black font-bold text-[14px]"
                  title="Nhấn để sắp xếp theo tên"
                >
                  <div className="flex items-center gap-1">
                    <span>TÊN THỦ TỤC HÀNH CHÍNH</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-black" />
                  </div>
                </th>

                {/* 4. Mức độ */}
                <th
                  onClick={() => handleSort('level')}
                  className="py-3 px-3.5 w-32 text-center cursor-pointer hover:bg-slate-100 transition border border-black text-black font-bold text-[14px]"
                  title="Nhấn để sắp xếp theo mức độ"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>MỨC ĐỘ</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-black" />
                  </div>
                </th>

                {/* 5. Mã QR (màu trắng #ffffff) */}
                <th
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-3 px-3 w-28 text-center border border-black bg-white text-black font-bold text-[14px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-black" />
                    <span>MÃ QR</span>
                  </div>
                </th>

                {/* 6. Cổng dịch vụ công (màu trắng #ffffff) */}
                <th
                  style={{ backgroundColor: '#ffffff' }}
                  className="py-3 px-4 w-36 text-center border border-black bg-white text-black font-bold text-[14px]"
                >
                  <span>CỔNG DVC</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white text-black font-['Times_New_Roman',serif] text-[14px]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-black text-[14px] border border-black bg-white">
                    Không tìm thấy thủ tục hành chính nào khớp với các bộ lọc đã chọn.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const rowNum = (currentPage - 1) * pageSize + index + 1;
                  const isToanTrinh = item.level === 'Toàn trình';
                  return (
                    <tr
                      key={`${item.stt}-${item.code}`}
                      onClick={() => handleOpenDetailModal(item)}
                      title="Nhấn vào dòng để xem chi tiết: Thành phần hồ sơ, Thời hạn giải quyết, Phí lệ phí"
                      className="bg-white hover:bg-slate-50 transition border-b border-black cursor-pointer text-black"
                    >
                      {/* 1. STT */}
                      <td className="py-3 px-3 text-center font-bold text-[14px] text-black border border-black bg-white">
                        {rowNum}
                      </td>

                      {/* 2. Mã TTHC */}
                      <td className="py-3 px-3.5 whitespace-nowrap border border-black text-center text-black font-bold text-[14px] bg-white">
                        {item.code}
                      </td>

                      {/* 3. Tên thủ tục hành chính */}
                      <td className="py-3 px-4 border border-black text-black bg-white">
                        <div className="space-y-1">
                          {item.url ? (
                            <div className="flex items-start justify-between gap-2">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="group/title inline-flex items-start gap-1.5 font-bold text-[14px] leading-snug hover:underline cursor-pointer transition text-left text-black"
                                title="Bấm vào tên để chuyển đến Cổng Dịch vụ công giải quyết thủ tục này"
                              >
                                <span>{item.title}</span>
                                <ExternalLink
                                  className="w-3.5 h-3.5 shrink-0 mt-0.5 text-black opacity-80 group-hover/title:opacity-100 transition-opacity"
                                />
                              </a>
                            </div>
                          ) : (
                            <p className="font-bold text-[14px] leading-snug text-black">
                              {item.title}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-[14px] font-normal text-black">
                            <span className="flex items-center gap-1 truncate max-w-xs text-black">
                              <Building2 className="w-3.5 h-3.5 shrink-0 text-black" />
                              <span className="truncate">{item.agency}</span>
                            </span>
                            <span className="text-black">•</span>
                            <span className="flex items-center gap-1 truncate max-w-xs text-black">
                              <Tag className="w-3.5 h-3.5 shrink-0 text-black" />
                              <span className="truncate">{item.category}</span>
                            </span>
                            <span className="text-black">•</span>
                            <span className="inline-flex items-center gap-1 font-bold text-black hover:underline">
                              <FileText className="w-3.5 h-3.5 shrink-0 text-black" />
                              <span>Bấm xem hồ sơ & thời hạn</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Mức độ: "Toàn trình"=#ffff00, "Một phần"=#00ff00 */}
                      <td className="py-3 px-3.5 text-center border border-black bg-white">
                        <span
                          style={{ backgroundColor: isToanTrinh ? '#ffff00' : '#00ff00' }}
                          className="inline-block px-3 py-1 rounded-full text-[14px] font-bold border border-black text-black whitespace-nowrap shadow-2xs"
                        >
                          {item.level}
                        </span>
                      </td>

                      {/* 5. Mã QR: "Mã QR"=#ffcc99 */}
                      <td className="py-2 px-3 text-center border border-black bg-white">
                        <div className="flex flex-col items-center gap-1">
                          {item.url ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQrItem(item);
                              }}
                              style={{ backgroundColor: '#ffcc99' }}
                              className="inline-flex flex-col items-center justify-center p-1.5 border border-black rounded-lg hover:shadow-md transition cursor-pointer group/qr shadow-2xs"
                              title="Bấm vào để phóng to mã QR quét trên điện thoại"
                            >
                              <div className="bg-white p-0.5 rounded border border-black/20">
                                <QrCodeImage url={item.url} size={48} />
                              </div>
                              <span className="text-[12px] font-bold mt-1 flex items-center gap-0.5 text-black">
                                <Maximize2 className="w-2.5 h-2.5 text-black" /> Phóng to
                              </span>
                            </div>
                          ) : (
                            <span className="text-black text-[14px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Cổng dịch vụ công: "Cổng DVC"=#99ffcc */}
                      <td className="py-3 px-4 text-center border border-black bg-white">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ backgroundColor: '#99ffcc' }}
                            className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-black hover:opacity-90 font-bold rounded-lg text-[14px] border border-black shadow-2xs transition active:scale-95 whitespace-nowrap cursor-pointer"
                            title="Truy cập Cổng dịch vụ công để nộp hồ sơ trực tuyến"
                          >
                            <span>Cổng DVC</span>
                            <ExternalLink className="w-3.5 h-3.5 text-black" />
                          </a>
                        ) : (
                          <span className="text-black text-[14px]">Chưa có link</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 2: HIỂN THỊ DẠNG LƯỚI ================= */}
      {activeViewTab === 'grid' && (
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
          {paginatedItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Không tìm thấy thủ tục hành chính nào khớp với các bộ lọc đã chọn.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((item, index) => {
                const rowNum = (currentPage - 1) * pageSize + index + 1;
                const isToanTrinh = item.level === 'Toàn trình';

                return (
                  <div
                    key={`grid-${item.stt}-${item.code}`}
                    onClick={() => handleOpenDetailModal(item)}
                    title="Nhấn để xem chi tiết: Thành phần hồ sơ, Thời hạn giải quyết, Phí lệ phí"
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md hover:border-red-300 dark:hover:border-red-700 transition flex flex-col justify-between cursor-pointer group"
                  >
                    {/* Card Top: 1. STT, 2. Mã TTHC, 4. Mức độ */}
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                        {/* 1. STT */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
                          STT: #{rowNum}
                        </span>

                        {/* 2. Mã TTHC */}
                        <span className="font-mono text-[11px] font-bold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900/60 px-2 py-0.5 rounded truncate" title={`Mã TTHC: ${item.code}`}>
                          Mã: {item.code}
                        </span>

                        {/* 4. Mức độ: "Toàn trình"=#ffff00, "Một phần"=#00ff00 */}
                        <span
                          style={{ backgroundColor: isToanTrinh ? '#ffff00' : '#00ff00' }}
                          className="px-2.5 py-0.5 rounded-full text-[12px] font-bold border border-black text-black shrink-0 shadow-2xs"
                        >
                          {item.level}
                        </span>
                      </div>

                      {/* 3. Tên thủ tục hành chính */}
                      {item.url ? (
                        <h4 className="mb-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="group/gridtitle inline-flex items-start gap-1 font-bold text-black text-sm leading-snug line-clamp-3 hover:underline cursor-pointer transition text-left"
                            title="Bấm vào tên để chuyển đến Cổng Dịch vụ công giải quyết thủ tục này"
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-black shrink-0 mt-0.5 opacity-60 group-hover/gridtitle:opacity-100 transition-opacity" />
                          </a>
                        </h4>
                      ) : (
                        <h4 className="font-bold text-black text-sm leading-snug line-clamp-3 mb-2">
                          {item.title}
                        </h4>
                      )}

                      {/* Detail hint button */}
                      <div className="mb-2.5">
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-black bg-white px-2 py-0.5 rounded border border-black">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Chi tiết hồ sơ, thời hạn & lệ phí</span>
                        </span>
                      </div>

                      {/* Metadata tags: Cơ quan ban hành & Lĩnh vực */}
                      <div className="space-y-1 text-[12px] text-black mb-3">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-black shrink-0" />
                          <span className="truncate">{item.agency}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Tag className="w-3.5 h-3.5 text-black shrink-0" />
                          <span className="truncate">{item.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: 5. Mã QR & 6. Cổng dịch vụ công */}
                    <div className="pt-3 border-t border-black mt-2 flex items-center justify-between gap-3">
                      {/* 5. Mã QR: "Mã QR"=#ffcc99 */}
                      {item.url ? (
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQrItem(item);
                            }}
                            style={{ backgroundColor: '#ffcc99' }}
                            className="flex items-center gap-2 p-1.5 border border-black rounded-lg cursor-pointer transition shrink-0 group/qr shadow-2xs hover:shadow-md"
                            title="Bấm vào để phóng to mã QR quét trên điện thoại hoặc sửa link"
                          >
                            <div className="bg-white p-0.5 rounded border border-black/20">
                              <QrCodeImage url={item.url} size={48} />
                            </div>
                            <div className="text-left pr-1">
                              <span className="text-[11px] font-bold text-black block">
                                MÃ QR
                              </span>
                              <span className="text-[10px] text-black font-semibold flex items-center gap-0.5">
                                <Maximize2 className="w-2.5 h-2.5" /> Phóng to
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-black text-xs">Không có QR</div>
                      )}

                      {/* 6. Cổng dịch vụ công: "Cổng DVC"=#99ffcc */}
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ backgroundColor: '#99ffcc' }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-black hover:opacity-90 font-bold rounded-lg text-[13px] border border-black shadow-2xs transition active:scale-95 text-center"
                          title="Nộp hồ sơ trực tuyến qua Cổng DVC"
                        >
                          <span>Cổng DVC</span>
                          <ExternalLink className="w-3.5 h-3.5 text-black shrink-0" />
                        </a>
                      ) : (
                        <span className="text-black text-xs">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: BẢNG NIÊM YẾT TTHC TRANG NGANG (3 CỘT X 3 DÒNG) ================= */}
      {ENABLE_NOTICE_BOARD && activeViewTab === 'notice-board' && (
        <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-950/40">
          {/* Header banner of notice board */}
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-center md:text-left">
              <span className="text-[11px] font-bold text-yellow-300 tracking-wider uppercase">
                UBND PHƯỜNG TRÀ CÂU  • TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG
              </span>
              <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-white mt-0.5">
                DANH MỤC THỦ TỤC HÀNH CHÍNH THUỘC PHẨM QUYỀN GIẢI QUYẾT CỦA UBND PHƯỜNG TRÀ CÂU
              </h4>
              <p className="text-xs text-red-100 mt-1">
                Dữ liệu lọc theo "Bộ lọc dữ liệu báo cáo" ({items.length} thủ tục) • Định dạng chuẩn 3 cột x 3 dòng (9 ô/trang) • Quét mã QR
              </p>
            </div>

            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black rounded-xl text-xs shadow-md transition active:scale-95 shrink-0 cursor-pointer"
                title="In hoặc xuất bảng niêm yết dạng PDF 3 cột x 3 dòng"
              >
                <FileDown className="w-4 h-4 text-red-900" />
                <span>In / Xuất Bảng Niêm Yết PDF</span>
              </button>
            )}
          </div>

          {paginatedItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Không tìm thấy thủ tục hành chính nào khớp với các bộ lọc đã chọn.
            </div>
          ) : (
            /* 3 Columns x 3 Rows Landscape Notice Board Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((item, index) => {
                const rowNum = (currentPage - 1) * pageSize + index + 1;
                const isToanTrinh = item.level === 'Toàn trình';

                return (
                  <div
                    key={`notice-${item.stt}-${item.code}`}
                    onClick={() => handleOpenDetailModal(item)}
                    title="Nhấn để xem chi tiết: Thành phần hồ sơ, Thời hạn giải quyết, Phí lệ phí"
                    className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-red-600 dark:hover:border-red-500 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Top Bar: Mã TTHC & STT */}
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                        <span
                          className="font-mono text-xs font-bold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900/60 px-2 py-0.5 rounded truncate"
                          title={`Mã TTHC: ${item.code}`}
                        >
                          Mã: {item.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          #{rowNum}
                        </span>
                      </div>

                      {/* Tên TTHC */}
                      {item.url ? (
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-snug line-clamp-3 mb-2 hover:text-red-700 dark:hover:text-red-400">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-start gap-1"
                            title="Nhấn để mở Cổng DVC giải quyết thủ tục này"
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5 opacity-60" />
                          </a>
                        </h5>
                      ) : (
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-snug line-clamp-3 mb-2">
                          {item.title}
                        </h5>
                      )}

                      {/* Detail hint */}
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/40">
                          <FileText className="w-3 h-3" />
                          <span>Chi tiết hồ sơ, thời hạn & phí</span>
                        </span>
                      </div>

                      {/* Cơ quan ban hành & Lĩnh vực TTHC */}
                      <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 mb-2">
                        <div className="flex items-start gap-1.5 leading-tight">
                          <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            <strong className="text-slate-900 dark:text-slate-100 font-semibold">Cơ quan ban hành:</strong> {item.agency}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 leading-tight">
                          <Tag className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            <strong className="text-slate-900 dark:text-slate-100 font-semibold">Lĩnh vực:</strong> {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mã QR kích thước chính xác 150x150 px */}
                    <div className="py-2.5 flex flex-col items-center justify-center my-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      {item.url ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQrItem(item);
                          }}
                          className="flex flex-col items-center cursor-pointer group/qr p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-red-500 transition"
                          title="Quét mã QR • Bấm để phóng to hoặc sao chép link"
                        >
                          <div className="w-[150px] h-[150px] min-w-[150px] min-h-[150px] flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden">
                            <QrCodeImage url={item.url} size={150} className="w-[150px] h-[150px] object-contain block" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover/qr:text-red-700 dark:group-hover/qr:text-red-400 mt-1.5 flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5" /> Quét mã QR
                          </span>
                        </div>
                      ) : (
                        <div className="w-[150px] h-[150px] flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                          Chưa có QR
                        </div>
                      )}
                    </div>

                    {/* Bottom: Mức độ */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailItem(item);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Xem chi tiết</span>
                      </button>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          isToanTrinh
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {item.level}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto text-xs">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Hình thức:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          isToanTrinh
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {item.level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 bg-white border-t border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[14px] text-black font-['Times_New_Roman',serif]">
          <div>
            Trang <strong className="text-black font-bold">{currentPage}</strong> /{' '}
            <strong className="text-black font-bold">{totalPages}</strong> (Hiển thị{' '}
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, items.length)} trong tổng số{' '}
            <strong className="text-black font-bold">{items.length}</strong> TTHC)
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto text-[14px]">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-black rounded bg-white hover:bg-slate-100 text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Về trang đầu"
            >
              <ChevronsLeft className="w-3.5 h-3.5 text-black" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-black rounded bg-white hover:bg-slate-100 text-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-bold cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-black" />
              <span>Trước</span>
            </button>

            <span className="px-3 py-1 font-bold text-black bg-white border border-black rounded">
              {currentPage}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 border border-black rounded bg-white hover:bg-slate-100 text-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5 text-black" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-black rounded bg-white hover:bg-slate-100 text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Đến trang cuối"
            >
              <ChevronsRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* QR Zoom Modal */}
      <QrModal
        item={selectedQrItem}
        onClose={() => setSelectedQrItem(null)}
        copiedUrl={copiedUrl}
        onCopyUrl={handleCopyUrl}
        onUpdateItemUrl={handleUpdateItemUrl}
      />

      {/* Modal Chi tiết TTHC: Thành phần hồ sơ, thời hạn giải quyết, phí lệ phí */}
      <TthcDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onOpenQrZoom={(it) => setSelectedQrItem(it)}
      />

      {/* Auto QR Assign Modal */}
      <AutoQrAssignModal
        isOpen={isAutoQrModalOpen}
        onClose={() => {
          setIsAutoQrModalOpen(false);
          setTargetItemForQrAssign(null);
        }}
        allItems={allItems || items}
        filteredItems={items}
        targetItem={targetItemForQrAssign}
        onItemsUpdated={(updatedList, message) => {
          if (onItemsUpdated) {
            onItemsUpdated(updatedList, message);
          }
        }}
      />
    </div>
  );
};
