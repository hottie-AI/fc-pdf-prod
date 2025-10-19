'use client';

import { useState, useCallback } from 'react';
import { ProgressIndicator } from '@/components/progress-indicator';
import { PageSelector } from '@/components/page-selector';
import { ErrorMessage } from '@/components/error-message';
import { ThemeToggle } from '@/components/theme-toggle';
import { InteractiveRobotSpline } from '@/components/ui/interactive-3d-robot';
import { UploadedFile, UploadState, ProcessingState, ProcessingProgress, SplitPageInfo } from '@/types';
import { splitPDF } from '@/lib/pdf-utils';
import { createZipFromPages, downloadZip, generateZipFileName } from '@/lib/zip-utils';
import { useDropzone } from 'react-dropzone';

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

  // Dropzone for the robot area
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate PDF
    if (file.type !== 'application/pdf') {
      handleError('PDF 파일만 업로드할 수 있습니다.');
      return;
    }

    // Create UploadedFile object
    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    handleFileSelect(uploadedFile);
  }, [handleFileSelect, handleError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    noClick: true, // Disable click to open file dialog
  });

  const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

  return (
    <main className="relative">
      <ThemeToggle />

      {showPageSelector && splitPages.length > 0 ? (
        // 페이지 선택 화면 - 기존 레이아웃 유지
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-colors">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                PDF Splitter
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                분할된 페이지를 선택하여 다운로드하세요.
              </p>
            </div>
            <PageSelector
              pages={splitPages}
              onDownloadSelected={handleDownloadSelected}
            />
          </div>
        </div>
      ) : processingState.isProcessing ? (
        // 처리 중 화면 - 기존 레이아웃 유지
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-colors">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                PDF Splitter
              </h1>
            </div>
            <ProgressIndicator progress={processingState.progress!} />
            {processingState.error && (
              <ErrorMessage
                error={processingState.error}
                onReset={resetAll}
                severity="error"
              />
            )}
          </div>
        </div>
      ) : (
        // 초기 화면 - 3D 로봇과 드래그앤드롭
        <div className="relative w-screen h-screen overflow-hidden" style={{ backgroundColor: '#010101' }}>
          {/* 텍스트 헤더 */}
          <div className="absolute top-0 left-0 right-0 z-10 pt-12 md:pt-16 lg:pt-20 px-4 md:px-8">
            <div className="text-center text-white w-full max-w-2xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 whitespace-nowrap">
                PDF 파일을 로봇 위로 드래그하세요
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl opacity-80">
                PDF를 페이지별로 분할하여 다운로드할 수 있습니다
              </p>
            </div>
          </div>

          {/* 중앙 로봇 드래그앤드롭 영역 */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div
              {...getRootProps()}
              className={`relative w-full max-w-3xl aspect-square max-h-[70vh] rounded-2xl overflow-hidden transition-all duration-300 ${
                isDragActive
                  ? 'ring-4 ring-blue-500 ring-offset-4 scale-105'
                  : 'hover:scale-102'
              }`}
            >
              <input {...getInputProps()} />

              {/* 3D 로봇 */}
              <div className="absolute inset-0 z-0">
                <InteractiveRobotSpline
                  scene={ROBOT_SCENE_URL}
                  className="w-full h-full"
                />
              </div>

              {/* 드래그 오버레이 */}
              {isDragActive && (
                <div className="absolute inset-0 z-20 bg-blue-500/30 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center text-white drop-shadow-lg">
                    <p className="text-2xl md:text-3xl font-bold">PDF 파일을 여기에 놓으세요</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {uploadState.error && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
              <ErrorMessage
                error={uploadState.error}
                onReset={resetAll}
                severity="error"
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
