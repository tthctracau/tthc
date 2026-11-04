import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export an HTML container element to a downloadable PDF document
 */
export async function exportElementToPdf(
  element: HTMLElement,
  fileName: string = 'Danh_muc_TTHC_UBND_Phuong_Tra_Cau.pdf',
  onProgress?: (progress: number) => void
): Promise<void> {
  if (!element) {
    console.warn('PDF export element not found, falling back to window.print()');
    window.print();
    return;
  }

  if (onProgress) onProgress(10);

  try {
    // Configure canvas settings for crisp rendering
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    if (!canvas) {
      throw new Error('Canvas rendering failed');
    }

    if (onProgress) onProgress(60);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    if (onProgress) onProgress(90);

    pdf.save(fileName);

    if (onProgress) onProgress(100);
  } catch (error) {
    console.error('html2canvas export error, falling back to system print:', error);
    window.print();
  }
}

/**
 * Triggers native print preview for saving as PDF
 */
export function triggerPrintToPdf(): void {
  window.print();
}
