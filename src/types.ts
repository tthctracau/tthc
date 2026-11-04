export type ServiceLevel = 'Toàn trình' | 'Một phần';

export type Category = string;

export interface TTHCItem {
  stt: number;
  code: string;
  title: string;
  level: ServiceLevel;
  url: string;
  category: string; // Cột E trong bảng "TONG HOP TTHC": Lĩnh vực
  agency: string;   // Cột D trong bảng "TONG HOP TTHC": Cơ quan ban hành
  // Chi tiết mở rộng (Thành phần hồ sơ, thời hạn giải quyết, phí lệ phí)
  dossier?: string[];        // Thành phần hồ sơ
  duration?: string;          // Thời hạn giải quyết
  fee?: string;               // Phí, lệ phí
  submissionMethod?: string[]; // Cách thức thực hiện
  result?: string;            // Kết quả thực hiện
  agencyExecution?: string;   // Cơ quan tiếp nhận & giải quyết
}


export interface FilterState {
  search: string;
  category: string;
  level: string;
  agency: string;
}
