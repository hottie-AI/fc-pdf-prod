import JSZip from 'jszip';
import { SplitPageInfo, ProcessingProgress } from '@/types';

export interface CreateZipOptions {
  onProgress?: (progress: ProcessingProgress) => void;
}

/**
 * 분할된 PDF 페이지들을 ZIP 파일로 압축
 * @param splitPages - 분할된 페이지 정보 배열
 * @param zipFileName - ZIP 파일 이름
 * @param options - 진행률 콜백 옵션
 * @returns ZIP 파일 Blob
 */
export async function createZipFromPages(
  splitPages: SplitPageInfo[],
  zipFileName: string,
  options?: CreateZipOptions
): Promise<Blob> {
  const { onProgress } = options || {};

  try {
    const zip = new JSZip();
    const totalPages = splitPages.length;

    onProgress?.({
      status: 'zipping',
      currentPage: 0,
      totalPages,
      percentage: 90,
      message: 'ZIP 파일 생성 중...',
    });

    // 각 페이지를 ZIP에 추가
    splitPages.forEach((page, index) => {
      zip.file(page.fileName, page.pdfBytes);

      onProgress?.({
        status: 'zipping',
        currentPage: index + 1,
        totalPages,
        percentage: 90 + Math.floor((index / totalPages) * 8),
        message: `ZIP 파일에 ${index + 1}/${totalPages} 페이지 추가 중...`,
      });
    });

    onProgress?.({
      status: 'zipping',
      currentPage: totalPages,
      totalPages,
      percentage: 98,
      message: 'ZIP 파일 압축 중...',
    });

    // ZIP 파일 생성
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // 0-9 (0: 압축 안 함, 9: 최대 압축)
      },
    });

    onProgress?.({
      status: 'complete',
      currentPage: totalPages,
      totalPages,
      percentage: 100,
      message: 'ZIP 파일 생성 완료!',
    });

    return zipBlob;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    throw new Error(`ZIP 생성 실패: ${errorMessage}`);
  }
}

/**
 * ZIP 파일 다운로드
 * @param blob - ZIP 파일 Blob
 * @param fileName - 다운로드할 파일 이름
 */
export function downloadZip(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 메모리 해제
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * ZIP 파일 이름 생성
 * @param originalFileName - 원본 파일 이름
 * @returns ZIP 파일 이름
 */
export function generateZipFileName(originalFileName: string): string {
  const baseName = originalFileName.replace(/\.pdf$/i, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}_split_${timestamp}.zip`;
}
