'use client';

import React, { useState, useEffect } from 'react';
import { SplitPageInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, FileArchive, FileText } from 'lucide-react';

interface PageSelectorProps {
  pages: SplitPageInfo[];
  onDownloadSelected: (selectedPages: SplitPageInfo[]) => void;
}

export function PageSelector({ pages, onDownloadSelected }: PageSelectorProps) {
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  useEffect(() => {
    // 초기에 모든 페이지 선택
    setSelectedPages(new Set(pages.map(p => p.pageNumber)));
  }, [pages]);

  const togglePage = (pageNumber: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNumber)) {
      newSelected.delete(pageNumber);
    } else {
      newSelected.add(pageNumber);
    }
    setSelectedPages(newSelected);
  };

  const handleDownloadSelected = () => {
    const selected = pages.filter(p => selectedPages.has(p.pageNumber));
    onDownloadSelected(selected);
  };

  const downloadSinglePage = (page: SplitPageInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([page.pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = page.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Grid 레이아웃 - 4열 고정 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {pages.map((page, index) => {
          const isSelected = selectedPages.has(page.pageNumber);

          return (
            <div
              key={page.pageNumber}
              className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 shadow-lg scale-105'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
              }`}
              onClick={() => togglePage(page.pageNumber)}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* 체크박스 오버레이 */}
              <div className="absolute top-2 left-2 z-10">
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600'
                      : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500 group-hover:border-blue-400 dark:group-hover:border-blue-500'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* PDF 아이콘 */}
              <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center relative p-3">
                <FileText className="h-10 w-10 text-red-500 dark:text-red-400 mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {page.pageNumber}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatFileSize(page.pdfBytes.length)}
                </p>
              </div>

              {/* 페이지 정보 */}
              <div className="bg-white dark:bg-gray-800 p-2 border-t dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-center mb-1.5 text-xs">
                  페이지 {page.pageNumber}
                </p>

                {/* 개별 다운로드 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => downloadSinglePage(page, e)}
                  className="w-full flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-colors text-xs py-1.5"
                >
                  <Download className="h-3 w-3" />
                  다운로드
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 ZIP 다운로드 버튼 */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 shadow-lg rounded-t-xl p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {selectedPages.size}개 페이지 선택됨
              </span>
            </div>
          </div>

          <Button
            onClick={handleDownloadSelected}
            disabled={selectedPages.size === 0}
            size="lg"
            className="w-full flex items-center justify-center gap-3 text-lg py-6 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
          >
            <FileArchive className="h-5 w-5" />
            선택한 페이지 ZIP으로 다운로드 ({selectedPages.size}개)
          </Button>
        </div>
      </div>
    </div>
  );
}
