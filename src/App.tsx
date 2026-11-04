import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { TTHCItem } from './types';
import { RAW_TTHC_LIST } from './data/tthcData';
import { LookerStudioHeader } from './components/LookerStudioHeader';
import { LookerStudioFilters } from './components/LookerStudioFilters';
import { LookerStudioKPIs } from './components/LookerStudioKPIs';
import { LookerStudioTable } from './components/LookerStudioTable';
import { LookerStudioConnectModal } from './components/LookerStudioConnectModal';
import { CategoryPieChart } from './components/CategoryPieChart';
import { PdfExportModal } from './components/PdfExportModal';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken,
} from './services/googleAuth';
import {
  syncTthcFromGoogleSheet,
  getCachedSheetData,
} from './services/googleSheetsService';
import { applyCustomUrlOverrides } from './services/qrLinkManager';
import { RecentTthcItem } from './services/recentViewsManager';
import { User } from 'firebase/auth';
import { Check } from 'lucide-react';

const AUTO_REFRESH_INTERVAL_SECONDS = 10 * 60; // Quét tự động 10 phút/lần (600 giây)

export default function App() {
  // Load data: prefer cached Google Sheet data, otherwise initial user sheet list with custom overrides
  const [items, setItems] = useState<TTHCItem[]>(() => {
    const cached = getCachedSheetData();
    const raw = cached && cached.items.length > 0 ? cached.items : RAW_TTHC_LIST;
    return applyCustomUrlOverrides(raw);
  });

  // Auth & Google Sheets Live Sync State
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    const cached = getCachedSheetData();
    return cached?.lastSynced ? new Date(cached.lastSynced) : null;
  });
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(AUTO_REFRESH_INTERVAL_SECONDS);

  // Looker Studio Connect Guide Modal
  const [isLookerModalOpen, setIsLookerModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 4 Filters Required by User:
  // 1. Tên thủ tục hành chính
  const [search, setSearch] = useState('');
  // 2. Cơ quan ban hành
  const [selectedAgency, setSelectedAgency] = useState('Tất cả');
  // 3. Lĩnh vực
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  // 4. Mức độ
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');

  // Selected item from Recently Viewed list to open detail modal
  const [externalSelectedItem, setExternalSelectedItem] = useState<TTHCItem | null>(null);

  const handleSelectRecentProcedure = (recent: RecentTthcItem) => {
    const found = items.find((i) => i.code === recent.code) || {
      stt: recent.stt,
      code: recent.code,
      title: recent.title,
      level: recent.level,
      agency: recent.agency || 'UBND Phường Trà Câu',
      category: recent.category,
      url: recent.url,
    };
    setExternalSelectedItem(found);
  };

  // Available agencies from dataset
  const availableAgencies = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.agency && item.agency.trim()) {
        set.add(item.agency.trim());
      } else {
        set.add('UBND Phường Trà Câu');
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Available categories from dataset
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Sync handler from Google Sheets
  const handleSyncFromSheet = useCallback(
    async (tokenOverride?: string | null) => {
      setIsSyncing(true);
      setSyncError(null);

      try {
        const activeToken = tokenOverride !== undefined ? tokenOverride : await getAccessToken();
        const result = await syncTthcFromGoogleSheet(activeToken);

        if (result.items && result.items.length > 0) {
          const withOverrides = applyCustomUrlOverrides(result.items);
          setItems(withOverrides);
          setLastSyncedAt(new Date(result.updatedAt));
          setAutoRefreshCountdown(AUTO_REFRESH_INTERVAL_SECONDS);

          setToastMessage(`Đã cập nhật ${result.items.length} TTHC từ "${result.sheetTitle}"`);
          setTimeout(() => setToastMessage(null), 3500);
        }
      } catch (err: any) {
        console.warn('Sync warning:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Initialize auth state and trigger initial sync
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setCachedAccessToken(token);
          handleSyncFromSheet(token);
        }
      },
      () => {
        setUser(null);
        setCachedAccessToken(null);
        // Try public fetch or cached data
        handleSyncFromSheet(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [handleSyncFromSheet]);

  // Auto-refresh countdown and periodic background sync (every 60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Trigger periodic sync
          handleSyncFromSheet();
          return AUTO_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSyncFromSheet]);

  // Google Sign-In
  const handleSignIn = async () => {
    try {
      setSyncError(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setCachedAccessToken(res.accessToken);
        await handleSyncFromSheet(res.accessToken);
        setToastMessage(`Xin chào ${res.user.displayName || 'bạn'}, đã kết nối Google Sheets thành công!`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setSyncError('Bạn đã đóng cửa sổ đăng nhập Google.');
      } else {
        setSyncError(err.message || 'Đăng nhập Google thất bại');
      }
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setToastMessage('Đã đăng xuất tài khoản Google');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset all 4 filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedAgency('Tất cả');
    setSelectedCategory('Tất cả');
    setSelectedLevel('Tất cả');
  };

  // Filter items matching all 4 criteria
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      // 1. Tên thủ tục hành chính & Mã TTHC match
      if (q) {
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCode = item.code.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode) {
          return false;
        }
      }

      // 2. Cơ quan ban hành match
      if (selectedAgency !== 'Tất cả') {
        const itemAgency = item.agency || 'UBND Phường Trà Câu';
        if (itemAgency !== selectedAgency) {
          return false;
        }
      }

      // 3. Lĩnh vực match
      if (selectedCategory !== 'Tất cả') {
        if (item.category !== selectedCategory) {
          return false;
        }
      }

      // 4. Mức độ match
      if (selectedLevel !== 'Tất cả') {
        if (item.level !== selectedLevel) {
          return false;
        }
      }

      return true;
    });
  }, [items, search, selectedAgency, selectedCategory, selectedLevel]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-600 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Looker Studio Header with Real-time Sync Status */}
      <LookerStudioHeader
        user={user}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        itemsCount={items.length}
        syncError={syncError}
        onSyncNow={() => handleSyncFromSheet()}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenLookerGuide={() => setIsLookerModalOpen(true)}
        autoRefreshCountdown={autoRefreshCountdown}
      />

      {/* Main Reporting & Looker Dashboard Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 4 Interactive Filters Required */}
        <LookerStudioFilters
          search={search}
          onSearchChange={setSearch}
          selectedAgency={selectedAgency}
          onAgencyChange={setSelectedAgency}
          availableAgencies={availableAgencies}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          availableCategories={availableCategories}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          onResetFilters={handleResetFilters}
          onExportPdf={() => setIsPdfModalOpen(true)}
          onSelectRecentProcedure={handleSelectRecentProcedure}
          matchCount={filteredItems.length}
          totalCount={items.length}
        />

        {/* Looker Studio Scorecard KPIs */}
        <LookerStudioKPIs filteredItems={filteredItems} totalAllCount={items.length} />

        {/* Biểu đồ tròn hiển thị tỷ lệ các thủ tục hành chính theo lĩnh vực (Recharts) */}
        <CategoryPieChart
          items={filteredItems}
          totalAllCount={items.length}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Bảng Chi tiết Thủ tục Hành chính (Dạng Bảng & Dạng Lưới) */}
        <LookerStudioTable
          items={filteredItems}
          searchQuery={search}
          totalAllCount={items.length}
          allItems={items}
          onItemsUpdated={(updatedList, message) => {
            setItems(updatedList);
            setToastMessage(message);
            setTimeout(() => setToastMessage(null), 3500);
          }}
          onExportPdf={() => setIsPdfModalOpen(true)}
          externalSelectedItem={externalSelectedItem}
          onClearExternalSelectedItem={() => setExternalSelectedItem(null)}
          activeFilterInfo={{
            search,
            agency: selectedAgency,
            category: selectedCategory,
            level: selectedLevel,
          }}
        />
      </main>

      {/* Looker Studio Connection & Embedding Modal */}
      <LookerStudioConnectModal isOpen={isLookerModalOpen} onClose={() => setIsLookerModalOpen(false)} />

      {/* Modal Xuất Báo Cáo PDF Theo Bộ Lọc Dữ Liệu Báo Cáo */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        filteredItems={filteredItems}
        totalAllItemsCount={items.length}
        activeFilterInfo={{
          search,
          agency: selectedAgency,
          category: selectedCategory,
          level: selectedLevel,
        }}
      />

      {/* Official Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-5 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-bold text-slate-800 dark:text-slate-200">ỦY BÀN NHÂN DÂN PHƯỜNG TRÀ CÂU</p>
          <p className="text-slate-500 dark:text-slate-400">
            Hệ thống Báo cáo & Tra cứu Thủ tục Hành chính Trực tuyến • Cập nhật thời gian thực từ Google Sheets
          </p>
        </div>
      </footer>
    </div>
  );
}
