import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => vi.useRealTimers());

  function setup() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const type = (selector: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
      await vi.runAllTimersAsync();
      fixture.detectChanges();
    };
    return { el, type, submit };
  }

  it('shows field errors when submitted empty', async () => {
    const { el, submit } = setup();
    await submit();
    const errors = [...el.querySelectorAll('.invalid-feedback')].map((e) => e.textContent?.trim());
    expect(errors).toEqual(['Please enter your email.', 'Please enter your password.']);
  });

  it('shows an error for wrong credentials', async () => {
    const { el, type, submit } = setup();
    type('#email', 'someone@example.com');
    type('#password', 'wrong');
    await submit();
    expect(el.querySelector('.alert-danger')?.textContent).toContain('Incorrect email or password.');
  });

  it('navigates home after a successful login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { el, type, submit } = setup();
    type('#email', 'admin@gmail.com');
    type('#password', 'admin');
    await submit();
    expect(navigate).toHaveBeenCalledWith('/');
    expect(el.querySelector('.alert-danger')).toBeNull();
  });
});
