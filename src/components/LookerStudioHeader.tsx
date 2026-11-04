import React from 'react';
import { RefreshCw, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { ThemeToggle } from './ThemeToggle';

interface LookerStudioHeaderProps {
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  itemsCount: number;
  syncError: string | null;
  onSyncNow: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenLookerGuide?: () => void;
  autoRefreshCountdown: number;
}

export const LookerStudioHeader: React.FC<LookerStudioHeaderProps> = ({
  user,
  isSyncing,
  lastSyncedAt,
  itemsCount,
  syncError,
  onSyncNow,
  onSignIn,
  onSignOut,
  onOpenLookerGuide,
  autoRefreshCountdown,
}) => {
  return (
    <header className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white shadow-lg border-b border-red-950">
      {/* Top Banner: National & Agency Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Emblem & Ward Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-700/80 border-2 border-yellow-400 rounded-full flex items-center justify-center shrink-0 shadow-md">
              <span className="text-yellow-300 text-xl sm:text-2xl font-bold">★</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold tracking-wider text-xs uppercase">
                  UBND PHƯỜNG TRÀ CÂU  • TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  DỮ LIỆU CHÍNH THỨC
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
                DANH MỤC THỦ TỤC HÀNH CHÍNH THUỘC THẨM QUYỀN GIẢI QUYẾT CỦA UBND PHƯỜNG TRÀ CÂU
              </h1>
              <p className="text-red-100 text-xs mt-0.5">
                Năm 2026 • Tự động cập nhật thời gian thực từ Google Sheets • Quét hoặc nhấn mã QR để xem chi tiết
              </p>
            </div>
          </div>

          {/* User Auth & Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Theme Toggle Button (Dark / Light Mode) */}
            <ThemeToggle />

            {/* Google Authentication */}
            {user && (
              <div className="flex items-center gap-2 bg-black/25 border border-white/20 rounded-lg px-2.5 py-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Google'} className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="text-left text-[11px] leading-tight pr-1">
                  <span className="font-semibold block truncate max-w-[120px]">{user.displayName || user.email}</span>
                  <span className="text-emerald-300 text-[9px] flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Đã kết nối Google
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Google Sheets Live Sync Status Bar */}
      <div className="bg-red-950/90 border-t border-red-900/60 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          {/* Live Data Connection Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-red-100">
            <span className="inline-flex items-center gap-1.5 font-bold text-white bg-red-900/80 px-2 py-0.5 rounded border border-red-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Thời gian thực</span>
            </span>

            <span>
              Đã nạp: <strong className="text-white font-bold">{itemsCount}</strong> thủ tục
            </span>

            {lastSyncedAt && (
              <>
                <span className="text-red-300">|</span>
                <span className="text-red-200">
                  Cập nhật lúc:{' '}
                  <strong className="text-white">
                    {lastSyncedAt.toLocaleTimeString('vi-VN')} {lastSyncedAt.toLocaleDateString('vi-VN')}
                  </strong>
                </span>
              </>
            )}
          </div>

          {/* Sync Button & Auto-refresh timer */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <span className="text-[11px] text-red-200 hidden sm:inline">
              Tự động quét (10p/lần):{' '}
              <strong className="text-yellow-300 font-mono">
                {Math.floor(autoRefreshCountdown / 60).toString().padStart(2, '0')}:
                {(autoRefreshCountdown % 60).toString().padStart(2, '0')}
              </strong>
            </span>

            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-red-950 rounded font-bold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Quét & Đồng bộ ngay dữ liệu mới nhất từ Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang cập nhật...' : 'Đồng bộ ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
