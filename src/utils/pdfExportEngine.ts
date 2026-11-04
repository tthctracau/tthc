import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import QRCode from 'qrcode';
import { TTHCItem } from '../types';

export interface PdfExportProgress {
  stage: 'preparing' | 'rendering' | 'saving' | 'done' | 'error';
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  message: string;
}

/**
 * Pre-generate crisp PNG QR code data URLs for every item to guarantee 100% canvas fidelity
 */
export async function pregenerateQrCodeMap(
  items: TTHCItem[],
  onProgress?: (percent: number) => void
): Promise<Map<string, string>> {
  const qrMap = new Map<string, string>();
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const key = `${item.stt}-${item.code}`;
    const url = item.url && item.url.trim() ? item.url.trim() : 'https://dichvucong.gov.vn';

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      qrMap.set(key, dataUrl);
    } catch (e) {
      console.warn('QR gen error for', item.code, e);
      qrMap.set(key, '');
    }

    if (onProgress && (i % 10 === 0 || i === total - 1)) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  return qrMap;
}

/**
 * Generate and download multi-page PDF from page elements
 */
export async function generateMultiPagePdf(
  pageElements: HTMLElement[],
  fileName: string = 'Danh_muc_TTHC_UBND_Phuong_Tra_Cau.pdf',
  onProgress?: (progress: PdfExportProgress) => void
): Promise<void> {
  const totalPages = pageElements.length;
  if (totalPages === 0) {
    throw new Error('Không có trang nào để xuất PDF.');
  }

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const a4WidthMm = 297;
  const a4HeightMm = 210;

  for (let i = 0; i < totalPages; i++) {
    const pageEl = pageElements[i];

    if (onProgress) {
      onProgress({
        stage: 'rendering',
        currentPage: i + 1,
        totalPages,
        progressPercent: Math.round(((i + 0.3) / totalPages) * 100),
        message: `Đang vẽ trang ${i + 1} / ${totalPages}...`,
      });
    }

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1280,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', 'landscape');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm);

    if (onProgress) {
      onProgress({
        stage: 'rendering',
        currentPage: i + 1,
        totalPages,
        progressPercent: Math.round(((i + 1) / totalPages) * 100),
        message: `Đã kết xuất xong trang ${i + 1} / ${totalPages}`,
      });
    }
  }

  if (onProgress) {
    onProgress({
      stage: 'saving',
      currentPage: totalPages,
      totalPages,
      progressPercent: 100,
      message: 'Đang tải tệp PDF xuống thiết bị...',
    });
  }

  pdf.save(fileName);

  if (onProgress) {
    onProgress({
      stage: 'done',
      currentPage: totalPages,
      totalPages,
      progressPercent: 100,
      message: 'Xuất file PDF thành công!',
    });
  }
}
