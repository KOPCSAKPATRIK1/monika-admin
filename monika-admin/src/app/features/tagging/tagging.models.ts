/**
 * The 9 predefined topics used to refine search.
 * TODO: Replace the placeholders with the real topic names.
 */
export const TOPICS: string[] = [
  'Topic 1',
  'Topic 2',
  'Topic 3',
  'Topic 4',
  'Topic 5',
  'Topic 6',
  'Topic 7',
  'Topic 8',
  'Topic 9',
];

/** One tagged moment of a video (table 1). */
export interface Segment {
  /** Internal id, only used inside the admin app. */
  id: string;
  /** Column 1 – predefined topics. */
  topics: string[];
  /** Column 2 – extra keywords, defined by the AI. */
  keywords: string[];
  /** Column 3 – short title shown on the tile. */
  title: string;
  /** Column 4 – description of at most 3 sentences shown on the tile. */
  description: string;
  /** Column 5 – video id (file name), key into the videos table. */
  videoId: string;
  /** Column 6 – start position, `mm:ss` or `h:mm:ss`. */
  timestamp: string;
}

/** A segment without the internal id – this is what gets imported, exported and edited. */
export interface SegmentData {
  topics: string[];
  keywords: string[];
  title: string;
  description: string;
  videoId: string;
  timestamp: string;
}

/** One video file (table 2). */
export interface Video {
  /** Video id (file name) – the key segments refer to. */
  videoId: string;
  title: string;
  /** Path or URL the player loads the file from. */
  url: string;
  /** Length, `mm:ss` or `h:mm:ss`. Optional. */
  duration: string;
}

/** `mm:ss` (minutes may exceed 59) or `h:mm:ss`. */
export const TIMESTAMP_PATTERN = /^(\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$/;

/** Turns `1:05` into 65 and `1:00:00` into 3600. */
export function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':');
  let seconds = 0;
  for (const part of parts) {
    seconds = seconds * 60 + Number(part);
  }
  return seconds;
}

/** Turns 65 into `1:05`. */
export function secondsToTimestamp(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (seconds < 10) {
    return minutes + ':0' + seconds;
  }
  return minutes + ':' + seconds;
}

/**
 * Counts sentences. A sentence ends with `.`, `!`, `?` or `…` followed by a space,
 * so `Version 2.5` is not split. Text after the last punctuation counts as a sentence too.
 */
export function countSentences(text: string): number {
  const sentences = text.split(/(?<=[.!?…])\s+/);
  let count = 0;
  for (const sentence of sentences) {
    if (sentence.trim() !== '') {
      count++;
    }
  }
  return count;
}

/** Splits a list cell such as `a, b; c | d` into trimmed, non-empty items. */
export function splitList(value: string): string[] {
  const result: string[] = [];
  for (const part of value.split(/[|;,]/)) {
    const item = part.trim();
    if (item !== '') {
      result.push(item);
    }
  }
  return result;
}

/** Lowercase without accents, so a search for `kortefa` also finds `körtefa`. */
export function simplifyText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function createSegment(id: string, data: SegmentData): Segment {
  return {
    id: id,
    topics: data.topics.slice(),
    keywords: data.keywords.slice(),
    title: data.title,
    description: data.description,
    videoId: data.videoId,
    timestamp: data.timestamp,
  };
}

/** The segment without its internal id. */
export function toSegmentData(segment: Segment): SegmentData {
  return {
    topics: segment.topics.slice(),
    keywords: segment.keywords.slice(),
    title: segment.title,
    description: segment.description,
    videoId: segment.videoId,
    timestamp: segment.timestamp,
  };
}
