import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { AuthService } from '../../core/auth/auth.service';

interface LoginModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormRoot, FormField],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Bound from the `?returnUrl=` query param set by the auth guard. */
  readonly returnUrl = input<string>();

  protected readonly showPassword = signal(false);

  private readonly model = signal<LoginModel>({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Please enter your email.' });
      email(path.email, { message: 'Please enter a valid email address.' });
      required(path.password, { message: 'Please enter your password.' });
    },
    {
      submission: {
        action: async (field) => {
          const { email, password } = field().value();
          const ok = await this.auth.login(email, password);
          if (!ok) {
            return { kind: 'server', message: 'Incorrect email or password.' };
          }
          await this.router.navigateByUrl(this.returnUrl() || '/');
          return undefined;
        },
      },
    },
  );
}
