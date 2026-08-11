import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;
function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng");
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
