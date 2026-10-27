import { jsPDF } from 'jspdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
export async function digitize(
  file: File,
  progress: (message: string) => void,
) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  const pdf = new jsPDF();
  let pageCount = 0;
  const texts: string[] = [];
  const append = (
    image: string,
    text: string,
    width: number,
    height: number,
  ) => {
    if (pageCount++) pdf.addPage();
    const scale = Math.min(190 / width, 250 / height);
    pdf.addImage(
      image,
      'JPEG',
      10,
      10,
      width * scale,
      height * scale,
      undefined,
      'FAST',
    );
    const lines = pdf.splitTextToSize(text, 180);
    for (let i = 0; i < lines.length; i += 45) {
      pdf.addPage();
      pdf.setFontSize(11);
      pdf.text(lines.slice(i, i + 45), 15, 20);
    }
    texts.push(text);
  };
  try {
    if (file.type === 'application/pdf') {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
      const pdfDocument = await loadingTask.promise;
      try {
        if (pdfDocument.numPages > 10)
          throw Error('Digitize PDFs in batches of at most 10 pages.');
        for (let i = 1; i <= pdfDocument.numPages; i++) {
          progress(`Reading ${file.name}: page ${i}/${pdfDocument.numPages}`);
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 1.25 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({
            canvas,
            canvasContext: canvas.getContext('2d')!,
            viewport,
          }).promise;
          const existing = (await page.getTextContent()).items
            .map((item: any) => item.str || '')
            .join(' ');
          const text =
            existing.trim().length > 20
              ? existing
              : (await worker.recognize(canvas)).data.text;
          append(
            canvas.toDataURL('image/jpeg', 0.7),
            text,
            canvas.width,
            canvas.height,
          );
        }
      } finally {
        await loadingTask.destroy();
      }
    } else {
      progress(`Digitizing ${file.name}…`);
      const image = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, 1600 / Math.max(image.width, image.height));
      canvas.width = image.width * ratio;
      canvas.height = image.height * ratio;
      canvas
        .getContext('2d')!
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      append(
        canvas.toDataURL('image/jpeg', 0.8),
        (await worker.recognize(canvas)).data.text,
        canvas.width,
        canvas.height,
      );
    }
    return {
      content: pdf
        .output('datauristring')
        .replace(
          'data:application/pdf;filename=generated.pdf;',
          'data:application/pdf;',
        ),
      text: texts.join('\n\n'),
      type: 'application/pdf',
    };
  } finally {
    await worker.terminate();
  }
}
