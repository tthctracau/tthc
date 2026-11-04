import { TTHCItem } from '../types';

const STORAGE_KEY = 'tthc_recently_viewed_v1';
const MAX_RECENT_ITEMS = 6;

export interface RecentTthcItem {
  stt: number;
  code: string;
  title: string;
  level: string;
  agency?: string;
  category: string;
  url: string;
  viewedAt: number; // timestamp
}

// Initial demo seeds so the component is immediately populated with official procedures
const INITIAL_RECENT_SEEDS: RecentTthcItem[] = [
  {
    stt: 1,
    code: '1.002874',
    title: 'Đăng ký kết hôn',
    level: 'Toàn trình',
    category: 'Hộ tịch',
    agency: 'UBND Phường Trà Câu',
    url: 'https://dichvucong.quangngai.gov.vn',
    viewedAt: Date.now() - 1000 * 60 * 5,
  },
  {
    stt: 2,
    code: '1.000123',
    title: 'Chứng thực bản sao từ bản chính các giấy tờ, văn bản',
    level: 'Một phần',
    category: 'Chứng thực',
    agency: 'UBND Phường Trà Câu',
    url: 'https://dichvucong.quangngai.gov.vn',
    viewedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    stt: 3,
    code: '1.002868',
    title: 'Đăng ký khai sinh',
    level: 'Toàn trình',
    category: 'Hộ tịch',
    agency: 'UBND Phường Trà Câu',
    url: 'https://dichvucong.quangngai.gov.vn',
    viewedAt: Date.now() - 1000 * 60 * 30,
  },
];

export function getRecentlyViewedItems(): RecentTthcItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECENT_SEEDS));
      return INITIAL_RECENT_SEEDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error reading recently viewed items:', e);
    return [];
  }
}

export function addRecentlyViewedItem(item: TTHCItem): RecentTthcItem[] {
  try {
    const current = getRecentlyViewedItems();
    const filtered = current.filter((r) => r.code !== item.code);
    const newItem: RecentTthcItem = {
      stt: item.stt,
      code: item.code,
      title: item.title,
      level: item.level,
      agency: item.agency,
      category: item.category,
      url: item.url,
      viewedAt: Date.now(),
    };
    const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recently_viewed_changed', { detail: updated }));
    return updated;
  } catch (e) {
    console.warn('Error adding recently viewed item:', e);
    return [];
  }
}

export function clearRecentlyViewedItems(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('recently_viewed_changed', { detail: [] }));
  } catch (e) {
    console.warn('Error clearing recently viewed items:', e);
  }
}

export function removeRecentlyViewedItem(code: string): RecentTthcItem[] {
  try {
    const current = getRecentlyViewedItems();
    const updated = current.filter((r) => r.code !== code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recently_viewed_changed', { detail: updated }));
    return updated;
  } catch (e) {
    console.warn('Error removing recently viewed item:', e);
    return [];
  }
}
