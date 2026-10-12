import { Injectable, computed, signal } from '@angular/core';

export interface User {
  email: string;
}

const STORAGE_KEY = 'monika-admin.user';

// TODO: Replace with a real API call once the backend exists.
const DEMO_EMAIL = 'admin@gmail.com';
const DEMO_PASSWORD = 'admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(readStoredUser());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  async login(email: string, password: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (email.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return false;
    }

    const user: User = { email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
