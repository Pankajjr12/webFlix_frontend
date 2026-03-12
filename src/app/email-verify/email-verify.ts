import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../shared/services/auth-service';

@Component({
  selector: 'app-email-verify',
  standalone: false,
  templateUrl: './email-verify.html',
  styleUrls: ['./email-verify.css']   // ✅ FIXED
})
export class EmailVerify implements OnInit {

  loading = true;
  success = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    const token = this.route.snapshot.queryParamMap.get('token');

    console.log('Token:', token); // Debug

    if (!token) {
      this.loading = false;
      this.success = false;
      this.message = 'Invalid verification link. No token provided.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
        this.message =
          response?.message ||
          'Email verified successfully! You can now login.';
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        this.message =
          err?.error?.message ||
          'Verification failed. The link may have expired or be invalid.';
      }
    });
  }
}