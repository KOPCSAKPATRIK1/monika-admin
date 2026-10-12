import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { downloadText, readPickedFile, today } from '../file-io';
import { importVideos, videosToCsv, videosToJson } from '../import-export';
import { ImportMessage, importFailed, importSucceeded } from '../import-message';
import { Video, simplifyText } from '../tagging.models';
import { TaggingStore } from '../tagging.store';
import { VideoEditor } from '../video-editor/video-editor';

@Component({
  selector: 'app-videos-panel',
  imports: [VideoEditor, FormField],
  templateUrl: './videos-panel.html',
})
export class VideosPanel {
  protected readonly store = inject(TaggingStore);

  // ---- Search ----

  private readonly filterValues = signal({ search: '' });
  protected readonly filters = form(this.filterValues);

  protected readonly filteredVideos = computed(() => {
    const search = simplifyText(this.filterValues().search.trim());
    if (search === '') {
      return this.store.videos();
    }

    const result: Video[] = [];
    for (const video of this.store.videos()) {
      const searchableText = video.videoId + ' ' + video.title + ' ' + video.url;
      if (simplifyText(searchableText).includes(search)) {
        result.push(video);
      }
    }
    return result;
  });

  /** Video ids that segments use but that are missing from this table. */
  protected readonly missingVideoIds = computed(() => {
    const missing: string[] = [];
    for (const videoId of this.store.segmentCounts().keys()) {
      if (!this.store.videoIds().has(videoId)) {
        missing.push(videoId);
      }
    }
    missing.sort((a, b) => a.localeCompare(b));
    return missing;
  });

  protected segmentCount(video: Video): number {
    return this.store.segmentCounts().get(video.videoId) ?? 0;
  }

  // ---- Editing ----

  /** The video being edited, `'new'` while adding one, or `null` when the editor is closed. */
  protected readonly editing = signal<Video | 'new' | null>(null);

  /** The video passed to the editor – `null` means a new, empty one. */
  protected readonly editingVideo = computed(() => {
    const editing = this.editing();
    if (editing === 'new') {
      return null;
    }
    return editing;
  });

  protected startNew(): void {
    this.editing.set('new');
  }

  /** Opens the editor pre-filled with a video id that segments already use. */
  protected startNewWithId(videoId: string): void {
    this.editing.set({ videoId: videoId, title: '', url: '', duration: '' });
  }

  protected startEdit(video: Video): void {
    this.editing.set(video);
  }

  protected closeEditor(): void {
    this.editing.set(null);
  }

  protected onSaved(video: Video): void {
    const original = this.editingVideo();
    if (original !== null && this.store.videoIds().has(original.videoId)) {
      this.store.updateVideo(original.videoId, video);
    } else {
      this.store.addVideo(video);
    }
    this.closeEditor();
  }

  // ---- Deleting ----

  /** The id of the video that shows "Delete? Yes / No" in its row. */
  protected readonly deletingId = signal<string | null>(null);

  protected askDelete(video: Video): void {
    this.deletingId.set(video.videoId);
  }

  protected cancelDelete(): void {
    this.deletingId.set(null);
  }

  protected confirmDelete(video: Video): void {
    this.store.deleteVideo(video.videoId);
    this.deletingId.set(null);

    const editingVideo = this.editingVideo();
    if (editingVideo !== null && editingVideo.videoId === video.videoId) {
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
      const result = importVideos(text);
      const merge = this.store.mergeVideos(result.items);
      this.message.set(importSucceeded(merge, result.errors));
    } catch (error) {
      this.message.set(importFailed(error));
    }
  }

  protected exportCsv(): void {
    const fileName = 'videos-' + today() + '.csv';
    downloadText(fileName, videosToCsv(this.store.videos()), 'text/csv');
  }

  protected exportJson(): void {
    const fileName = 'videos-' + today() + '.json';
    downloadText(fileName, videosToJson(this.store.videos()), 'application/json');
  }
}
