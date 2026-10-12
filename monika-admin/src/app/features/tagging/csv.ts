/**
 * Invisible character at the start of a UTF-8 file. Excel needs it to show
 * accented characters (á, ő, ű…) correctly, and some files start with it.
 */
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

/**
 * Reads CSV text into rows of cells. Handles quoted cells ("a, b"), doubled quotes
 * inside quotes (""), line breaks inside quotes and Windows line endings.
 * The separator (`,` or `;`) is detected from the first line, because Hungarian Excel saves with `;`.
 */
export function parseCsv(text: string): string[][] {
  if (text.startsWith(BYTE_ORDER_MARK)) {
    text = text.substring(1);
  }
  const separator = detectSeparator(text);

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        // Two quotes inside a quoted cell mean one real quote character.
        currentCell += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentCell += char;
      }
    } else if (char === '"') {
      insideQuotes = true;
    } else if (char === separator) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  currentRow.push(currentCell);
  rows.push(currentRow);

  // Leave out empty lines.
  const nonEmptyRows: string[][] = [];
  for (const row of rows) {
    const hasContent = row.some((cell) => cell.trim() !== '');
    if (hasContent) {
      nonEmptyRows.push(row);
    }
  }
  return nonEmptyRows;
}

/** Writes rows as CSV text, separated with `;` so Hungarian Excel opens it in columns. */
export function toCsv(rows: string[][]): string {
  const separator = ';';
  const lines: string[] = [];

  for (const row of rows) {
    const cells: string[] = [];
    for (const cell of row) {
      const needsQuotes =
        cell.includes('"') ||
        cell.includes('\n') ||
        cell.includes('\r') ||
        cell.includes(separator);
      if (needsQuotes) {
        cells.push('"' + cell.replaceAll('"', '""') + '"');
      } else {
        cells.push(cell);
      }
    }
    lines.push(cells.join(separator));
  }

  return BYTE_ORDER_MARK + lines.join('\r\n') + '\r\n';
}

/** Counts `,` and `;` in the first line (outside quotes) and picks the more common one. */
function detectSeparator(text: string): string {
  let commas = 0;
  let semicolons = 0;
  let insideQuotes = false;

  for (const char of text) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (!insideQuotes && (char === '\n' || char === '\r')) {
      break;
    } else if (!insideQuotes && char === ',') {
      commas++;
    } else if (!insideQuotes && char === ';') {
      semicolons++;
    }
  }

  if (semicolons > commas) {
    return ';';
  }
  return ',';
}
