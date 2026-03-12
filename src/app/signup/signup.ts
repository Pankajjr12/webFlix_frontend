import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../shared/services/notification-service';
import { ErrorHandlerService } from '../shared/services/error-handler-service';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'], // ✅ fixed typo (styleUrls not styleUrl)
})
export class Signup implements OnInit {

  hidePassword = true;
  hideConfirmPassword = true;
  signUpForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private errorHandlerService: ErrorHandlerService
  ) {

    // ✅ Password validator moved to FORM GROUP level
    this.signUpForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: this.authService.passwordMatchValidator('password')
      }
    );
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.authService.redirectBasedOnRole();
    }
    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.signUpForm.patchValue({ email: email });
    }
  }

  submit() {

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const formData = this.signUpForm.value;

    const data = {
      email: formData.email?.trim().toLowerCase(),
      password: formData.password,
      fullName: formData.fullName?.trim()
    };

    this.authService.signUp(data).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.notification.success(response?.message || 'Registration successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorHandlerService.handle(
          err,
          'Registration failed. Please try again.'
        );
      }
    });
  }
}