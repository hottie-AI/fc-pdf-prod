'use client';

import { useState, useCallback } from 'react';
import { FileUpload } from '@/components/file-upload';
import { ProgressIndicator } from '@/components/progress-indicator';
import { PageSelector } from '@/components/page-selector';
import { ErrorMessage } from '@/components/error-message';
import { UploadedFile, UploadState, ProcessingState, ProcessingProgress, SplitPageInfo } from '@/types';
import { splitPDF } from '@/lib/pdf-utils';
import { createZipFromPages, downloadZip, generateZipFileName } from '@/lib/zip-utils';
import { Button } from '@/components/ui/button';

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
  }, []);

  const handleError = useCallback((error: string) => {
    setUploadState({
      status: 'error',
      file: null,
      error,
    });
  }, []);

  const handleStartProcessing = useCallback(() => {
    if (uploadState.file) {
      processPDF(uploadState.file);
    }
  }, [uploadState.file, processPDF]);

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF Splitter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              onReset={resetAll}
            />
          ) : processingState.isProcessing ? (
            // 처리 중 화면
            <ProgressIndicator progress={processingState.progress!} />
          ) : (
            // 파일 업로드 화면
            <>
              <FileUpload
                onFileSelect={handleFileSelect}
                onError={handleError}
                uploadState={uploadState}
              />
              {uploadState.status === 'success' && uploadState.file && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handleStartProcessing}
                    size="lg"
                    className="px-8"
                  >
                    분할 시작하기
                  </Button>
                </div>
              )}
            </>
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

        {/* 기능 안내 - 페이지 선택 화면이 아닐 때만 표시 */}
        {!showPageSelector && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">간편한 업로드</h3>
                  <p className="text-sm text-gray-600">
                    드래그 앤 드롭 또는 클릭으로 PDF 파일을 쉽게 업로드하세요.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">선택적 다운로드</h3>
                  <p className="text-sm text-gray-600">
                    원하는 페이지만 선택하여 개별 또는 ZIP으로 다운로드합니다.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">안전한 처리</h3>
                  <p className="text-sm text-gray-600">
                    모든 처리는 브라우저에서 이루어지며, 서버로 파일이 전송되지 않습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 사용 안내 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">사용 방법</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>위의 업로드 영역에 PDF 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요.</li>
                <li>&quot;분할 시작하기&quot; 버튼을 클릭하여 페이지별 분할을 시작합니다.</li>
                <li>분할이 완료되면 원하는 페이지를 선택할 수 있습니다.</li>
                <li>개별 페이지를 다운로드하거나 선택한 페이지들을 ZIP으로 다운로드합니다.</li>
              </ol>
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">주의사항</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>PDF 파일만 업로드 가능합니다.</li>
                <li>파일 크기는 최대 100MB까지 지원합니다.</li>
                <li>모든 처리는 브라우저에서 이루어지며, 서버로 파일이 전송되지 않습니다.</li>
                <li>대용량 파일의 경우 처리 시간이 오래 걸릴 수 있습니다.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
