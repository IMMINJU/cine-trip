import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
};

export async function compressImage(file: File): Promise<File> {
  // 이미 작은 이미지는 압축하지 않음
  if (file.size < 500 * 1024) {
    return file;
  }

  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    return compressedFile;
  } catch {
    // 압축 실패 시 원본 반환
    return file;
  }
}

export async function fileToBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export async function compressAndConvertToBuffer(
  file: File
): Promise<ArrayBuffer> {
  const compressed = await compressImage(file);
  return fileToBuffer(compressed);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
