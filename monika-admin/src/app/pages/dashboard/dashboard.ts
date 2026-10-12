import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SegmentsPanel } from '../../features/tagging/segments-panel/segments-panel';
import { TaggingStore } from '../../features/tagging/tagging.store';
import { VideosPanel } from '../../features/tagging/videos-panel/videos-panel';

@Component({
  selector: 'app-dashboard',
  imports: [SegmentsPanel, VideosPanel],
  template: `
    <nav class="navbar bg-body-tertiary border-bottom">
      <div class="container-fluid">
        <span class="navbar-brand fw-semibold">Monika Admin</span>
        <div class="d-flex align-items-center gap-3">
          <span class="small text-body-secondary d-none d-sm-inline">{{ auth.user()?.email }}</span>
          <button type="button" class="btn btn-outline-secondary btn-sm" (click)="logout()">
            Sign out
          </button>
        </div>
      </div>
    </nav>

    <main class="container-fluid py-4">
      <h1 class="h3 mb-3">Video tagging</h1>

      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button
            type="button"
            class="nav-link"
            [class.active]="tab() === 'segments'"
            [attr.aria-current]="tab() === 'segments' ? 'page' : null"
            (click)="tab.set('segments')"
          >
            Segments
            <span class="badge text-bg-secondary ms-1">{{ store.segments().length }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link"
            [class.active]="tab() === 'videos'"
            [attr.aria-current]="tab() === 'videos' ? 'page' : null"
            (click)="tab.set('videos')"
          >
            Videos
            <span class="badge text-bg-secondary ms-1">{{ store.videos().length }}</span>
          </button>
        </li>
      </ul>

      @switch (tab()) {
        @case ('segments') {
          <app-segments-panel />
        }
        @case ('videos') {
          <app-videos-panel />
        }
      }
    </main>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  protected readonly store = inject(TaggingStore);
  private readonly router = inject(Router);

  protected readonly tab = signal<'segments' | 'videos'>('segments');

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
