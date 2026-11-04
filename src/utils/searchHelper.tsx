import React from 'react';
import { TTHCItem } from '../types';

/**
 * Remove Vietnamese accents and convert to lowercase for accent-insensitive search
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Unified Search Matching
 * - Accent-insensitive (bỏ dấu tiếng Việt: "khai sinh" khớp "Khai sinh")
 * - Multi-word token matching (tất cả các từ khóa đều được tìm)
 * - Tự động tìm kiếm bao quát trên tất cả thông tin: Tên thủ tục, Mã TTHC, Lĩnh vực, Mức độ, Cơ quan ban hành
 * - Tính điểm độ phù hợp (relevance score) để xếp kết quả chính xác nhất lên đầu
 */
export function smartFilterItem(
  item: TTHCItem,
  query: string
): { matches: boolean; score: number } {
  const q = query.trim();
  if (!q) return { matches: true, score: 0 };

  const cleanQuery = removeVietnameseTones(q);
  const rawQuery = q.toLowerCase();
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  const agency = item.agency || 'UBND Phường Trà Câu';

  // Build field strings
  const titleRaw = item.title.toLowerCase();
  const titleClean = removeVietnameseTones(item.title);

  const codeRaw = item.code.toLowerCase();
  const codeClean = removeVietnameseTones(item.code);

  const catRaw = item.category.toLowerCase();
  const catClean = removeVietnameseTones(item.category);

  const levelRaw = item.level.toLowerCase();
  const levelClean = removeVietnameseTones(item.level);

  const agencyRaw = agency.toLowerCase();
  const agencyClean = removeVietnameseTones(agency);

  const sttStr = String(item.stt);

  // Combined searchable corpus
  const targetClean = `${titleClean} ${codeClean} ${catClean} ${levelClean} ${agencyClean} #${sttStr} stt:${sttStr}`;
  const targetRaw = `${titleRaw} ${codeRaw} ${catRaw} ${levelRaw} ${agencyRaw} #${sttStr}`;

  // Check if every token exists in the searchable string
  const allTokensMatch = queryTokens.every(
    (token) => targetClean.includes(token) || targetRaw.includes(token)
  );

  if (!allTokensMatch) {
    return { matches: false, score: 0 };
  }

  // Calculate relevance score
  let score = 1;

  // Exact phrase match in title
  if (titleRaw.includes(rawQuery) || titleClean.includes(cleanQuery)) {
    score += 50;
  }
  // Title starts with query
  if (titleRaw.startsWith(rawQuery) || titleClean.startsWith(cleanQuery)) {
    score += 30;
  }
  // Code exact match or prefix
  if (codeRaw === rawQuery || codeRaw.startsWith(rawQuery)) {
    score += 40;
  }
  // Category exact match
  if (catRaw === rawQuery || catClean === cleanQuery) {
    score += 25;
  }
  // Level exact match
  if (levelRaw === rawQuery || levelClean === cleanQuery) {
    score += 20;
  }
  // Agency exact match
  if (agencyRaw === rawQuery || agencyClean === cleanQuery) {
    score += 15;
  }

  return { matches: true, score };
}

/**
 * Highlight matched terms in text
 */
export const HighlightText: React.FC<{
  text: string;
  query: string;
  className?: string;
}> = ({ text, query, className = '' }) => {
  if (!query || !query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  const cleanQuery = removeVietnameseTones(query);
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Find occurrences using normalized matching
  const textClean = removeVietnameseTones(text);
  const matchedIntervals: [number, number][] = [];

  for (const token of tokens) {
    let pos = 0;
    while (pos < textClean.length) {
      const idx = textClean.indexOf(token, pos);
      if (idx === -1) break;
      matchedIntervals.push([idx, idx + token.length]);
      pos = idx + token.length;
    }
  }

  if (matchedIntervals.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Merge overlapping intervals
  matchedIntervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  let current = matchedIntervals[0];

  for (let i = 1; i < matchedIntervals.length; i++) {
    const next = matchedIntervals[i];
    if (next[0] <= current[1]) {
      current[1] = Math.max(current[1], next[1]);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  // Split text based on intervals
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  merged.forEach(([start, end], idx) => {
    if (start > lastIndex) {
      elements.push(text.slice(lastIndex, start));
    }
    elements.push(
      <mark
        key={idx}
        className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded"
      >
        {text.slice(start, end)}
      </mark>
    );
    lastIndex = end;
  });

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return <span className={className}>{elements}</span>;
};
