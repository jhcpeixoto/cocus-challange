import {ChangeDetectorRef, Component} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {MaterialModule} from '../../material.module';
import {FormsModule} from '@angular/forms';

type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [MaterialModule, FormsModule],
})
export class AuthComponent {
  email: string = '';
  password: string = '';
  token: string | null = null;
  newPassword: string = '';

  error: string | null = null;
  message: string | null = null;
  mode: AuthMode = 'login';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) {}

  switchMode(newMode: AuthMode): void {
    this.mode = newMode;
    this.error = null;
    this.message = null;
    this.email = '';
    this.password = '';
    this.token = null;
    this.newPassword = '';
    this.cdRef.detectChanges();
  }

  submit(): void {
    this.error = null;
    this.message = null;
    if (this.mode === 'login') {
      this.authService.login(this.email, this.password).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.error = err?.graphQLErrors?.[0]?.message || err.message || 'Authentication failed';
          this.cdRef.detectChanges();
        },
      });
    } else if (this.mode === 'register') {
      this.authService.register(this.email, this.password).subscribe({
        next: () => this.switchMode('login'),
        error: (err) => {
          this.error = err?.graphQLErrors?.[0]?.message || err.message || 'Registration failed';
          this.cdRef.detectChanges();
        },
      });
    } else if (this.mode === 'forgot') {
      if (!this.token) {
        this.authService.forgotPassword(this.email).subscribe({
          next: (resetToken: string) => {
            this.token = resetToken;
            this.message = 'Reset token received. Please enter the token (if not auto-filled) and your new password.';
            this.cdRef.detectChanges();
          },
          error: (err) => {
            this.error = err?.graphQLErrors?.[0]?.message || err.message || 'Request failed';
            this.cdRef.detectChanges();
          },
        });
      } else {
        if (!this.newPassword) {
          this.error = 'Please enter a new password';
          this.cdRef.detectChanges();
          return;
        }
        this.authService.resetPassword(this.token, this.newPassword).subscribe({
          next: () => {
            this.message = 'Password reset successfully. Please login with your new password.';
            this.token = null;
            this.newPassword = '';
            this.mode = 'login';
            this.cdRef.detectChanges();
            setTimeout(() => this.router.navigate(['/auth']), 3000);
          },
          error: (err) => {
            this.error = err?.graphQLErrors?.[0]?.message || err.message || 'Reset password failed';
            this.cdRef.detectChanges();
          },
        });
      }
    }
  }
}
