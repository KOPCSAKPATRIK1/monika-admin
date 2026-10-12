import { Injectable, computed, effect, signal } from '@angular/core';
import { Segment, SegmentData, Video, createSegment, timestampToSeconds } from './tagging.models';

const SEGMENTS_STORAGE_KEY = 'monika-admin.segments';
const VIDEOS_STORAGE_KEY = 'monika-admin.videos';

export interface MergeResult {
  added: number;
  updated: number;
}

/**
 * Holds both tables in signals and saves them to localStorage on every change.
 * TODO: Swap localStorage for API calls once a backend exists.
 */
@Injectable({ providedIn: 'root' })
export class TaggingStore {
  private readonly segmentList = signal<Segment[]>(loadFromStorage(SEGMENTS_STORAGE_KEY));
  private readonly videoList = signal<Video[]>(loadFromStorage(VIDEOS_STORAGE_KEY));

  /** All segments, sorted by video and then by time. */
  readonly segments = computed(() => {
    const sorted = this.segmentList().slice();
    sorted.sort(compareSegments);
    return sorted;
  });

  /** All videos, sorted by video id. */
  readonly videos = computed(() => {
    const sorted = this.videoList().slice();
    sorted.sort((a, b) => a.videoId.localeCompare(b.videoId));
    return sorted;
  });

  /** The ids of all videos, for quick "does this video exist?" checks. */
  readonly videoIds = computed(() => {
    const ids = new Set<string>();
    for (const video of this.videoList()) {
      ids.add(video.videoId);
    }
    return ids;
  });

  /** How many segments each video id has. */
  readonly segmentCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const segment of this.segmentList()) {
      const current = counts.get(segment.videoId) ?? 0;
      counts.set(segment.videoId, current + 1);
    }
    return counts;
  });

  constructor() {
    // Runs again whenever the list changes.
    effect(() => {
      saveToStorage(SEGMENTS_STORAGE_KEY, this.segmentList());
    });
    effect(() => {
      saveToStorage(VIDEOS_STORAGE_KEY, this.videoList());
    });
  }

  // ---- Segments ----

  addSegment(data: SegmentData): void {
    const newList = this.segmentList().slice();
    newList.push(createSegment(crypto.randomUUID(), data));
    this.segmentList.set(newList);
  }

  updateSegment(id: string, data: SegmentData): void {
    const newList: Segment[] = [];
    for (const segment of this.segmentList()) {
      if (segment.id === id) {
        newList.push(createSegment(id, data));
      } else {
        newList.push(segment);
      }
    }
    this.segmentList.set(newList);
  }

  deleteSegment(id: string): void {
    const newList = this.segmentList().filter((segment) => segment.id !== id);
    this.segmentList.set(newList);
  }

  /** Adds imported segments. A segment with the same video id and time is updated instead. */
  mergeSegments(items: SegmentData[]): MergeResult {
    const result: MergeResult = { added: 0, updated: 0 };
    const newList = this.segmentList().slice();

    for (const item of items) {
      const itemSeconds = timestampToSeconds(item.timestamp);
      const index = newList.findIndex(
        (segment) =>
          segment.videoId === item.videoId &&
          timestampToSeconds(segment.timestamp) === itemSeconds,
      );

      if (index >= 0) {
        newList[index] = createSegment(newList[index].id, item);
        result.updated++;
      } else {
        newList.push(createSegment(crypto.randomUUID(), item));
        result.added++;
      }
    }

    this.segmentList.set(newList);
    return result;
  }

  // ---- Videos ----

  addVideo(video: Video): void {
    const newList = this.videoList().slice();
    newList.push(video);
    this.videoList.set(newList);
  }

  /**
   * Replaces the video that had `originalId`. If the id changed,
   * the segments that pointed to the old id are moved to the new one.
   */
  updateVideo(originalId: string, video: Video): void {
    const newVideoList: Video[] = [];
    for (const existing of this.videoList()) {
      if (existing.videoId === originalId) {
        newVideoList.push(video);
      } else {
        newVideoList.push(existing);
      }
    }
    this.videoList.set(newVideoList);

    if (originalId !== video.videoId) {
      const newSegmentList: Segment[] = [];
      for (const segment of this.segmentList()) {
        if (segment.videoId === originalId) {
          const moved = createSegment(segment.id, segment);
          moved.videoId = video.videoId;
          newSegmentList.push(moved);
        } else {
          newSegmentList.push(segment);
        }
      }
      this.segmentList.set(newSegmentList);
    }
  }

  /** Removes the video only. Its segments stay and show up as pointing to an unknown video. */
  deleteVideo(videoId: string): void {
    const newList = this.videoList().filter((video) => video.videoId !== videoId);
    this.videoList.set(newList);
  }

  /** Adds imported videos. A video with an existing video id is updated instead. */
  mergeVideos(items: Video[]): MergeResult {
    const result: MergeResult = { added: 0, updated: 0 };
    const newList = this.videoList().slice();

    for (const item of items) {
      const index = newList.findIndex((video) => video.videoId === item.videoId);
      if (index >= 0) {
        newList[index] = item;
        result.updated++;
      } else {
        newList.push(item);
        result.added++;
      }
    }

    this.videoList.set(newList);
    return result;
  }
}

function compareSegments(a: Segment, b: Segment): number {
  if (a.videoId !== b.videoId) {
    return a.videoId.localeCompare(b.videoId);
  }
  return timestampToSeconds(a.timestamp) - timestampToSeconds(b.timestamp);
}

function loadFromStorage<T>(key: string): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      return [];
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is full or blocked – the data stays in memory for this session.
  }
}
