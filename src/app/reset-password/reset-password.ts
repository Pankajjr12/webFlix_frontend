import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../shared/services/notification-service';
import { ErrorHandlerService } from '../shared/services/error-handler-service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {

  resetPasswordForm!: FormGroup;
  loading = false;
  tokenValid = false;
  token = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private errorHandlerService: ErrorHandlerService) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.authService.passwordMatchValidator('password')]]
    });
  }
  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.token = token;
      this.tokenValid = true;
    }
    else {
      this.tokenValid = false;
    }
  }

  submit() {
    this.loading = true;
    const newPassword = this.resetPasswordForm.value.password;
    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.notification.success(response.message || 'Password reset successfully!')
        this.router.navigate(['/login'])
      },
      error: (err) => {
        this.loading = false;
        const errorMsg = err.error?.error || 'Failed to reset password. Please try again.'

        if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase.includes('invalid')) {
          this.tokenValid = false;
        }
        else {
          this.notification.error(errorMsg);
        }
      }
    })
  }
}
