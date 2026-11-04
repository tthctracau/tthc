import { TTHCItem } from '../types';

const CUSTOM_URLS_KEY = 'UBND_TRA_CAU_CUSTOM_URL_OVERRIDES_V1';

export interface UrlTemplatePreset {
  id: string;
  name: string;
  template: string;
  description: string;
}

export const URL_TEMPLATE_PRESETS: UrlTemplatePreset[] = [
  {
    id: 'dvc-quoc-gia',
    name: 'Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn)',
    template: 'https://dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc={code}',
    description: 'Tự động gán theo tham số mã thủ tục chuẩn quốc gia: ma_thu_tuc={code}',
  },
  {
    id: 'dvc-quang-ngai',
    name: 'Cổng Dịch vụ công Tỉnh Quảng Ngãi',
    template: 'https://dichvucong.quangngai.gov.vn/tra-cuu-tthc?ma={code}',
    description: 'Tự động gán theo Cổng DVC tỉnh Quảng Ngãi: ma={code}',
  },
  {
    id: 'ubnd-tra-cau',
    name: 'Cổng Thông tin Điện tử UBND Phường Trà Câu',
    template: 'https://tracau.ducpho.quangngai.gov.vn/tthc/{code}',
    description: 'Tự động gán theo cổng chuyên trang TTHC Phường Trà Câu',
  },
];

/**
 * Get saved custom URLs from localStorage
 */
export function getCustomUrlOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_URLS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read custom URLs from localStorage', e);
  }
  return {};
}

/**
 * Save single custom URL for a procedure code
 */
export function saveCustomUrlOverride(code: string, url: string): void {
  try {
    const current = getCustomUrlOverrides();
    const cleanUrl = url.trim();
    if (cleanUrl) {
      current[code] = cleanUrl;
    } else {
      delete current[code];
    }
    localStorage.setItem(CUSTOM_URLS_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Could not save custom URL to localStorage', e);
  }
}

/**
 * Save multiple custom URLs at once
 */
export function saveMultipleCustomUrlOverrides(overrides: Record<string, string>): void {
  try {
    const current = getCustomUrlOverrides();
    const updated = { ...current, ...overrides };
    localStorage.setItem(CUSTOM_URLS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save multiple custom URLs', e);
  }
}

/**
 * Apply saved custom URLs to item list
 */
export function applyCustomUrlOverrides(items: TTHCItem[]): TTHCItem[] {
  const overrides = getCustomUrlOverrides();
  if (Object.keys(overrides).length === 0) return items;

  return items.map((item) => {
    if (overrides[item.code]) {
      return {
        ...item,
        url: overrides[item.code],
      };
    }
    return item;
  });
}

/**
 * Format a template with item data
 */
export function formatUrlFromTemplate(template: string, item: TTHCItem): string {
  const cleanCode = encodeURIComponent(item.code.trim());
  const cleanStt = item.stt.toString();
  return template
    .replace(/\{code\}/gi, cleanCode)
    .replace(/\{stt\}/gi, cleanStt);
}

/**
 * Batch assign auto QR URLs using a template
 */
export function batchAssignAutoQrLinks(
  items: TTHCItem[],
  template: string,
  overwriteExisting: boolean = false
): { updatedItems: TTHCItem[]; updatedCount: number; newOverrides: Record<string, string> } {
  const newOverrides: Record<string, string> = {};
  let count = 0;

  const updatedItems = items.map((item) => {
    const isDefaultOrEmpty =
      !item.url ||
      item.url === 'https://dichvucong.gov.vn' ||
      item.url === 'https://dichvucong.gov.vn/' ||
      item.url.trim() === '';

    if (overwriteExisting || isDefaultOrEmpty) {
      const generatedUrl = formatUrlFromTemplate(template, item);
      newOverrides[item.code] = generatedUrl;
      count++;
      return {
        ...item,
        url: generatedUrl,
      };
    }
    return item;
  });

  saveMultipleCustomUrlOverrides(newOverrides);

  return {
    updatedItems,
    updatedCount: count,
    newOverrides,
  };
}
