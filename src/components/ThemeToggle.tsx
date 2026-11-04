import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = true }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs select-none active:scale-95 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700'
          : 'bg-white/10 hover:bg-white/20 text-white border border-white/25'
      } ${className}`}
      title={isDark ? 'Chuyển sang Giao diện Sáng (Light Mode)' : 'Chuyển sang Giao diện Tối (Dark Mode)'}
      aria-label="Chuyển đổi giao diện sáng tối"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-yellow-300 animate-spin-slow transition-transform" />
        ) : (
          <Moon className="w-4 h-4 text-slate-100 transition-transform" />
        )}
      </div>
      {showLabel && (
        <span className="hidden sm:inline">
          {isDark ? 'Giao diện Tối' : 'Giao diện Sáng'}
        </span>
      )}
    </button>
  );
};
