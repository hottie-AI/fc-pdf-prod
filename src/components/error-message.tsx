'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  onReset?: () => void;
  severity?: 'error' | 'warning';
}

export function ErrorMessage({
  error,
  onRetry,
  onReset,
  severity = 'error'
}: ErrorMessageProps) {

  const getErrorDetails = (errorMessage: string) => {
    // 일반적인 에러 패턴에 따른 도움말 제공
    if (errorMessage.includes('PDF') && errorMessage.includes('분할')) {
      return {
        title: 'PDF 분할 실패',
        suggestions: [
          'PDF 파일이 손상되었을 수 있습니다.',
          'PDF가 암호로 보호되어 있는지 확인해주세요.',
          '다른 PDF 파일로 다시 시도해보세요.',
        ]
      };
    } else if (errorMessage.includes('ZIP')) {
      return {
        title: 'ZIP 생성 실패',
        suggestions: [
          '브라우저 메모리가 부족할 수 있습니다.',
          '페이지 수가 많은 경우 선택한 페이지만 다운로드 해보세요.',
          '브라우저를 새로고침 후 다시 시도해주세요.',
        ]
      };
    } else if (errorMessage.includes('메모리') || errorMessage.includes('memory')) {
      return {
        title: '메모리 부족',
        suggestions: [
          '파일 크기가 너무 큽니다. 더 작은 파일로 시도해주세요.',
          '다른 탭을 닫고 다시 시도해보세요.',
          '브라우저를 재시작 후 시도해주세요.',
        ]
      };
    } else {
      return {
        title: '처리 중 오류 발생',
        suggestions: [
          '인터넷 연결을 확인해주세요.',
          '브라우저를 새로고침 후 다시 시도해주세요.',
          '문제가 계속되면 다른 브라우저를 사용해보세요.',
        ]
      };
    }
  };

  const errorDetails = getErrorDetails(error);
  const bgColor = severity === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = severity === 'error' ? 'border-red-300' : 'border-yellow-300';
  const textColor = severity === 'error' ? 'text-red-800' : 'text-yellow-800';
  const iconColor = severity === 'error' ? 'text-red-600' : 'text-yellow-600';

  return (
    <Card className={`w-full max-w-2xl mx-auto ${bgColor} border-2 ${borderColor} shadow-lg`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 에러 헤더 */}
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${textColor}`}>
                {errorDetails.title}
              </h3>
              <p className={`text-sm ${textColor} mt-1`}>
                {error}
              </p>
            </div>
          </div>

          {/* 제안사항 */}
          <div className={`${bgColor} rounded-lg p-4 border ${borderColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className={`h-4 w-4 ${iconColor}`} />
              <h4 className={`text-sm font-semibold ${textColor}`}>
                해결 방법
              </h4>
            </div>
            <ul className={`text-sm ${textColor} space-y-1.5 ml-6 list-disc`}>
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-2"
                variant="default"
              >
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
            )}
            {onReset && (
              <Button
                onClick={onReset}
                className="flex-1 flex items-center justify-center gap-2"
                variant="outline"
              >
                <Home className="h-4 w-4" />
                처음부터 시작
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
