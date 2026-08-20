import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;
function getWorker() {
  if (!workerPromise) {
    //Without errorHandler, tesseract.js rethrows worker failures onto the process
    //and takes the whole API down — an unreadable image is enough to do it.
    //recognize() rejects regardless, so callers still see the error.
    workerPromise = createWorker("eng", undefined, { errorHandler: () => {} });
  }
  return workerPromise;
}

export async function OcrImage(png: Uint8Array): Promise<string> {
  const worker = await getWorker();
  const res = await worker.recognize(Buffer.from(png));
  return res.data.text;
}

export async function shutdownOcr() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
