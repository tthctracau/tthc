import React, { useState, useMemo } from 'react';
import {
  Link as LinkIcon,
  QrCode,
  Sparkles,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Layers,
  Search,
  Save,
  RotateCcw,
} from 'lucide-react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';
import {
  URL_TEMPLATE_PRESETS,
  UrlTemplatePreset,
  formatUrlFromTemplate,
  batchAssignAutoQrLinks,
  saveCustomUrlOverride,
} from '../services/qrLinkManager';

interface AutoQrAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  allItems: TTHCItem[];
  filteredItems: TTHCItem[];
  targetItem?: TTHCItem | null;
  onItemsUpdated: (updatedList: TTHCItem[], message: string) => void;
}

export const AutoQrAssignModal: React.FC<AutoQrAssignModalProps> = ({
  isOpen,
  onClose,
  allItems,
  filteredItems,
  targetItem = null,
  onItemsUpdated,
}) => {
  // Mode: 'batch' (hàng loạt) or 'single' (từng thủ tục)
  const [activeTab, setActiveTab] = useState<'batch' | 'single'>(targetItem ? 'single' : 'batch');

  // Batch states
  const [selectedPresetId, setSelectedPresetId] = useState<string>(URL_TEMPLATE_PRESETS[0].id);
  const [customTemplate, setCustomTemplate] = useState<string>(URL_TEMPLATE_PRESETS[0].template);
  const [overwriteAll, setOverwriteAll] = useState<boolean>(false);
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');

  // Single item states
  const [selectedSingleCode, setSelectedSingleCode] = useState<string>(targetItem?.code || allItems[0]?.code || '');
  const [singleSearch, setSingleSearch] = useState<string>('');
  const [customSingleUrl, setCustomSingleUrl] = useState<string>(targetItem?.url || '');

  // Keep single state in sync when targetItem changes
  React.useEffect(() => {
    if (targetItem) {
      setActiveTab('single');
      setSelectedSingleCode(targetItem.code);
      setCustomSingleUrl(targetItem.url || '');
    }
  }, [targetItem]);

  // Current selected single item
  const currentSingleItem = useMemo(() => {
    return allItems.find((i) => i.code === selectedSingleCode) || targetItem || allItems[0];
  }, [allItems, selectedSingleCode, targetItem]);

  // Update single URL field when changing selected single item
  const handleSelectSingleItem = (code: string) => {
    setSelectedSingleCode(code);
    const item = allItems.find((i) => i.code === code);
    if (item) {
      setCustomSingleUrl(item.url || '');
    }
  };

  // Preset selection handler
  const handlePresetSelect = (preset: UrlTemplatePreset) => {
    setSelectedPresetId(preset.id);
    setCustomTemplate(preset.template);
  };

  // Preview item for batch mode
  const previewItem = filteredItems[0] || allItems[0];
  const previewBatchUrl = previewItem ? formatUrlFromTemplate(customTemplate, previewItem) : '';

  // Execute Batch Assignment
  const handleExecuteBatch = () => {
    const targetList = scope === 'filtered' ? filteredItems : allItems;
    if (targetList.length === 0) return;

    const result = batchAssignAutoQrLinks(allItems, customTemplate, overwriteAll);

    onItemsUpdated(
      result.updatedItems,
      `Đã tự động gán đường link và cập nhật mã QR cho ${result.updatedCount} thủ tục hành chính`
    );
    onClose();
  };

  // Execute Single Assignment
  const handleExecuteSingle = () => {
    if (!currentSingleItem) return;
    const finalUrl = customSingleUrl.trim() || 'https://dichvucong.gov.vn';

    saveCustomUrlOverride(currentSingleItem.code, finalUrl);

    const updatedList = allItems.map((item) =>
      item.code === currentSingleItem.code ? { ...item, url: finalUrl } : item
    );

    onItemsUpdated(
      updatedList,
      `Đã gán link và tạo mã QR tự động mới cho thủ tục "${currentSingleItem.code}"`
    );
    onClose();
  };

  // Quick single template setter
  const handleApplySingleTemplate = (template: string) => {
    if (!currentSingleItem) return;
    const generated = formatUrlFromTemplate(template, currentSingleItem);
    setCustomSingleUrl(generated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-800 to-red-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Gán Đường Link & Tạo Mã QR Tự Động
              </h3>
              <p className="text-red-100 text-xs mt-0.5">
                Tự động sinh link Cổng Dịch vụ công theo Mã TTHC & Tạo mã QR tức thì
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Hàng loạt vs Từng thủ tục */}
        <div className="px-5 pt-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'text-red-700 dark:text-red-400 border-red-600 bg-white dark:bg-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tự động gán hàng loạt ({filteredItems.length} TTHC)</span>
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'single'
                ? 'text-red-700 dark:text-red-400 border-red-600 bg-white dark:bg-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Gán link cho từng thủ tục cụ thể</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* ================= MODE 1: BATCH AUTO-ASSIGN ================= */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              {/* Presets List */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  1. Chọn mẫu quy tắc tạo đường link tự động theo Mã TTHC:
                </label>
                <div className="space-y-2">
                  {URL_TEMPLATE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-red-600 bg-red-50/60 dark:bg-red-950/40 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                            <span>{preset.name}</span>
                          </p>
                          <p className="font-mono text-[11px] text-red-800 dark:text-red-300 break-all bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {preset.template}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {preset.description}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="preset"
                          checked={isSelected}
                          onChange={() => handlePresetSelect(preset)}
                          className="accent-red-700 w-4 h-4 mt-1 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Template Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  2. Tùy chỉnh mẫu đường link (Hệ thống tự thay thế biến <code className="text-red-700 dark:text-red-400 font-bold">{'{code}'}</code> bằng mã thủ tục):
                </label>
                <input
                  type="text"
                  value={customTemplate}
                  onChange={(e) => {
                    setCustomTemplate(e.target.value);
                    setSelectedPresetId('custom');
                  }}
                  placeholder="https://dichvucong.gov.vn/...?ma_thu_tuc={code}"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl font-mono text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Real-time Live Preview */}
              {previewItem && (
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="shrink-0 bg-white p-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs">
                    <QrCodeImage url={previewBatchUrl} size={90} />
                  </div>
                  <div className="space-y-1 flex-1 text-center sm:text-left">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      MÃ QR ĐƯỢC TẠO TỰ ĐỘNG MẪU
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Áp dụng cho: {previewItem.title} ({previewItem.code})
                    </p>
                    <p className="font-mono text-[11px] text-red-800 dark:text-red-300 break-all bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      {previewBatchUrl}
                    </p>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteAll}
                    onChange={(e) => setOverwriteAll(e.target.checked)}
                    className="accent-red-700 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                      Ghi đè cả các thủ tục đã có link
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {overwriteAll ? 'Cập nhật lại toàn bộ' : 'Chỉ gán cho thủ tục chưa có link chi tiết'}
                    </span>
                  </div>
                </label>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Phạm vi gán:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setScope('filtered')}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                        scope === 'filtered'
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Đang lọc ({filteredItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('all')}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                        scope === 'all'
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Tất cả ({allItems.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODE 2: SINGLE PROCEDURE ASSIGN ================= */}
          {activeTab === 'single' && (
            <div className="space-y-4">
              {/* Select or Search Procedure */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  1. Chọn thủ tục hành chính cần gán link:
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={singleSearch}
                    onChange={(e) => setSingleSearch(e.target.value)}
                    placeholder="Lọc nhanh thủ tục theo tên hoặc mã..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-xs"
                  />
                </div>
                <select
                  value={selectedSingleCode}
                  onChange={(e) => handleSelectSingleItem(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500"
                >
                  {allItems
                    .filter((item) => {
                      if (!singleSearch.trim()) return true;
                      const q = singleSearch.toLowerCase();
                      return (
                        item.title.toLowerCase().includes(q) ||
                        item.code.toLowerCase().includes(q)
                      );
                    })
                    .slice(0, 80)
                    .map((item) => (
                      <option key={item.code} value={item.code}>
                        #{item.stt} • {item.code} - {item.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Item Info & Current QR preview */}
              {currentSingleItem && (
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="shrink-0 bg-white p-2 rounded-xl border-2 border-red-600 shadow-sm text-center">
                    <QrCodeImage url={customSingleUrl} size={110} />
                    <span className="text-[9px] font-bold text-slate-600 block mt-1">MÃ QR HIỆN TẠI</span>
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-red-800 dark:text-red-300 bg-red-100/70 dark:bg-red-950/70 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
                        Mã TTHC: {currentSingleItem.code}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1 leading-snug">
                        {currentSingleItem.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {currentSingleItem.agency} • Lĩnh vực: {currentSingleItem.category} • {currentSingleItem.level}
                      </p>
                    </div>

                    {/* Quick Preset Buttons for this item */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                        Gợi ý gán tự động nhanh theo mã {currentSingleItem.code}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplySingleTemplate(URL_TEMPLATE_PRESETS[0].template)}
                          className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-red-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Cổng DVC Quốc gia
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplySingleTemplate(URL_TEMPLATE_PRESETS[1].template)}
                          className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-red-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Cổng DVC Quảng Ngãi
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplySingleTemplate(URL_TEMPLATE_PRESETS[2].template)}
                          className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-red-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-bold cursor-pointer"
                        >
                          UBND Trà Câu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Single URL Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  2. Đường link Cổng Dịch vụ công (Mã QR sẽ tự động sinh theo đường link này):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customSingleUrl}
                    onChange={(e) => setCustomSingleUrl(e.target.value)}
                    placeholder="https://dichvucong.gov.vn/..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl font-mono text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  {customSingleUrl && (
                    <a
                      href={customSingleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      title="Mở thử liên kết này trong tab mới"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Hủy bỏ
          </button>

          {activeTab === 'batch' ? (
            <button
              onClick={handleExecuteBatch}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>
                Thực hiện gán link & Tạo mã QR ({scope === 'filtered' ? filteredItems.length : allItems.length} TTHC)
              </span>
            </button>
          ) : (
            <button
              onClick={handleExecuteSingle}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-yellow-300" />
              <span>Lưu & Cập nhật mã QR cho thủ tục này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
