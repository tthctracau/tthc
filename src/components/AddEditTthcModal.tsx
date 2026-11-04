import React, { useState, useEffect } from 'react';
import { X, Plus, Save, QrCode, AlertCircle, Link as LinkIcon, Check, Trash2 } from 'lucide-react';
import { TTHCItem, ServiceLevel, Category } from '../types';
import { CATEGORIES } from '../data/tthcData';
import { QrCodeImage } from './QrCodeImage';

interface AddEditTthcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: TTHCItem, isEdit: boolean) => void;
  editingItem: TTHCItem | null;
  nextStt: number;
  onDelete?: (item: TTHCItem) => void;
}

export const AddEditTthcModal: React.FC<AddEditTthcModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  nextStt,
  onDelete,
}) => {
  const [stt, setStt] = useState<number>(nextStt);
  const [code, setCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [level, setLevel] = useState<ServiceLevel>('Toàn trình');
  const [category, setCategory] = useState<Category>('Hộ tịch - Tư pháp');
  const [agency, setAgency] = useState<string>('UBND Phường Trà Câu');
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setStt(editingItem.stt);
      setCode(editingItem.code);
      setTitle(editingItem.title);
      setLevel(editingItem.level);
      setCategory(editingItem.category);
      setAgency(editingItem.agency || 'UBND Phường Trà Câu');
      setUrl(editingItem.url);
      setError(null);
    } else {
      setStt(nextStt);
      setCode('');
      setTitle('');
      setLevel('Toàn trình');
      setCategory('Hộ tịch - Tư pháp');
      setAgency('UBND Phường Trà Câu');
      setUrl('https://dichvucong.gov.vn/thu-tuc-hanh-chinh/');
      setError(null);
    }
  }, [editingItem, nextStt, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!code.trim()) {
      setError('Vui lòng nhập Mã Thủ tục Hành chính (Mã TTHC).');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập Tên Thủ tục Hành chính.');
      return;
    }
    if (!url.trim() || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setError('Vui lòng nhập đúng định dạng Đường dẫn URL (bắt đầu bằng https:// hoặc http://).');
      return;
    }

    const newItem: TTHCItem = {
      stt: Number(stt),
      code: code.trim(),
      title: title.trim(),
      level,
      category,
      agency: agency.trim() || 'UBND Phường Trà Câu',
      url: url.trim(),
    };

    onSave(newItem, !!editingItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-800 rounded-lg">
              {editingItem ? <Save className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingItem ? 'CHỈNH SỬA THỦ TỤC HÀNH CHÍNH' : 'THÊM MỚI THỦ TỤC HÀNH CHÍNH'}
              </h2>
              <p className="text-xs text-red-100 font-medium">
                UBND Phường Trà Câu • Cập nhật danh mục TTHC công khai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-red-100 hover:text-white hover:bg-red-800 rounded-lg transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-r-lg flex items-center gap-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* STT */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">STT</label>
              <input
                type="number"
                value={stt}
                onChange={(e) => setStt(Number(e.target.value))}
                min={1}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>

            {/* Mã TTHC */}
            <div className="sm:col-span-9">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                MÃ TTHC <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: 3.000576.01"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Tên TTHC */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              TÊN THỦ TỤC HÀNH CHÍNH (TÊN TT) <span className="text-red-600">*</span>
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên đầy đủ của thủ tục hành chính..."
              rows={3}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Lĩnh vực */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LĨNH VỰC</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              >
                {CATEGORIES.filter((c) => c !== 'Tất cả').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cơ quan ban hành */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CƠ QUAN BAN HÀNH</label>
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder="VD: UBND Phường Trà Câu"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>

            {/* Mức độ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MỨC ĐỘ DỊCH VỤ CÔNG</label>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setLevel('Toàn trình')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    level === 'Toàn trình'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {level === 'Toàn trình' && <Check className="w-3.5 h-3.5" />}
                  <span>Toàn trình</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLevel('Một phần')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    level === 'Một phần'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {level === 'Một phần' && <Check className="w-3.5 h-3.5" />}
                  <span>Một phần</span>
                </button>
              </div>
            </div>
          </div>

          {/* Đường dẫn & Mã QR Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-red-700" />
              <span>ĐƯỜNG DẪN TRUY CẬP (URL DỊCH VỤ CÔNG) <span className="text-red-600">*</span></span>
            </label>
            
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://dichvucong.gov.vn/thu-tuc-hanh-chinh/..."
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {/* QR Preview section */}
            <div className="pt-2 flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
              <div className="shrink-0">
                <QrCodeImage value={url || 'https://dichvucong.gov.vn'} size={72} className="border border-slate-200 rounded p-1" />
              </div>
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-red-700" />
                  MÃ QR TỰ ĐỘNG TẠO
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Mã QR sẽ được hệ thống tự động sinh dựa trên đường dẫn liên kết bạn vừa nhập.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              {editingItem && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(editingItem);
                  }}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 transition flex items-center gap-1.5"
                  title="Xóa thủ tục hành chính này"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Xóa thủ tục này</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Cập nhật thay đổi' : 'Lưu TTHC mới'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
