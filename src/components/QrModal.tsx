import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, Copy, Check, Sparkles, Edit3, Save } from 'lucide-react';
import { TTHCItem } from '../types';
import { QrCodeImage } from './QrCodeImage';
import QRCode from 'qrcode';
import { URL_TEMPLATE_PRESETS, formatUrlFromTemplate } from '../services/qrLinkManager';

interface QrModalProps {
  item: TTHCItem | null;
  onClose: () => void;
  copiedUrl: string | null;
  onCopyUrl: (url: string) => void;
  onUpdateItemUrl?: (itemCode: string, newUrl: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  item,
  onClose,
  copiedUrl,
  onCopyUrl,
  onUpdateItemUrl,
}) => {
  const [isEditingLink, setIsEditingLink] = useState<boolean>(false);
  const [editUrl, setEditUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setEditUrl(item.url || '');
      setIsEditingLink(false);
    }
  }, [item]);

  if (!item) return null;

  const activeUrl = editUrl.trim() || item.url || 'https://dichvucong.gov.vn';

  // Download QR image
  const handleDownloadQrPng = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await QRCode.toDataURL(activeUrl, {
        width: 600,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#991B1B', // Red tone matching UBND branding
          light: '#ffffff',
        },
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QR_${item.code}_UBND_Tra_Cau.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('QR download error', e);
    } finally {
      setIsDownloading(false);
    }
  };

  // Save new link
  const handleSaveLink = () => {
    if (onUpdateItemUrl) {
      onUpdateItemUrl(item.code, activeUrl);
    }
    setIsEditingLink(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-800 dark:bg-red-900 text-white p-4 flex items-center justify-between">
          <div>
            <p className="text-yellow-300 text-xs font-semibold uppercase tracking-wide">MÃ QR THỦ TỤC HÀNH CHÍNH</p>
            <h3 className="font-bold text-sm mt-0.5">{item.code}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {item.title}
          </p>

          <div className="inline-block p-4 bg-white rounded-xl border-2 border-red-600 shadow-md">
            <QrCodeImage url={activeUrl} size={220} />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quét mã QR bằng ứng dụng Zalo, Máy ảnh hoặc ứng dụng dịch vụ công trên điện thoại di động để truy cập làm thủ tục.
          </p>

          {/* Current URL or Inline Edit Box */}
          {isEditingLink ? (
            <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Gán đường link tạo lại mã QR tự động:
              </label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://dichvucong.gov.vn/..."
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-xs font-mono"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setEditUrl(formatUrlFromTemplate(URL_TEMPLATE_PRESETS[0].template, item))}
                  className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-red-50 text-[10px] font-bold text-slate-800 dark:text-slate-200 rounded cursor-pointer"
                >
                  Link Cổng QG
                </button>
                <button
                  type="button"
                  onClick={() => setEditUrl(formatUrlFromTemplate(URL_TEMPLATE_PRESETS[1].template, item))}
                  className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-red-50 text-[10px] font-bold text-slate-800 dark:text-slate-200 rounded cursor-pointer"
                >
                  Link Quảng Ngãi
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingLink(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  <span>Lưu link & Tạo lại QR</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-700">
              <span className="truncate flex-1 text-left">{activeUrl}</span>
              <button
                onClick={() => setIsEditingLink(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 hover:underline shrink-0 cursor-pointer"
                title="Sửa hoặc gán link tạo mã QR mới"
              >
                <Edit3 className="w-3 h-3" />
                <span>Gán link</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <span>Truy cập Cổng DVC</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => onCopyUrl(activeUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              {copiedUrl === activeUrl ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQrPng}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 transition cursor-pointer"
              title="Tải ảnh mã QR độ nét cao về máy để in ấn hoặc chia sẻ"
            >
              <Download className="w-4 h-4 text-red-700 dark:text-red-400" />
              <span>Tải ảnh QR (.PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
