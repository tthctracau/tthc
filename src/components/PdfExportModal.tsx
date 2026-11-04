import React, { useState, useRef, useEffect } from 'react';
import {
  FileDown,
  Printer,
  X,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  ShieldCheck,
  Building2,
  QrCode,
  Calendar,
  Layers,
} from 'lucide-react';
import { TTHCItem } from '../types';
import { pregenerateQrCodeMap, generateMultiPagePdf, PdfExportProgress } from '../utils/pdfExportEngine';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredItems: TTHCItem[];
  totalAllItemsCount: number;
  activeFilterInfo?: {
    search?: string;
    agency?: string;
    category?: string;
    level?: string;
  };
}

const ITEMS_PER_PDF_PAGE = 10; // Optimal for A4 Landscape with full QR code and details

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  filteredItems,
  totalAllItemsCount,
  activeFilterInfo,
}) => {
  // Bật tính năng "Xuất Bảng Niêm Yết TTHC (Trang Ngang 3x3)" theo yêu cầu người dùng
  const ENABLE_NOTICE_BOARD_EXPORT = true;

  // Mẫu định dạng: 'notice-board' (Bảng niêm yết 3 cột x 3 dòng) hoặc 'table' (Bảng danh mục 5 cột chuẩn)
  const [layoutType, setLayoutType] = useState<'notice-board' | 'table'>('notice-board');
  const [exportScope, setExportScope] = useState<'all' | 'first20'>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<PdfExportProgress | null>(null);
  const [qrMap, setQrMap] = useState<Map<string, string>>(new Map());
  const [isQrPreloaded, setIsQrPreloaded] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const exportContainerRef = useRef<HTMLDivElement | null>(null);

  // Selected items to export: 18 items (2 trang 3x3) khi chọn xem trước
  const exportItems =
    exportScope === 'first20'
      ? filteredItems.slice(0, layoutType === 'notice-board' ? 18 : 20)
      : filteredItems;

  const itemsPerPage = layoutType === 'notice-board' ? 9 : 10;
  // Split items into pages
  const totalPages = Math.ceil(exportItems.length / itemsPerPage);
  const pages: TTHCItem[][] = [];
  for (let i = 0; i < exportItems.length; i += itemsPerPage) {
    pages.push(exportItems.slice(i, i + itemsPerPage));
  }

  // Pre-generate QR codes when modal opens or scope changes
  useEffect(() => {
    if (!isOpen || exportItems.length === 0) return;

    let isMounted = true;
    setIsQrPreloaded(false);
    setStatusMessage('Đang chuẩn bị mã QR cho danh mục...');

    pregenerateQrCodeMap(exportItems, (percent) => {
      if (isMounted) {
        setStatusMessage(`Đang tải mã QR: ${percent}%`);
      }
    })
      .then((map) => {
        if (isMounted) {
          setQrMap(map);
          setIsQrPreloaded(true);
          setStatusMessage('Mã QR đã sẵn sàng xuất PDF');
        }
      })
      .catch((err) => {
        console.warn('QR pregeneration warning:', err);
        if (isMounted) {
          setIsQrPreloaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, exportScope, filteredItems]);

  if (!isOpen) return null;

  const now = new Date();
  const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Direct PDF Download Handler
  const handleDownloadPdf = async () => {
    if (!exportContainerRef.current || isExporting) return;

    setIsExporting(true);
    setProgress({
      stage: 'preparing',
      currentPage: 0,
      totalPages,
      progressPercent: 5,
      message: 'Khởi tạo tài liệu PDF...',
    });

    try {
      // Find all page container DOM nodes
      const pageElements = Array.from(
        exportContainerRef.current.querySelectorAll('.pdf-page-container')
      ) as HTMLElement[];

      if (pageElements.length === 0) {
        throw new Error('Không tìm thấy nội dung trang để xuất.');
      }

      const prefix = layoutType === 'notice-board' ? 'Bang_niem_yet_TTHC_Trang_ngang_3x3_' : 'Danh_muc_TTHC_';
      const safeFileName = `${prefix}UBND_Phuong_Tra_Cau_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.pdf`;

      await generateMultiPagePdf(pageElements, safeFileName, (prog) => {
        setProgress(prog);
      });

      setTimeout(() => {
        setIsExporting(false);
        setProgress(null);
      }, 1500);
    } catch (err: any) {
      console.error('PDF export error:', err);
      alert('Có lỗi khi tạo file PDF: ' + (err.message || 'Vui lòng thử lại'));
      setIsExporting(false);
      setProgress(null);
    }
  };

  // Browser Print Preview Handler
  const handlePrintPreview = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-800 to-red-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <FileDown className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {ENABLE_NOTICE_BOARD_EXPORT && layoutType === 'notice-board'
                  ? 'Xuất Bảng Niêm Yết TTHC (Trang Ngang 3x3)'
                  : 'Xuất Danh Mục Thủ Tục Hành Chính Ra PDF'}
              </h3>
              <p className="text-red-100 text-xs mt-0.5">
                ỦY BAN NHÂN DÂN PHƯỜNG TRÀ CÂU • BẢN IN CHÍNH THỨC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Format Selection: Ẩn khi tạm đóng Bảng Niêm Yết 3x3 */}
          {ENABLE_NOTICE_BOARD_EXPORT && (
            <div className="space-y-2">
              <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                Mẫu định dạng niêm yết / báo cáo PDF:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setLayoutType('notice-board')}
                  className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition ${
                    layoutType === 'notice-board'
                      ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">DANH MỤC TTHC (Trang Ngang 3x3)</p>
                      <span className="text-[10px] bg-red-700 text-white px-1.5 py-0.2 rounded font-bold">Mới</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      Trang ngang 3 cột x 3 dòng (9 ô/trang), mỗi ô gồm Mã, Tên, Cơ quan ban hành, Lĩnh vực & Quét mã QR
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="layoutType"
                    checked={layoutType === 'notice-board'}
                    onChange={() => setLayoutType('notice-board')}
                    className="accent-red-700 w-4 h-4 cursor-pointer mt-0.5 shrink-0"
                  />
                </label>

                <label
                  onClick={() => setLayoutType('table')}
                  className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition ${
                    layoutType === 'table'
                      ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="pr-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Bảng Danh Mục (5 Cột chuẩn)</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      Bảng danh mục 5 cột truyền thống: STT, Mã TTHC, Tên TTHC, Mức độ và Mã QR
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="layoutType"
                    checked={layoutType === 'table'}
                    onChange={() => setLayoutType('table')}
                    className="accent-red-700 w-4 h-4 cursor-pointer mt-0.5 shrink-0"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-red-700 dark:text-red-400" />
                Thông tin tài liệu niêm yết
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                {exportItems.length} / {totalAllItemsCount} thủ tục
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Cơ quan ban hành:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {activeFilterInfo?.agency || 'UBND Phường Trà Câu'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Lĩnh vực:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {activeFilterInfo?.category || 'Tất cả'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Mức độ:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeFilterInfo?.level || 'Tất cả'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 min-w-[90px]">Ngày xuất:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {dateFormatted} ({timeFormatted})
                </span>
              </div>
              {activeFilterInfo?.search && activeFilterInfo.search.trim() && (
                <div className="flex items-center gap-2 sm:col-span-2 bg-red-50/60 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/40">
                  <span className="text-red-700 dark:text-red-400 font-semibold min-w-[90px]">Từ khóa lọc:</span>
                  <span className="font-bold text-red-800 dark:text-red-300">
                    "{activeFilterInfo.search.trim()}"
                  </span>
                </div>
              )}
            </div>

            {/* Note about columns or 3x3 layout */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {layoutType === 'notice-board'
                  ? 'Bảng niêm yết dạng trang ngang 3 cột x 3 dòng, mỗi ô thể hiện Mã TTHC, Tên TTHC, Cơ quan ban hành, Lĩnh vực TTHC và Mã QR kích thước lớn 150x150 px dễ quét.'
                  : 'File PDF bao gồm đầy đủ 05 cột: STT, MÃ TTHC, TÊN TTHC, MỨC ĐỘ và MÃ QR.'}
              </span>
            </div>
          </div>

          {/* Scope Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Phạm vi dữ liệu xuất PDF:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setExportScope('all')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  exportScope === 'all'
                    ? 'border-red-600 bg-red-50/50 dark:bg-red-950/40 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Toàn bộ danh sách đang lọc</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Xuất tất cả {filteredItems.length} thủ tục ({totalPages} trang PDF)
                  </p>
                </div>
                <input
                  type="radio"
                  name="scope"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                  className="accent-red-700 w-4 h-4 cursor-pointer"
                />
              </label>

              <label
                onClick={() => setExportScope('first20')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  exportScope === 'first20'
                    ? 'border-red-600 bg-red-50/50 dark:bg-red-950/40 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Xem trước nhanh (20 TTHC)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tải nhanh 20 thủ tục đầu tiên (2 trang PDF)
                  </p>
                </div>
                <input
                  type="radio"
                  name="scope"
                  checked={exportScope === 'first20'}
                  onChange={() => setExportScope('first20')}
                  className="accent-red-700 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Progress or Status */}
          {isExporting && progress ? (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-red-900 dark:text-red-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-700 dark:text-red-400" />
                  {progress.message}
                </span>
                <span>{progress.progressPercent}%</span>
              </div>
              <div className="w-full bg-red-200/80 dark:bg-red-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-700 dark:bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-red-700 dark:text-red-400">
                Đang vẽ tài liệu chuẩn A4 Khổ ngang với mã QR độ nét cao... Vui lòng không đóng cửa sổ này.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span>{statusMessage}</span>
              <span className="font-semibold">Định dạng: A4 Khổ ngang (Landscape)</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Native Print / Save to PDF */}
            <button
              onClick={handlePrintPreview}
              disabled={isExporting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Mở hộp thoại in của trình duyệt để in hoặc lưu thành file PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF từ Trình duyệt</span>
            </button>

            {/* Direct Multi-page PDF Download */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting || !isQrPreloaded}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xuất...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Tải tệp PDF ({exportItems.length} TTHC)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIDDEN OFF-SCREEN MULTI-PAGE TEMPLATE FOR HTML2CANVAS & DIRECT PDF EXPORT */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'fixed',
          top: '-99999px',
          left: '-99999px',
          width: '1280px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
        ref={exportContainerRef}
      >
        {pages.map((pageItems, pageIdx) => {
          const currentPageNum = pageIdx + 1;

          return (
            <div
              key={`pdf-page-${pageIdx}`}
              className="pdf-page-container"
              style={{
                width: '1280px',
                minHeight: '890px',
                padding: '32px',
                marginBottom: '32px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontFamily: '"Times New Roman", Times, Georgia, serif',
                fontSize: '14px',
              }}
            >
              {ENABLE_NOTICE_BOARD_EXPORT && layoutType === 'notice-board' ? (
                /* ================= MẪU 1: BẢNG NIÊM YẾT TTHC TRANG NGANG (3 CỘT x 3 DÒNG) ================= */
                <div>
                  {/* Official Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      paddingBottom: '10px',
                      borderBottom: '2px solid #991b1b',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#334155', margin: 0 }}>
                        UBND PHƯỜNG TRÀ CÂU 
                      </p>
                      <p style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 900, color: '#991b1b', margin: '2px 0 0 0' }}>
                        TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG
                      </p>
                      <p style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: '2px 0 0 0' }}>
                        Số: ..... /NY-UBND
                      </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </p>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', margin: '2px 0 0 0' }}>
                        Độc lập - Tự do - Hạnh phúc
                      </p>
                      <div style={{ width: '96px', height: '2px', backgroundColor: '#991b1b', margin: '4px auto' }}></div>
                      <p style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                        Trà Câu, ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}
                      </p>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div style={{ textAlign: 'center', margin: '8px 0 12px 0' }}>
                    <h1 style={{ fontSize: '15px', fontWeight: 900, color: '#7f1d1d', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>
                      DANH MỤC THỦ TỤC HÀNH CHÍNH THUỘC PHẨM QUYỀN GIẢI QUYẾT CỦA UBND PHƯỜNG TRÀ CÂU
                    </h1>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                      Năm 2026 • Phân loại theo Bộ lọc dữ liệu báo cáo • Tổng số: <strong>{exportItems.length}</strong> thủ tục (Quét mã QR)
                      {activeFilterInfo?.agency && activeFilterInfo.agency !== 'Tất cả' && ` • CQ: ${activeFilterInfo.agency}`}
                      {activeFilterInfo?.category && activeFilterInfo.category !== 'Tất cả' && ` • Lĩnh vực: ${activeFilterInfo.category}`}
                      {activeFilterInfo?.level && activeFilterInfo.level !== 'Tất cả' && ` • Mức độ: ${activeFilterInfo.level}`}
                      {activeFilterInfo?.search && activeFilterInfo.search.trim() && ` • Từ khóa: "${activeFilterInfo.search.trim()}"`}
                    </p>
                  </div>

                  {/* 3x3 Table (3 Columns x 3 Rows) */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #334155' }}>
                    <tbody>
                      {[0, 1, 2].map((rowIdx) => {
                        const rowItems = pageItems.slice(rowIdx * 3, rowIdx * 3 + 3);

                        return (
                          <tr key={`notice-row-${rowIdx}`}>
                            {[0, 1, 2].map((colIdx) => {
                              const item = rowItems[colIdx];
                              if (!item) {
                                return (
                                  <td
                                    key={`empty-cell-${colIdx}`}
                                    style={{
                                      width: '33.33%',
                                      border: '1.5px solid #64748b',
                                      padding: '8px 10px',
                                      backgroundColor: '#f8fafc',
                                      height: '215px',
                                      verticalAlign: 'top',
                                    }}
                                  ></td>
                                );
                              }

                              const globalIdx = pageIdx * 9 + rowIdx * 3 + colIdx + 1;
                              const qrKey = `${item.stt}-${item.code}`;
                              const qrDataUrl = qrMap.get(qrKey) || '';
                              const isToanTrinh = item.level === 'Toàn trình';

                              return (
                                <td
                                  key={`notice-cell-${item.stt}-${item.code}`}
                                  style={{
                                    width: '33.33%',
                                    border: '1.5px solid #64748b',
                                    padding: '8px 10px',
                                    backgroundColor: '#ffffff',
                                    height: '215px',
                                    verticalAlign: 'top',
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', height: '100%', alignItems: 'center' }}>
                                    {/* Left Details */}
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                      <div>
                                        {/* Top: Mã TTHC & STT */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', paddingBottom: '3px', borderBottom: '1px solid #e2e8f0' }}>
                                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#991b1b', backgroundColor: '#fef2f2', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fecaca', fontSize: '10px' }}>
                                            Mã: {item.code}
                                          </span>
                                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569' }}>
                                            #{globalIdx}
                                          </span>
                                        </div>

                                        {/* Tên TTHC */}
                                        <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '11px', lineHeight: 1.35, margin: '3px 0 5px 0' }}>
                                          {item.title}
                                        </p>

                                        {/* Cơ quan ban hành */}
                                        <p style={{ fontSize: '9.5px', color: '#334155', margin: '2px 0', lineHeight: 1.3 }}>
                                          <strong style={{ color: '#1e3a8a' }}>Cơ quan ban hành:</strong> {item.agency}
                                        </p>

                                        {/* Lĩnh vực TTHC */}
                                        <p style={{ fontSize: '9.5px', color: '#334155', margin: '2px 0', lineHeight: 1.3 }}>
                                          <strong style={{ color: '#4338ca' }}>Lĩnh vực TTHC:</strong> {item.category}
                                        </p>
                                      </div>

                                      {/* Mức độ */}
                                      <div style={{ marginTop: '4px' }}>
                                        <span
                                          style={{
                                            fontSize: '9px',
                                            fontWeight: 700,
                                            padding: '1px 6px',
                                            borderRadius: '4px',
                                            backgroundColor: isToanTrinh ? '#dcfce7' : '#fef3c7',
                                            color: isToanTrinh ? '#166534' : '#854d0e',
                                            display: 'inline-block',
                                          }}
                                        >
                                          {item.level}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Right: Mã QR có kích thước chuẩn 150x150 px */}
                                    <div style={{ width: '150px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                      {qrDataUrl ? (
                                        <img
                                          src={qrDataUrl}
                                          alt={`QR ${item.code}`}
                                          style={{
                                            width: '150px',
                                            height: '150px',
                                            minWidth: '150px',
                                            minHeight: '150px',
                                            objectFit: 'contain',
                                            border: '1.5px solid #64748b',
                                            padding: '2px',
                                            borderRadius: '6px',
                                            backgroundColor: '#ffffff',
                                            display: 'block',
                                          }}
                                        />
                                      ) : (
                                        <div style={{ width: '150px', height: '150px', backgroundColor: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>
                                          Chưa có QR
                                        </div>
                                      )}
                                      <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#334155', marginTop: '3px', textAlign: 'center', display: 'block' }}>
                                        Quét mã QR
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Page Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '10px', paddingTop: '6px', borderTop: '1px solid #cbd5e1' }}>
                    <span>
                      Ghi chú: Niêm yết công khai thủ tục hành chính tại Trung tâm Phục vụ hành chính công phường Trà Câu. Quét mã QR để xem chi tiết.
                    </span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>
                      Trang {currentPageNum} / {totalPages}
                    </span>
                  </div>
                </div>
              ) : (
                /* ================= MẪU 2: BẢNG DANH MỤC 5 CỘT CHUẨN ================= */
                <div>
                  {/* Official Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      paddingBottom: '12px',
                      borderBottom: '2px solid #991b1b',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: '#334155', margin: 0 }}>
                        UBND PHƯỜNG TRÀ CÂU 
                      </p>
                      <p style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 900, color: '#991b1b', margin: '2px 0 0 0' }}>
                        TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: '2px 0 0 0' }}>
                        Số: ..... /DM-UBND
                      </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', margin: '2px 0 0 0' }}>
                        Độc lập - Tự do - Hạnh phúc
                      </p>
                      <div style={{ width: '96px', height: '2px', backgroundColor: '#991b1b', margin: '4px auto' }}></div>
                      <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                        Trà Câu, ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}
                      </p>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div style={{ textAlign: 'center', margin: '12px 0' }}>
                    <h1 style={{ fontSize: '16px', fontWeight: 900, color: '#7f1d1d', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>
                      DANH MỤC THỦ TỤC HÀNH CHÍNH THUỘC THẨM QUYỀN GIẢI QUYẾT CỦA UBND PHƯỜNG TRÀ CÂU
                    </h1>
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                      Năm 2026 • Tổng số danh mục: <strong>{exportItems.length}</strong> thủ tục
                      {activeFilterInfo?.agency && activeFilterInfo.agency !== 'Tất cả' && ` • CQ: ${activeFilterInfo.agency}`}
                      {activeFilterInfo?.category && activeFilterInfo.category !== 'Tất cả' && ` • Lĩnh vực: ${activeFilterInfo.category}`}
                      {activeFilterInfo?.level && activeFilterInfo.level !== 'Tất cả' && ` • Mức độ: ${activeFilterInfo.level}`}
                      {activeFilterInfo?.search && activeFilterInfo.search.trim() && ` • Từ khóa: "${activeFilterInfo.search.trim()}"`}
                    </p>
                  </div>

                  {/* Data Table with 5 official columns: STT, Mã TTHC, Tên TTHC, Mức độ, Mã QR */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8', fontSize: '14px', marginTop: '12px', fontFamily: '"Times New Roman", Times, Georgia, serif' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>
                        <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '56px' }}>STT</th>
                        <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '128px' }}>MÃ TTHC</th>
                        <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'left' }}>TÊN TTHC</th>
                        <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '112px' }}>MỨC ĐỘ</th>
                        <th style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'center', width: '128px' }}>MÃ QR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((item, rowIdx) => {
                        const globalIdx = pageIdx * itemsPerPage + rowIdx + 1;
                        const qrKey = `${item.stt}-${item.code}`;
                        const qrDataUrl = qrMap.get(qrKey) || '';
                        const isToanTrinh = item.level === 'Toàn trình';

                        return (
                          <tr key={`pdf-row-${item.stt}-${item.code}`} style={{ borderBottom: '1px solid #cbd5e1' }}>
                            {/* 1. STT */}
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 700, color: '#334155', fontSize: '14px' }}>
                              {globalIdx}
                            </td>

                            {/* 2. Mã TTHC */}
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontFamily: '"Times New Roman", Times, Georgia, serif', fontWeight: 700, color: '#0f172a', backgroundColor: '#f8fafc', fontSize: '14px' }}>
                              {item.code}
                            </td>

                            {/* 3. Tên TTHC */}
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>
                              <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', lineHeight: 1.35, margin: 0 }}>
                                {item.title}
                              </p>
                              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>CQ: {item.agency}</span>
                                <span>•</span>
                                <span>Lĩnh vực: {item.category}</span>
                              </div>
                            </td>

                            {/* 4. Mức độ */}
                            <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  fontSize: '10px',
                                  backgroundColor: isToanTrinh ? '#dcfce7' : '#fef3c7',
                                  color: isToanTrinh ? '#14532d' : '#78350f',
                                }}
                              >
                                {item.level}
                              </span>
                            </td>

                            {/* 5. Mã QR Code */}
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>
                              {qrDataUrl ? (
                                <img
                                  src={qrDataUrl}
                                  alt={`QR ${item.code}`}
                                  style={{ width: '56px', height: '56px', margin: '0 auto', objectFit: 'contain', border: '1px solid #e2e8f0', padding: '2px', borderRadius: '4px', backgroundColor: '#ffffff' }}
                                />
                              ) : (
                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>QR Code</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Page Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #cbd5e1' }}>
                    <span>
                      Ghi chú: Người dân quét mã QR code tương ứng để nộp hồ sơ trực tuyến qua Cổng Dịch vụ công.
                    </span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>
                      Trang {currentPageNum} / {totalPages}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
