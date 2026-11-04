import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { TTHCItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: TTHCItem | null;
  onClose: () => void;
  onConfirm: (item: TTHCItem) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Xác nhận xóa thủ tục hành chính</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-700">
            Bạn có chắc chắn muốn xóa Thủ tục Hành chính này khỏi danh mục không?
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <p className="font-mono text-slate-500 font-bold">STT: #{item.stt} | Mã: {item.code}</p>
            <p className="font-bold text-slate-900 leading-snug">{item.title}</p>
            <p className="text-slate-500">Lĩnh vực: {item.category}</p>
          </div>
          <p className="text-xs text-red-600 italic">
            * Hành động này có thể được hoàn tác bằng nút "Khôi phục dữ liệu gốc" trong cài đặt.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              onConfirm(item);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa thủ tục hành chính</span>
          </button>
        </div>
      </div>
    </div>
  );
};
