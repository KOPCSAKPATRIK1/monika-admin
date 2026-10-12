import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FieldState, FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { TIMESTAMP_PATTERN, Video } from '../tagging.models';
import { TaggingStore } from '../tagging.store';

@Component({
  selector: 'app-video-editor',
  imports: [FormRoot, FormField],
  templateUrl: './video-editor.html',
})
export class VideoEditor {
  private readonly store = inject(TaggingStore);

  /** The video to edit, or `null` to create a new one. */
  readonly video = input<Video | null>(null);
  readonly saved = output<Video>();
  readonly cancelled = output<void>();

  /**
   * True when editing a video that is already in the table. False for a new video,
   * including one pre-filled with an id that segments already use.
   */
  protected readonly isExisting = computed(() => {
    const video = this.video();
    return video !== null && this.store.videoIds().has(video.videoId);
  });

  private readonly model = signal<Video>(createFormModel(null));

  protected readonly form = form(
    this.model,
    (field) => {
      required(field.videoId, { message: 'Add the video id (file name).' });

      validate(field.videoId, (context) => {
        const videoId = context.value().trim();
        const originalId = this.video()?.videoId;
        if (videoId !== originalId && this.store.videoIds().has(videoId)) {
          return { kind: 'duplicate', message: 'A video with this id already exists.' };
        }
        return undefined;
      });

      validate(field.duration, (context) => {
        const duration = context.value().trim();
        if (duration !== '' && !TIMESTAMP_PATTERN.test(duration)) {
          return { kind: 'pattern', message: 'Use mm:ss or h:mm:ss, e.g. 12:30.' };
        }
        return undefined;
      });
    },
    {
      submission: {
        action: async () => {
          const value = this.model();
          this.saved.emit({
            videoId: value.videoId.trim(),
            title: value.title.trim(),
            url: value.url.trim(),
            duration: value.duration.trim(),
          });
          return undefined;
        },
      },
    },
  );

  /** Shows a hint when an existing video's id is being changed. */
  protected readonly isRenaming = computed(() => {
    const video = this.video();
    if (video === null || !this.isExisting()) {
      return false;
    }
    return this.model().videoId.trim() !== video.videoId;
  });

  constructor() {
    // Fill the form again whenever a different video is opened.
    effect(() => {
      const newValue = createFormModel(this.video());
      // `untracked` makes sure this effect only re-runs when `video` changes.
      untracked(() => this.form().reset(newValue));
    });
  }

  /** The first error message of a field, once the user has touched it. */
  protected errorOf(field: FieldState<unknown>): string | null {
    if (!field.touched() || !field.invalid()) {
      return null;
    }
    const firstError = field.errors()[0];
    if (firstError && firstError.message) {
      return firstError.message;
    }
    return 'Invalid value.';
  }
}

function createFormModel(video: Video | null): Video {
  if (video === null) {
    return { videoId: '', title: '', url: '', duration: '' };
  }
  return {
    videoId: video.videoId,
    title: video.title,
    url: video.url,
    duration: video.duration,
  };
}
