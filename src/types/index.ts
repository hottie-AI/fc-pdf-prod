export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadState {
  status: UploadStatus;
  file: UploadedFile | null;
  error: string | null;
}

// PDF 처리 관련 타입
export type ProcessingStatus = 'idle' | 'reading' | 'splitting' | 'zipping' | 'complete' | 'error';

export interface ProcessingProgress {
  status: ProcessingStatus;
  currentPage: number;
  totalPages: number;
  percentage: number;
  message: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  error: string | null;
}

export interface SplitPageInfo {
  pageNumber: number;
  pdfBytes: Uint8Array;
  fileName: string;
  selected?: boolean;
}
