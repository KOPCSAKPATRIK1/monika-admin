import { MergeResult } from './tagging.store';

/** The alert shown after an import. */
export interface ImportMessage {
  type: 'success' | 'warning' | 'danger';
  text: string;
  /** The skipped rows and why they were skipped. */
  details: string[];
}

export function importSucceeded(merge: MergeResult, skippedRows: string[]): ImportMessage {
  const imported = merge.added + merge.updated;
  let text = 'Imported ' + imported + ' rows: ' + merge.added + ' added, ' + merge.updated + ' updated.';

  if (skippedRows.length > 0) {
    text += ' ' + skippedRows.length + ' rows were skipped:';
    return { type: 'warning', text: text, details: skippedRows };
  }
  return { type: 'success', text: text, details: [] };
}

export function importFailed(error: unknown): ImportMessage {
  let text = 'The file could not be read.';
  if (error instanceof Error) {
    text = error.message;
  }
  return { type: 'danger', text: text, details: [] };
}
