'use client';

import { useState, useCallback } from 'react';
import { FileUpload } from '@/components/file-upload';
import { ProgressIndicator } from '@/components/progress-indicator';
import { PageSelector } from '@/components/page-selector';
import { ErrorMessage } from '@/components/error-message';
import { ThemeToggle } from '@/components/theme-toggle';
import { UploadedFile, UploadState, ProcessingState, ProcessingProgress, SplitPageInfo } from '@/types';
import { splitPDF } from '@/lib/pdf-utils';
import { createZipFromPages, downloadZip, generateZipFileName } from '@/lib/zip-utils';

export default function Home() {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    file: null,
    error: null,
  });

  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: null,
    error: null,
  });

  const [splitPages, setSplitPages] = useState<SplitPageInfo[]>([]);
  const [showPageSelector, setShowPageSelector] = useState(false);

  const handleProgress = useCallback((progress: ProcessingProgress) => {
    setProcessingState(prev => ({
      ...prev,
      progress,
    }));
  }, []);

  const resetAll = useCallback(() => {
    setUploadState({
      status: 'idle',
      file: null,
      error: null,
    });
    setProcessingState({
      isProcessing: false,
      progress: null,
      error: null,
    });
    setSplitPages([]);
    setShowPageSelector(false);
  }, []);

  const processPDF = useCallback(async (file: UploadedFile) => {
    try {
      setProcessingState({
        isProcessing: true,
        progress: {
          status: 'reading',
          currentPage: 0,
          totalPages: 0,
          percentage: 0,
          message: 'PDF 처리를 시작합니다...',
        },
        error: null,
      });

      // PDF 분할
      const pages = await splitPDF(file.file, {
        onProgress: handleProgress,
      });

      setSplitPages(pages);

      // 완료 상태로 설정
      setProcessingState({
        isProcessing: false,
        progress: {
          status: 'complete',
          currentPage: pages.length,
          totalPages: pages.length,
          percentage: 100,
          message: '분할이 완료되었습니다!',
        },
        error: null,
      });

      // 페이지 선택 화면으로 전환
      setShowPageSelector(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setProcessingState({
        isProcessing: false,
        progress: null,
        error: errorMessage,
      });
    }
  }, [handleProgress]);

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setUploadState({
      status: 'success',
      file,
      error: null,
    });
    // 파일 선택 즉시 자동으로 처리 시작
    processPDF(file);
  }, [processPDF]);

  const handleError = useCallback((error: string) => {
    setUploadState({
      status: 'error',
      file: null,
      error,
    });
  }, []);

  const handleDownloadSelected = useCallback(async (selectedPages: SplitPageInfo[]) => {
    if (selectedPages.length === 0) {
      alert('다운로드할 페이지를 선택해주세요.');
      return;
    }

    try {
      const zipFileName = generateZipFileName(uploadState.file?.name || 'document.pdf');
      const zipBlob = await createZipFromPages(selectedPages, zipFileName);
      downloadZip(zipBlob, zipFileName);
    } catch (error) {
      alert('ZIP 파일 생성 중 오류가 발생했습니다.');
    }
  }, [uploadState.file]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-colors">
      <ThemeToggle />
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            PDF Splitter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            PDF 파일을 페이지별로 분할하여 개별 파일로 다운로드할 수 있는 도구입니다.
            간단하게 파일을 업로드하고 원하는 페이지를 선택해서 다운로드하세요.
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="mb-8">
          {showPageSelector && splitPages.length > 0 ? (
            // 페이지 선택 화면
            <PageSelector
              pages={splitPages}
              onDownloadSelected={handleDownloadSelected}
            />
          ) : processingState.isProcessing ? (
            // 처리 중 화면
            <ProgressIndicator progress={processingState.progress!} />
          ) : (
            // 파일 업로드 화면
            <FileUpload
              onFileSelect={handleFileSelect}
              onError={handleError}
              uploadState={uploadState}
            />
          )}
        </div>

        {/* 처리 에러 표시 */}
        {processingState.error && (
          <ErrorMessage
            error={processingState.error}
            onReset={resetAll}
            severity="error"
          />
        )}
      </div>
    </main>
  );
}
