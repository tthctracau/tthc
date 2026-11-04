import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-red-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-700 border-2 border-yellow-400 rounded-full flex items-center justify-center shrink-0 shadow">
            <span className="text-yellow-300 text-2xl font-bold">★</span>
          </div>
          <div>
            <p className="text-yellow-300 font-bold tracking-wider text-xs uppercase">
              ỦY BÀN NHÂN DÂN PHƯỜNG TRÀ CÂU
            </p>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
              DANH MỤC THỦ TỤC HÀNH CHÍNH
            </h1>
            <p className="text-red-100 text-xs mt-0.5">
              Hệ thống tra cứu thông tin thủ tục hành chính thuộc thẩm quyền giải quyết của UBND Phường Trà Câu
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
