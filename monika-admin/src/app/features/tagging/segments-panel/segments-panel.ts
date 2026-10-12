import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { downloadText, readPickedFile, today } from '../file-io';
import { importSegments, segmentsToCsv, segmentsToJson } from '../import-export';
import { ImportMessage, importFailed, importSucceeded } from '../import-message';
import { SegmentEditor } from '../segment-editor/segment-editor';
import { Segment, SegmentData, TOPICS, simplifyText } from '../tagging.models';
import { TaggingStore } from '../tagging.store';

interface SegmentFilters {
  search: string;
  topic: string;
  videoId: string;
}

@Component({
  selector: 'app-segments-panel',
  imports: [SegmentEditor, FormField],
  templateUrl: './segments-panel.html',
})
export class SegmentsPanel {
  protected readonly store = inject(TaggingStore);
  protected readonly topics = TOPICS;

  // ---- Filters ----

  private readonly filterValues = signal<SegmentFilters>({ search: '', topic: '', videoId: '' });
  protected readonly filters = form(this.filterValues);

  protected readonly hasFilters = computed(() => {
    const filters = this.filterValues();
    return filters.search !== '' || filters.topic !== '' || filters.videoId !== '';
  });

  /** Every video id that has segments, for the video filter. */
  protected readonly videoOptions = computed(() => {
    const ids: string[] = [];
    for (const videoId of this.store.segmentCounts().keys()) {
      ids.push(videoId);
    }
    ids.sort((a, b) => a.localeCompare(b));
    return ids;
  });

  protected readonly filteredSegments = computed(() => {
    const filters = this.filterValues();
    const search = simplifyText(filters.search.trim());
    const result: Segment[] = [];

    for (const segment of this.store.segments()) {
      if (filters.topic !== '' && !segment.topics.includes(filters.topic)) {
        continue;
      }
      if (filters.videoId !== '' && segment.videoId !== filters.videoId) {
        continue;
      }
      if (search !== '') {
        const searchableText =
          segment.title + ' ' +
          segment.description + ' ' +
          segment.videoId + ' ' +
          segment.topics.join(' ') + ' ' +
          segment.keywords.join(' ');
        if (!simplifyText(searchableText).includes(search)) {
          continue;
        }
      }
      result.push(segment);
    }
    return result;
  });

  protected clearFilters(): void {
    this.filterValues.set({ search: '', topic: '', videoId: '' });
  }

  // ---- Editing ----

  /** The segment being edited, `'new'` while adding one, or `null` when the editor is closed. */
  protected readonly editing = signal<Segment | 'new' | null>(null);

  /** The segment passed to the editor – `null` means a new, empty one. */
  protected readonly editingSegment = computed(() => {
    const editing = this.editing();
    if (editing === 'new') {
      return null;
    }
    return editing;
  });

  protected startNew(): void {
    this.editing.set('new');
  }

  protected startEdit(segment: Segment): void {
    this.editing.set(segment);
  }

  protected closeEditor(): void {
    this.editing.set(null);
  }

  protected onSaved(data: SegmentData): void {
    const segment = this.editingSegment();
    if (segment === null) {
      this.store.addSegment(data);
    } else {
      this.store.updateSegment(segment.id, data);
    }
    this.closeEditor();
  }

  // ---- Deleting ----

  /** The id of the segment that shows "Delete? Yes / No" in its row. */
  protected readonly deletingId = signal<string | null>(null);

  protected askDelete(segment: Segment): void {
    this.deletingId.set(segment.id);
  }

  protected cancelDelete(): void {
    this.deletingId.set(null);
  }

  protected confirmDelete(segment: Segment): void {
    this.store.deleteSegment(segment.id);
    this.deletingId.set(null);

    const editingSegment = this.editingSegment();
    if (editingSegment !== null && editingSegment.id === segment.id) {
      this.closeEditor();
    }
  }

  // ---- Import / export ----

  protected readonly message = signal<ImportMessage | null>(null);

  protected closeMessage(): void {
    this.message.set(null);
  }

  protected async onImport(event: Event): Promise<void> {
    try {
      const text = await readPickedFile(event);
      if (text === null) {
        return;
      }
      const result = importSegments(text);
      const merge = this.store.mergeSegments(result.items);
      this.message.set(importSucceeded(merge, result.errors));
    } catch (error) {
      this.message.set(importFailed(error));
    }
  }

  protected exportCsv(): void {
    const fileName = 'segments-' + today() + '.csv';
    downloadText(fileName, segmentsToCsv(this.store.segments()), 'text/csv');
  }

  protected exportJson(): void {
    const fileName = 'segments-' + today() + '.json';
    downloadText(fileName, segmentsToJson(this.store.segments()), 'application/json');
  }
}
