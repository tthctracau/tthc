import React from 'react';
import { RefreshCw, ExternalLink, CheckCircle2, AlertCircle, LogOut, ShieldCheck, Database } from 'lucide-react';
import { User } from 'firebase/auth';
import { SPREADSHEET_URL } from '../services/googleSheetsService';

interface GoogleSheetsSyncBarProps {
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  itemsCount: number;
  syncError: string | null;
  onSyncNow: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
}

export const GoogleSheetsSyncBar: React.FC<GoogleSheetsSyncBarProps> = ({
  user,
  isSyncing,
  lastSyncedAt,
  itemsCount,
  syncError,
  onSyncNow,
  onSignIn,
  onSignOut,
  isLoggingIn,
}) => {
  const formattedSyncTime = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' ' +
      lastSyncedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  return (
    <div className="bg-white border-b border-emerald-200/80 shadow-xs mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Source & Status Information */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-semibold border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nguồn dữ liệu: Google Sheets</span>
            </div>

            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium underline underline-offset-2 transition"
              title="Mở Google Sheets gốc (gid=466141218)"
            >
              <span className="max-w-[200px] sm:max-w-xs truncate">Mở trang tính nguồn (gid=466141218)</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>

            <span className="text-slate-300">|</span>

            {/* Sync State */}
            {isSyncing ? (
              <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Đang tự động đồng bộ dữ liệu...</span>
              </div>
            ) : lastSyncedAt ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã cập nhật lúc {formattedSyncTime} ({itemsCount} TTHC)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Chưa hoàn tất đồng bộ lần đầu</span>
              </div>
            )}
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center flex-wrap gap-2.5 justify-end">
            {/* Sync Now Button */}
            <button
              onClick={onSyncNow}
              disabled={isSyncing || isLoggingIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer"
              title="Cập nhật dữ liệu mới nhất từ Google Sheets ngay bây giờ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang cập nhật...' : 'Cập nhật từ Sheets'}</span>
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-6 h-6 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                    {(user.displayName || user.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left text-[11px] leading-tight max-w-[130px] truncate text-slate-700 font-medium">
                  {user.displayName || user.email}
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1 hover:bg-slate-100 text-slate-500 hover:text-red-600 rounded transition"
                  title="Đăng xuất tài khoản Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button inline-flex items-center gap-2 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
                title="Đăng nhập tài khoản Google để cấp quyền đọc Google Sheets"
              >
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span>{isLoggingIn ? 'Đang kết nối...' : 'Đăng nhập Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync Error / Prompt notification if needed */}
        {syncError && (
          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Thông báo đồng bộ: </span>
                <span>{syncError}</span>
              </div>
            </div>
            {!user && (
              <button
                onClick={onSignIn}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shrink-0 transition"
              >
                Đăng nhập ngay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
