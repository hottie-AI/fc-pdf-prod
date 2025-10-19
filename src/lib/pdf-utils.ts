import { PDFDocument } from 'pdf-lib';
import { SplitPageInfo, ProcessingProgress } from '@/types';

export interface SplitPDFOptions {
  onProgress?: (progress: ProcessingProgress) => void;
}

/**
 * PDF 파일을 개별 페이지로 분할
 * @param file - 분할할 PDF 파일
 * @param options - 진행률 콜백 옵션
 * @returns 분할된 페이지 정보 배열
 */
export async function splitPDF(
  file: File,
  options?: SplitPDFOptions
): Promise<SplitPageInfo[]> {
  const { onProgress } = options || {};

  try {
    // 1. PDF 파일 읽기
    onProgress?.({
      status: 'reading',
      currentPage: 0,
      totalPages: 0,
      percentage: 0,
      message: 'PDF 파일을 읽는 중...',
    });

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    if (totalPages === 0) {
      throw new Error('PDF에 페이지가 없습니다.');
    }

    onProgress?.({
      status: 'reading',
      currentPage: 0,
      totalPages,
      percentage: 10,
      message: `총 ${totalPages}개의 페이지를 발견했습니다.`,
    });

    // 2. 각 페이지를 개별 PDF로 분할
    const splitPages: SplitPageInfo[] = [];
    const baseFileName = file.name.replace(/\.pdf$/i, '');

    for (let i = 0; i < totalPages; i++) {
      onProgress?.({
        status: 'splitting',
        currentPage: i + 1,
        totalPages,
        percentage: 10 + Math.floor((i / totalPages) * 80),
        message: `페이지 ${i + 1}/${totalPages} 분할 중...`,
      });

      // 새로운 PDF 문서 생성
      const newPdf = await PDFDocument.create();

      // 현재 페이지를 복사
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);

      // PDF를 바이트 배열로 저장
      const pdfBytes = await newPdf.save();

      splitPages.push({
        pageNumber: i + 1,
        pdfBytes,
        fileName: `${baseFileName}_page_${String(i + 1).padStart(3, '0')}.pdf`,
      });
    }

    onProgress?.({
      status: 'splitting',
      currentPage: totalPages,
      totalPages,
      percentage: 90,
      message: '모든 페이지 분할 완료!',
    });

    return splitPages;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    throw new Error(`PDF 분할 실패: ${errorMessage}`);
  }
}

/**
 * PDF 페이지 수 가져오기
 * @param file - PDF 파일
 * @returns 페이지 수
 */
export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    throw new Error('PDF 페이지 수를 읽을 수 없습니다.');
  }
}

/**
 * PDF 파일 유효성 검사
 * @param file - 검사할 파일
 * @returns 유효 여부
 */
export async function validatePDF(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    await PDFDocument.load(arrayBuffer);
    return true;
  } catch {
    return false;
  }
}
