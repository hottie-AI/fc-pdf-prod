/**
 * PDF 페이지를 Canvas로 렌더링하여 썸네일 이미지 생성
 */
export async function generateThumbnail(
  pdfBytes: Uint8Array,
  pageNumber: number,
  options: {
    scale?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<string> {
  const { scale = 1.0, maxWidth = 300, maxHeight = 400 } = options;

  try {
    // 동적 import로 pdfjs-dist 로드 (클라이언트 사이드에서만)
    const pdfjsLib = await import('pdfjs-dist');

    // PDF.js 워커 설정
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    // PDF 문서 로드
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;

    // 페이지 가져오기
    const page = await pdf.getPage(pageNumber);

    // 뷰포트 계산
    let viewport = page.getViewport({ scale });

    // 최대 크기에 맞춰 스케일 조정
    const scaleX = maxWidth / viewport.width;
    const scaleY = maxHeight / viewport.height;
    const finalScale = Math.min(scaleX, scaleY, scale);

    viewport = page.getViewport({ scale: finalScale });

    // Canvas 생성
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context를 생성할 수 없습니다.');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 렌더링
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    // Canvas를 Data URL로 변환
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('썸네일 생성 실패:', error);
    throw new Error('PDF 썸네일 생성에 실패했습니다.');
  }
}

/**
 * 여러 페이지의 썸네일을 배치로 생성
 */
export async function generateThumbnails(
  pages: Array<{ pageNumber: number; pdfBytes: Uint8Array }>,
  options?: {
    scale?: number;
    maxWidth?: number;
    maxHeight?: number;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<Map<number, string>> {
  const thumbnails = new Map<number, string>();
  const total = pages.length;

  for (let i = 0; i < pages.length; i++) {
    const { pageNumber, pdfBytes } = pages[i];

    try {
      const dataUrl = await generateThumbnail(pdfBytes, 1, options); // 각 분할된 PDF는 1페이지
      thumbnails.set(pageNumber, dataUrl);

      if (options?.onProgress) {
        options.onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`페이지 ${pageNumber} 썸네일 생성 실패:`, error);
      // 실패한 경우 빈 문자열로 설정
      thumbnails.set(pageNumber, '');
    }
  }

  return thumbnails;
}
