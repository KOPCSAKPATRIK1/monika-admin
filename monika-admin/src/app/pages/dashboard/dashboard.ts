import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <main class="container py-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 class="h3 mb-0">Dashboard</h1>
        <button type="button" class="btn btn-outline-secondary btn-sm" (click)="logout()">
          Sign out
        </button>
      </div>
      <p class="text-body-secondary">Signed in as {{ auth.user()?.email }}</p>
    </main>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
