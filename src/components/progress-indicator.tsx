'use client';

import React from 'react';
import { ProcessingProgress } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, Archive, CheckCircle, File } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: ProcessingProgress;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'reading':
        return (
          <div className="relative">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <File className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      case 'splitting':
        return (
          <div className="relative">
            <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <FileText className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      case 'zipping':
        return (
          <div className="relative">
            <div className="h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <Archive className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      case 'complete':
        return (
          <div className="animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        );
      default:
        return <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'reading':
        return 'PDF 읽는 중';
      case 'splitting':
        return 'PDF 분할 중';
      case 'zipping':
        return 'ZIP 생성 중';
      case 'complete':
        return '처리 완료';
      default:
        return '처리 중';
    }
  };

  const getProgressBarColor = () => {
    switch (progress.status) {
      case 'reading':
        return 'bg-blue-600';
      case 'splitting':
        return 'bg-blue-600';
      case 'zipping':
        return 'bg-purple-600';
      case 'complete':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* 아이콘 및 상태 */}
          <div className="flex items-center justify-center py-4">
            {getStatusIcon()}
          </div>

          {/* 상태 텍스트 */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900 transition-all">
              {getStatusText()}
            </h3>
            <p className="text-sm text-gray-600 animate-pulse">
              {progress.message}
            </p>
          </div>

          {/* 진행률 바 */}
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`${getProgressBarColor()} h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                style={{ width: `${progress.percentage}%` }}
              >
                {/* 진행 바 애니메이션 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
                     style={{
                       backgroundSize: '200% 100%',
                       animation: 'shimmer 2s infinite'
                     }}
                />
              </div>
            </div>

            {/* 진행률 정보 */}
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-600">
                {progress.totalPages > 0 && progress.status !== 'reading'
                  ? `${progress.currentPage} / ${progress.totalPages} 페이지`
                  : '처리 중...'}
              </span>
              <span className="text-gray-900 font-bold tabular-nums">
                {progress.percentage}%
              </span>
            </div>
          </div>

          {/* 완료 시 추가 메시지 */}
          {progress.status === 'complete' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 mt-4 animate-fade-in">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  모든 작업이 완료되었습니다!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
