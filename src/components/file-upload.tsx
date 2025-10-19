'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadedFile, UploadState } from '@/types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  onError: (error: string) => void;
  uploadState: UploadState;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function FileUpload({ onFileSelect, onError, uploadState, disabled = false }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'PDF 파일만 업로드할 수 있습니다.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '파일 크기는 100MB를 초과할 수 없습니다.';
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      onError(error);
      return;
    }

    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    onFileSelect(uploadedFile);
  }, [onFileSelect, onError]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  }, [handleFileSelect]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    disabled,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadAreaClasses = () => {
    const baseClasses = "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out";
    const cursorClass = disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-[1.02]";

    if (disabled) {
      return `${baseClasses} ${cursorClass} border-gray-300 bg-gray-50 text-gray-400`;
    }

    if (uploadState.status === 'error' || isDragReject) {
      return `${baseClasses} ${cursorClass} border-red-400 bg-red-50/50 text-red-700 shadow-sm`;
    }

    if (isDragActive) {
      return `${baseClasses} ${cursorClass} border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-[1.02]`;
    }

    if (uploadState.status === 'success') {
      return `${baseClasses} ${cursorClass} border-green-500 bg-green-50 text-green-700 shadow-md`;
    }

    return `${baseClasses} ${cursorClass} border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 hover:shadow-md`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={getUploadAreaClasses()}
          role="button"
          tabIndex={0}
          aria-label="PDF 파일 업로드"
        >
          <input {...getInputProps()} />

          {uploadState.status === 'success' && uploadState.file ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-30 animate-pulse" />
                  <File className="h-16 w-16 text-green-600 relative" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800">
                  파일 업로드 완료
                </h3>
                <p className="text-sm text-green-600 mt-2 font-medium">
                  {uploadState.file.name}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  크기: {formatFileSize(uploadState.file.size)}
                </p>
              </div>
            </div>
          ) : uploadState.status === 'error' ? (
            <div className="space-y-4 animate-shake">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-16 w-16 text-red-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-800">
                  업로드 실패
                </h3>
                <p className="text-sm text-red-600 mt-2">
                  {uploadState.error}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className={`h-16 w-16 text-gray-400 transition-transform duration-300 ${isDragActive ? 'scale-110 text-blue-600' : ''}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isDragActive ? '파일을 여기에 놓으세요' : 'PDF 파일을 업로드하세요'}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {isDragActive ? '파일을 놓으면 업로드가 시작됩니다' : '드래그 앤 드롭하거나 클릭하여 파일을 선택하세요'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <p className="text-xs text-gray-500">
                    최대 100MB까지 지원
                  </p>
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <p className="text-xs text-gray-500">
                    PDF 형식만 가능
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
