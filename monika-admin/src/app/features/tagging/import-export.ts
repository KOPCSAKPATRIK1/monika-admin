import { parseCsv, toCsv } from './csv';
import {
  Segment,
  SegmentData,
  TIMESTAMP_PATTERN,
  Video,
  secondsToTimestamp,
  splitList,
  toSegmentData,
} from './tagging.models';

export interface ImportResult<T> {
  items: T[];
  /** Human-readable reasons for rows that were skipped. */
  errors: string[];
}

/** One row of the imported file, with the field names already translated. */
interface ImportedRow {
  values: Record<string, unknown>;
  /** Row number as the user sees it in the file (1-based, header row included). */
  rowNumber: number;
}

/** Column order from the spec, used when the CSV has no header row. */
const SEGMENT_COLUMNS = ['topics', 'keywords', 'title', 'description', 'videoId', 'timestamp'];
const VIDEO_COLUMNS = ['videoId', 'title', 'url', 'duration'];

/**
 * Accepted column names (English and Hungarian) and the field they belong to.
 * The names are written without accents, spaces and capitals – see `simplifyColumnName`.
 */
const COLUMN_NAMES: Record<string, string> = {
  topics: 'topics',
  tags: 'topics',
  tagek: 'topics',
  tagok: 'topics',
  temakor: 'topics',
  temakorok: 'topics',

  keywords: 'keywords',
  kulcsszavak: 'keywords',
  pluszkulcsszavak: 'keywords',

  title: 'title',
  cim: 'title',
  rovidcim: 'title',

  description: 'description',
  leiras: 'description',

  videoid: 'videoId',
  video: 'videoId',
  videoazonosito: 'videoId',
  fajlnev: 'videoId',
  filename: 'videoId',

  timestamp: 'timestamp',
  time: 'timestamp',
  start: 'timestamp',
  ido: 'timestamp',
  idopont: 'timestamp',
  percmasodperc: 'timestamp',

  url: 'url',
  path: 'url',
  eleresiut: 'url',

  duration: 'duration',
  length: 'duration',
  hossz: 'duration',
};

// ---- Import ----

/** Reads segments from CSV or JSON text. */
export function importSegments(text: string): ImportResult<SegmentData> {
  const rows = readRows(text, SEGMENT_COLUMNS, 'segments');
  const result: ImportResult<SegmentData> = { items: [], errors: [] };

  for (const row of rows) {
    const videoId = toText(row.values['videoId']);
    const timestamp = toTimestamp(row.values['timestamp']);

    const problems: string[] = [];
    if (videoId === '') {
      problems.push('missing video id');
    }
    if (timestamp === null) {
      problems.push('invalid time "' + toText(row.values['timestamp']) + '"');
    }

    if (problems.length > 0) {
      result.errors.push('Row ' + row.rowNumber + ': ' + problems.join(', '));
    } else {
      result.items.push({
        topics: toList(row.values['topics']),
        keywords: toList(row.values['keywords']),
        title: toText(row.values['title']),
        description: toText(row.values['description']),
        videoId: videoId,
        timestamp: timestamp ?? '',
      });
    }
  }

  return result;
}

/** Reads videos from CSV or JSON text. */
export function importVideos(text: string): ImportResult<Video> {
  const rows = readRows(text, VIDEO_COLUMNS, 'videos');
  const result: ImportResult<Video> = { items: [], errors: [] };

  for (const row of rows) {
    const videoId = toText(row.values['videoId']);
    const durationText = toText(row.values['duration']);

    // The duration is optional, but when it is there it must be valid.
    let duration = '';
    if (durationText !== '') {
      duration = toTimestamp(row.values['duration']) ?? '';
    }

    const problems: string[] = [];
    if (videoId === '') {
      problems.push('missing video id');
    }
    if (durationText !== '' && duration === '') {
      problems.push('invalid duration "' + durationText + '"');
    }

    if (problems.length > 0) {
      result.errors.push('Row ' + row.rowNumber + ': ' + problems.join(', '));
    } else {
      result.items.push({
        videoId: videoId,
        title: toText(row.values['title']),
        url: toText(row.values['url']),
        duration: duration,
      });
    }
  }

  return result;
}

/** Decides from the first character whether the text is JSON or CSV. */
function readRows(text: string, columns: string[], jsonKey: string): ImportedRow[] {
  const trimmed = text.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return readJsonRows(trimmed, jsonKey);
  }
  return readCsvRows(trimmed, columns);
}

/**
 * Uses the header row when it contains known column names.
 * Without a header the columns are read in the order given in the spec.
 */
function readCsvRows(text: string, columns: string[]): ImportedRow[] {
  const csvRows = parseCsv(text);
  if (csvRows.length === 0) {
    return [];
  }

  // Translate the first row into field names, e.g. "Fájlnév" -> "videoId".
  const headerFields: string[] = [];
  let knownColumnCount = 0;
  for (const cell of csvRows[0]) {
    const field = COLUMN_NAMES[simplifyColumnName(cell)] ?? '';
    headerFields.push(field);
    if (columns.includes(field)) {
      knownColumnCount++;
    }
  }

  const hasHeader = knownColumnCount >= 2;
  let fields = columns;
  let firstDataRow = 0;
  if (hasHeader) {
    fields = headerFields;
    firstDataRow = 1;
  }

  const rows: ImportedRow[] = [];
  for (let rowIndex = firstDataRow; rowIndex < csvRows.length; rowIndex++) {
    const cells = csvRows[rowIndex];
    const values: Record<string, unknown> = {};
    for (let columnIndex = 0; columnIndex < fields.length; columnIndex++) {
      const field = fields[columnIndex];
      if (field !== '') {
        values[field] = cells[columnIndex] ?? '';
      }
    }
    rows.push({ values: values, rowNumber: rowIndex + 1 });
  }
  return rows;
}

/** Accepts a plain array, or an object that holds the array under `jsonKey`. */
function readJsonRows(text: string, jsonKey: string): ImportedRow[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }

  let list: unknown = parsed;
  if (!Array.isArray(parsed) && parsed !== null && typeof parsed === 'object') {
    list = (parsed as Record<string, unknown>)[jsonKey];
  }
  if (!Array.isArray(list)) {
    throw new Error('Expected a JSON array, or an object with a "' + jsonKey + '" array.');
  }

  const rows: ImportedRow[] = [];
  for (let index = 0; index < list.length; index++) {
    const item = list[index] as Record<string, unknown>;
    const values: Record<string, unknown> = {};
    if (item !== null && typeof item === 'object') {
      for (const key of Object.keys(item)) {
        const field = COLUMN_NAMES[simplifyColumnName(key)];
        if (field) {
          values[field] = item[key];
        }
      }
    }
    rows.push({ values: values, rowNumber: index + 1 });
  }
  return rows;
}

/** `Perc / Másodperc` -> `percmasodperc` */
function simplifyColumnName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

/** Accepts a JSON array or a text like `a, b; c`. */
function toList(value: unknown): string[] {
  if (Array.isArray(value)) {
    const list: string[] = [];
    for (const item of value) {
      const text = toText(item);
      if (text !== '') {
        list.push(text);
      }
    }
    return list;
  }
  return splitList(toText(value));
}

/** Accepts `mm:ss`, `h:mm:ss` or a number of seconds. Returns null when invalid. */
function toTimestamp(value: unknown): string | null {
  if (typeof value === 'number') {
    if (value < 0 || !Number.isFinite(value)) {
      return null;
    }
    return secondsToTimestamp(value);
  }
  const text = toText(value);
  if (TIMESTAMP_PATTERN.test(text)) {
    return text;
  }
  return null;
}

// ---- Export ----

export function segmentsToCsv(segments: Segment[]): string {
  const rows: string[][] = [SEGMENT_COLUMNS];
  for (const segment of segments) {
    rows.push([
      segment.topics.join(', '),
      segment.keywords.join(', '),
      segment.title,
      segment.description,
      segment.videoId,
      segment.timestamp,
    ]);
  }
  return toCsv(rows);
}

/** The internal ids are left out, they only matter inside the admin app. */
export function segmentsToJson(segments: Segment[]): string {
  const list: SegmentData[] = [];
  for (const segment of segments) {
    list.push(toSegmentData(segment));
  }
  return JSON.stringify(list, null, 2);
}

export function videosToCsv(videos: Video[]): string {
  const rows: string[][] = [VIDEO_COLUMNS];
  for (const video of videos) {
    rows.push([video.videoId, video.title, video.url, video.duration]);
  }
  return toCsv(rows);
}

export function videosToJson(videos: Video[]): string {
  return JSON.stringify(videos, null, 2);
}
