import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import {
  FieldState,
  FormField,
  FormRoot,
  form,
  maxLength,
  required,
  validate,
} from '@angular/forms/signals';
import {
  Segment,
  SegmentData,
  TIMESTAMP_PATTERN,
  TOPICS,
  countSentences,
  splitList,
} from '../tagging.models';
import { TaggingStore } from '../tagging.store';

/** The values in the form. Keywords are typed as one comma-separated text. */
interface SegmentFormModel {
  topics: string[];
  keywords: string;
  title: string;
  description: string;
  videoId: string;
  timestamp: string;
}

@Component({
  selector: 'app-segment-editor',
  imports: [FormRoot, FormField],
  templateUrl: './segment-editor.html',
})
export class SegmentEditor {
  private readonly store = inject(TaggingStore);

  /** The segment to edit, or `null` to create a new one. */
  readonly segment = input<Segment | null>(null);
  readonly saved = output<SegmentData>();
  readonly cancelled = output<void>();

  private readonly model = signal<SegmentFormModel>(createFormModel(null));

  protected readonly form = form(
    this.model,
    (field) => {
      validate(field.topics, (context) => {
        if (context.value().length === 0) {
          return { kind: 'required', message: 'Pick at least one topic.' };
        }
        return undefined;
      });

      required(field.title, { message: 'Add a short title.' });
      maxLength(field.title, 80, { message: 'Keep the title under 80 characters.' });

      validate(field.description, (context) => {
        if (countSentences(context.value()) > 3) {
          return { kind: 'maxSentences', message: 'Use at most 3 sentences.' };
        }
        return undefined;
      });

      required(field.videoId, { message: 'Add the video id (file name).' });

      validate(field.timestamp, (context) => {
        const timestamp = context.value().trim();
        if (timestamp === '') {
          return { kind: 'required', message: 'Add the start time.' };
        }
        if (!TIMESTAMP_PATTERN.test(timestamp)) {
          return { kind: 'pattern', message: 'Use mm:ss or h:mm:ss, e.g. 4:05.' };
        }
        return undefined;
      });
    },
    {
      submission: {
        action: async () => {
          this.saved.emit(createSegmentData(this.model()));
          return undefined;
        },
      },
    },
  );

  /** The 9 topics, plus any extra ones that came in through an import. */
  protected readonly topicOptions = computed(() => {
    const options = TOPICS.slice();
    for (const topic of this.model().topics) {
      if (!options.includes(topic)) {
        options.push(topic);
      }
    }
    return options;
  });

  /** For the suggestions list of the video id field. */
  protected readonly videoIds = computed(() => {
    const ids: string[] = [];
    for (const video of this.store.videos()) {
      ids.push(video.videoId);
    }
    return ids;
  });

  protected readonly isUnknownVideo = computed(() => {
    const videoId = this.model().videoId.trim();
    return videoId !== '' && !this.store.videoIds().has(videoId);
  });

  protected readonly sentenceCount = computed(() => countSentences(this.model().description));

  constructor() {
    // Fill the form again whenever a different segment is opened.
    effect(() => {
      const newValue = createFormModel(this.segment());
      // `untracked` makes sure this effect only re-runs when `segment` changes.
      untracked(() => this.form().reset(newValue));
    });
  }

  protected isTopicSelected(topic: string): boolean {
    return this.model().topics.includes(topic);
  }

  protected toggleTopic(topic: string): void {
    const current = this.model();
    let topics: string[];
    if (current.topics.includes(topic)) {
      topics = current.topics.filter((t) => t !== topic);
    } else {
      topics = current.topics.slice();
      topics.push(topic);
    }

    this.model.set({
      topics: topics,
      keywords: current.keywords,
      title: current.title,
      description: current.description,
      videoId: current.videoId,
      timestamp: current.timestamp,
    });
    this.form.topics().markAsTouched();
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

function createFormModel(segment: Segment | null): SegmentFormModel {
  if (segment === null) {
    return { topics: [], keywords: '', title: '', description: '', videoId: '', timestamp: '' };
  }
  return {
    topics: segment.topics.slice(),
    keywords: segment.keywords.join(', '),
    title: segment.title,
    description: segment.description,
    videoId: segment.videoId,
    timestamp: segment.timestamp,
  };
}

function createSegmentData(model: SegmentFormModel): SegmentData {
  return {
    topics: model.topics.slice(),
    keywords: splitList(model.keywords),
    title: model.title.trim(),
    description: model.description.trim(),
    videoId: model.videoId.trim(),
    timestamp: model.timestamp.trim(),
  };
}
