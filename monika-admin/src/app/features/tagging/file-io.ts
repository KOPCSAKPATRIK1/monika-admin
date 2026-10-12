/** Saves text as a file using the browser's download. */
export function downloadText(fileName: string, content: string, mimeType: string): void {
  const file = new Blob([content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(file);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  // Free the memory once the download has started.
  setTimeout(() => URL.revokeObjectURL(url));
}

/**
 * Reads the file picked in an `<input type="file">`.
 * The input is cleared afterwards so the same file can be picked again.
 */
export async function readPickedFile(event: Event): Promise<string | null> {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return null;
  }

  const file = input.files[0];
  input.value = '';
  return await file.text();
}

/** Today's date like `2026-10-12`, used in file names. */
export function today(): string {
  return new Date().toISOString().substring(0, 10);
}
