import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <main class="dashboard">
      <h1>Dashboard</h1>
      <p>Signed in as {{ auth.user()?.email }}</p>
      <button type="button" (click)="logout()">Sign out</button>
    </main>
  `,
  styles: `
    .dashboard {
      padding: 2rem 1rem;
      max-width: 60rem;
      margin: 0 auto;
    }
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
