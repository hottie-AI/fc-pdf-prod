'use client';

import React, { useState, useEffect } from 'react';
import { SplitPageInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileArchive, CheckSquare, Square } from 'lucide-react';

interface PageSelectorProps {
  pages: SplitPageInfo[];
  onDownloadSelected: (selectedPages: SplitPageInfo[]) => void;
  onReset: () => void;
}

export function PageSelector({ pages, onDownloadSelected, onReset }: PageSelectorProps) {
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // 초기에 모든 페이지 선택
    setSelectedPages(new Set(pages.map(p => p.pageNumber)));
    setSelectAll(true);
  }, [pages]);

  const togglePage = (pageNumber: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNumber)) {
      newSelected.delete(pageNumber);
    } else {
      newSelected.add(pageNumber);
    }
    setSelectedPages(newSelected);
    setSelectAll(newSelected.size === pages.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPages(new Set());
      setSelectAll(false);
    } else {
      setSelectedPages(new Set(pages.map(p => p.pageNumber)));
      setSelectAll(true);
    }
  };

  const handleDownloadSelected = () => {
    const selected = pages.filter(p => selectedPages.has(p.pageNumber));
    onDownloadSelected(selected);
  };

  const downloadSinglePage = (page: SplitPageInfo) => {
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
    <Card className="w-full max-w-4xl mx-auto shadow-xl animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            분할된 페이지 ({pages.length}개)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              {selectAll ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4" />}
              전체 선택
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="hover:bg-gray-100 transition-colors"
            >
              다시 업로드
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* 페이지 리스트 */}
        <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4 bg-gray-50/50">
          {pages.map((page, index) => {
            const isSelected = selectedPages.has(page.pageNumber);
            return (
              <div
                key={page.pageNumber}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm hover:scale-[1.01]'
                }`}
                onClick={() => togglePage(page.pageNumber)}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-blue-600 animate-scale-in" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      페이지 {page.pageNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {page.fileName} • {formatFileSize(page.pdfBytes.length)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSinglePage(page);
                  }}
                  className="flex items-center gap-2 hover:bg-blue-100 transition-all hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  다운로드
                </Button>
              </div>
            );
          })}
        </div>

        {/* 선택 정보 및 다운로드 버튼 */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-5 space-y-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-gray-700">
                {selectedPages.size}개 페이지 선택됨
              </span>
            </div>
            <span className="text-gray-700 font-semibold">
              총 크기: {formatFileSize(
                pages
                  .filter(p => selectedPages.has(p.pageNumber))
                  .reduce((sum, p) => sum + p.pdfBytes.length, 0)
              )}
            </span>
          </div>

          <Button
            onClick={handleDownloadSelected}
            disabled={selectedPages.size === 0}
            className="w-full flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
          >
            <FileArchive className="h-4 w-4" />
            선택한 페이지 ZIP으로 다운로드 ({selectedPages.size}개)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
