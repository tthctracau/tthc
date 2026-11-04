import { TTHCItem, ServiceLevel, Category } from '../types';

export const SPREADSHEET_ID = '1_sQwgLk-a_CmE6dA1ti8h0cNCryrngdLMVVB1nuIT8k';
export const SPREADSHEET_GID = '231913766';
export const SHEET_NAME_TARGET = 'TONG HOP TTHC';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=${SPREADSHEET_GID}#gid=${SPREADSHEET_GID}`;

export interface SheetFetchResult {
  items: TTHCItem[];
  sheetTitle: string;
  source: 'google-sheets-api' | 'google-sheets-public-export' | 'local-cache';
  updatedAt: string;
}

const CACHE_KEY = 'UBND_TRA_CAU_GOOGLE_SHEET_DATA_V7_GID_231913766';
const CACHE_TIME_KEY = 'UBND_TRA_CAU_GOOGLE_SHEET_LAST_SYNC_V7_GID_231913766';

export function getCachedSheetData(): { items: TTHCItem[]; lastSynced: string | null } | null {
  try {
    // Clear out legacy cache versions if present
    localStorage.removeItem('UBND_TRA_CAU_GOOGLE_SHEET_DATA_V6_GID_231913766');
    localStorage.removeItem('UBND_TRA_CAU_GOOGLE_SHEET_LAST_SYNC_V6_GID_231913766');

    const raw = localStorage.getItem(CACHE_KEY);
    const lastSynced = localStorage.getItem(CACHE_TIME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { items: parsed, lastSynced };
      }
    }
  } catch (err) {
    console.warn('Error reading cached sheet data:', err);
  }
  return null;
}

export function saveCachedSheetData(items: TTHCItem[], syncedAt: string) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(CACHE_TIME_KEY, syncedAt);
  } catch (err) {
    console.warn('Error saving sheet cache:', err);
  }
}

// Map Vietnamese category text to known valid categories
function normalizeCategory(raw: string): Category {
  const trimmed = raw.trim();
  if (!trimmed) return 'Văn hóa - Khác';

  const lower = trimmed.toLowerCase();
  if (lower.includes('hộ tịch') || lower.includes('tư pháp') || lower.includes('chứng thực')) {
    return 'Hộ tịch - Tư pháp';
  }
  if (lower.includes('lao động') || lower.includes('thương binh') || lower.includes('xã hội') || lower.includes('tb&xh')) {
    return 'Lao động - TB&XH';
  }
  if (lower.includes('giáo dục') || lower.includes('đào tạo') || lower.includes('trường')) {
    return 'Giáo dục & Đào tạo';
  }
  if (lower.includes('kinh doanh') || lower.includes('đăng ký kd') || lower.includes('hộ kinh doanh')) {
    return 'Đăng ký kinh doanh';
  }
  if (lower.includes('nông nghiệp') || lower.includes('thủy sản') || lower.includes('lâm nghiệp') || lower.includes('chăn nuôi')) {
    return 'Nông nghiệp & Thủy sản';
  }
  if (lower.includes('tài nguyên') || lower.includes('môi trường') || lower.includes('đất đai') || lower.includes('tn&mt')) {
    return 'Tài nguyên & Môi trường';
  }
  if (lower.includes('giao thông') || lower.includes('xây dựng') || lower.includes('đường bộ') || lower.includes('gt-xd')) {
    return 'Giao thông - Xây dựng';
  }
  if (lower.includes('điện lực') || lower.includes('điện năng') || lower.includes('ngành điện')) {
    return 'Điện lực';
  }
  return 'Văn hóa - Khác';
}

function normalizeLevel(raw: string): ServiceLevel {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('một phần') || lower.includes('mot phan') || lower.includes('1 phần') || lower.includes('part')) {
    return 'Một phần';
  }
  return 'Toàn trình';
}

/**
 * Parse rows matrix (from Google Sheets API or CSV) into TTHCItem[]
 */
export function parseSheetRows(rows: string[][]): TTHCItem[] {
  if (!rows || rows.length === 0) return [];

  // Find header row in first 10 rows
  let headerRowIndex = -1;
  let colStt = -1;
  let colCode = -1;
  let colTitle = -1;
  let colLevel = -1;
  let colUrl = -1;
  let colCategory = -1;
  let colAgency = -1;

  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r].map((c) => (c || '').toString().trim().toLowerCase());
    let foundStt = -1;
    let foundTitle = -1;
    let foundCode = -1;

    row.forEach((cell, idx) => {
      if (cell === 'stt' || cell.startsWith('số thứ tự') || cell === 'no.' || cell === 'no' || cell.endsWith('stt')) {
        foundStt = idx;
      }
      if (cell.includes('mã') || cell.includes('code')) {
        foundCode = idx;
      }
      if (cell.includes('tên thủ tục') || cell.includes('tên tthc') || cell === 'tên' || cell.includes('nội dung thủ tục')) {
        foundTitle = idx;
      }
    });

    if (foundTitle !== -1 || (foundStt !== -1 && foundCode !== -1)) {
      headerRowIndex = r;
      colStt = foundStt;
      colCode = foundCode;
      colTitle = foundTitle;

      // Identify remaining columns in this header row, ignoring foundStt/foundCode/foundTitle
      row.forEach((cell, idx) => {
        if (idx === foundStt || idx === foundCode || idx === foundTitle) return;

        if (cell.includes('mức độ') || cell.includes('cung cấp') || cell.includes('toàn trình') || cell.includes('dịch vụ')) {
          if (colLevel === -1) colLevel = idx;
        }
        if (cell.includes('đường dẫn') || cell.includes('link') || cell.includes('url') || cell.includes('dvc') || cell.includes('cổng')) {
          if (colUrl === -1) colUrl = idx;
        }
        if (cell.includes('lĩnh vực')) {
          if (colCategory === -1) colCategory = idx;
        }
        if (cell.includes('cơ quan ban hành') || cell.includes('cơ quan') || cell.includes('ban hành')) {
          if (colAgency === -1) colAgency = idx;
        }
      });
      break;
    }
  }

  // Exact fallback / standard mapping based on user Google Sheet "TONG HOP TTHC":
  // Cột A (0): STT
  // Cột B (1): Mã TTHC
  // Cột C (2): Tên TTHC
  // Cột D (3): Cơ quan ban hành (chuẩn xác theo Cột D)
  // Cột E (4): Lĩnh vực (chuẩn xác theo Cột E)
  // Cột F (5): Mức độ (Toàn trình / Một phần)
  // Cột H (7): Đường dẫn
  if (headerRowIndex === -1) headerRowIndex = 0;
  if (colStt === -1) colStt = 0;
  if (colCode === -1) colCode = 1;
  if (colTitle === -1) colTitle = 2;
  if (colAgency === -1 || colAgency === colStt) colAgency = 3;
  if (colCategory === -1 || colCategory === colStt) colCategory = 4;
  if (colLevel === -1) colLevel = 5;
  if (colUrl === -1) colUrl = 7;

  const items: TTHCItem[] = [];
  const startRow = headerRowIndex + 1;

  for (let r = startRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawStt = row[colStt]?.toString().trim() || '';
    const rawCode = row[colCode]?.toString().trim() || '';
    const rawTitle = row[colTitle]?.toString().trim() || '';
    const rawLevel = row[colLevel]?.toString().trim() || '';
    const rawUrl = (colUrl !== -1 ? row[colUrl]?.toString().trim() : '') || '';
    const rawCat = colCategory !== -1 ? row[colCategory]?.toString().trim() : '';
    const rawAgency = colAgency !== -1 ? row[colAgency]?.toString().trim() : '';

    // If completely empty or contains footer / note words, skip
    if (!rawTitle && !rawCode) continue;
    if (
      rawTitle.toLowerCase().includes('tổng số') ||
      rawTitle.toLowerCase().includes('ghi chú') ||
      rawStt.toLowerCase().includes('tổng số') ||
      rawCode.toLowerCase().includes('tổng số')
    ) continue;

    const parsedStt = parseInt(rawStt, 10);
    const stt = !isNaN(parsedStt) && parsedStt > 0 ? parsedStt : items.length + 1;

    // Use exact values from Column D (Cơ quan ban hành) and Column E (Lĩnh vực)
    let cleanAgency = rawAgency.replace(/\\n/g, '').replace(/[\r\n]+/g, ' ').trim();
    let cleanCategory = rawCat.replace(/\\n/g, '').replace(/[\r\n]+/g, ' ').trim();

    // Standardize casing and formatting
    if (cleanAgency.toLowerCase() === 'bộ tư pháp') cleanAgency = 'Bộ Tư pháp';
    if (cleanAgency.toLowerCase() === 'bộ công thương') cleanAgency = 'Bộ Công thương';

    if (cleanCategory === 'ài sản kết cấu hạ tầng chợ do Nhà nước đầu tư, quản lý') {
      cleanCategory = 'Tài sản kết cấu hạ tầng chợ do Nhà nước đầu tư, quản lý';
    }
    if (cleanCategory === 'hành lập và hoạt động doanh nghiệp (hộ kinh doanh)') {
      cleanCategory = 'Thành lập và hoạt động doanh nghiệp (hộ kinh doanh)';
    }
    if (cleanCategory === 'bảo vệ quyền lợi người tiêu dùng') {
      cleanCategory = 'Bảo vệ quyền lợi người tiêu dùng';
    }

    items.push({
      stt,
      code: rawCode || `TTHC-${stt}`,
      title: rawTitle.replace(/[\r\n]+/g, ' ').trim() || 'Thủ tục hành chính',
      level: normalizeLevel(rawLevel),
      url: rawUrl.startsWith('http') ? rawUrl : (rawUrl ? `https://${rawUrl}` : 'https://dichvucong.gov.vn'),
      category: cleanCategory || 'Chung',
      agency: cleanAgency || 'UBND Phường Trà Câu',
    });
  }

  // Sort by STT ascending
  items.sort((a, b) => a.stt - b.stt);
  return items;
}

/**
 * Parse CSV string into 2D array
 */
function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Fetch data directly from Google Sheets using OAuth Bearer Token (Google Sheets API v4)
 */
async function fetchViaGoogleSheetsApi(accessToken: string): Promise<SheetFetchResult> {
  // Step 1: Get spreadsheet metadata to locate sheet title for target gid or name
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets(properties(sheetId,title))`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!metaRes.ok) {
    const errorText = await metaRes.text();
    throw new Error(`Google Sheets API Error (${metaRes.status}): ${errorText}`);
  }

  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];

  let targetSheetTitle = '';
  const targetGidNum = parseInt(SPREADSHEET_GID, 10);

  // Match by sheetId / gid first, or by name 'TONG HOP TTHC'
  const matchedSheet = sheets.find(
    (s: any) =>
      s.properties?.sheetId === targetGidNum ||
      String(s.properties?.sheetId) === SPREADSHEET_GID ||
      (s.properties?.title && s.properties.title.toUpperCase().includes('TONG HOP'))
  );

  if (matchedSheet && matchedSheet.properties?.title) {
    targetSheetTitle = matchedSheet.properties.title;
  } else if (sheets.length > 0 && sheets[0].properties?.title) {
    targetSheetTitle = sheets[0].properties.title;
  } else {
    targetSheetTitle = SHEET_NAME_TARGET;
  }

  // Step 2: Fetch rows from the target sheet
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
    `'${targetSheetTitle}'!A1:Z5000`
  )}?valueRenderOption=FORMATTED_VALUE`;

  const valuesRes = await fetch(valuesUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!valuesRes.ok) {
    const errorText = await valuesRes.text();
    throw new Error(`Google Sheets API Values Error (${valuesRes.status}): ${errorText}`);
  }

  const valuesData = await valuesRes.json();
  const rows: string[][] = valuesData.values || [];

  const items = parseSheetRows(rows);
  if (items.length === 0) {
    throw new Error(`Bảng tính "${targetSheetTitle}" không chứa dòng dữ liệu TTHC hợp lệ nào.`);
  }

  const result: SheetFetchResult = {
    items,
    sheetTitle: targetSheetTitle,
    source: 'google-sheets-api',
    updatedAt: new Date().toISOString(),
  };

  // Cache to localStorage
  saveCachedSheetData(items, result.updatedAt);

  return result;
}

/**
 * Attempt to fetch via public CSV export (works if sheet is shared with link)
 */
async function fetchViaPublicExport(): Promise<SheetFetchResult> {
  const exportUrls = [
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SPREADSHEET_GID}`,
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${SPREADSHEET_GID}`,
  ];

  let lastError: any = null;

  for (const url of exportUrls) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) continue;

      const text = await res.text();
      // Check if redirected to Google sign-in HTML page
      if (text.includes('accounts.google.com') || text.includes('Sign in to your Google Account') || text.includes('<html')) {
        continue;
      }

      const rows = parseCsv(text);
      const items = parseSheetRows(rows);
      if (items.length > 0) {
        const result: SheetFetchResult = {
          items,
          sheetTitle: SHEET_NAME_TARGET,
          source: 'google-sheets-public-export',
          updatedAt: new Date().toISOString(),
        };
        saveCachedSheetData(items, result.updatedAt);
        return result;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Google Sheet yêu cầu quyền truy cập bằng tài khoản Google.');
}

/**
 * Main Sync Function: Automatically updates TTHC data from the single Google Sheets source
 */
export async function syncTthcFromGoogleSheet(accessToken?: string | null): Promise<SheetFetchResult> {
  // If we have an OAuth access token, use the Google Sheets API directly
  if (accessToken) {
    return await fetchViaGoogleSheetsApi(accessToken);
  }

  // Otherwise, attempt public export fetch
  try {
    return await fetchViaPublicExport();
  } catch (publicErr) {
    // Return cached data gracefully without throwing auth requirement banner
    const cached = getCachedSheetData();
    if (cached && cached.items.length > 0) {
      return {
        items: cached.items,
        sheetTitle: SHEET_NAME_TARGET,
        source: 'local-cache',
        updatedAt: cached.lastSynced || new Date().toISOString(),
      };
    }
    throw publicErr;
  }
}
