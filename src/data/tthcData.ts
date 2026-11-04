import { TTHCItem } from '../types';
import itemsJson from './tthcData.json';

/**
 * Danh mục Thủ tục Hành chính chính thức từ bảng "TONG HOP TTHC" (423 TTHC)
 * Cột D: Cơ quan ban hành
 * Cột E: Lĩnh vực
 */
export const RAW_TTHC_LIST: TTHCItem[] = itemsJson as TTHCItem[];

export const CATEGORIES = Array.from(
  new Set(RAW_TTHC_LIST.map((item) => item.category).filter(Boolean))
).sort();

export const AGENCIES = Array.from(
  new Set(RAW_TTHC_LIST.map((item) => item.agency).filter(Boolean))
).sort();
