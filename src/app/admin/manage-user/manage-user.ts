import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user-service';
import { NotificationService } from '../../shared/services/notification-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-user',
  standalone: false,
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.css'
})
export class ManageUser {

  userForm!: FormGroup;
  creating = false;
  hidePassword = true;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notification: NotificationService,
    private errorHandlerService: ErrorHandlerService,
    private dialogRef: MatDialogRef<ManageUser>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.isEditMode = data.mode === 'edit';

    this.userForm = this.fb.group({
      fullName: [data.user?.fullName || '', [Validators.required]],

      email: [
        data.user?.email || '',
        [Validators.required, Validators.email]
      ],

      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]
      ],

      role: [
        data.user?.role || 'USER',
        [Validators.required]
      ]
    });

    // Disable email editing when updating user
    if (this.isEditMode) {
      this.userForm.get('email')?.disable();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.creating = true;

    const formData = this.userForm.getRawValue();

    const payload = {
      fullName: formData.fullName?.trim(),
      email: formData.email?.trim().toLowerCase(),
      password: formData.password,
      role: formData.role
    };

    const request$ = this.isEditMode
      ? this.userService.updateuser(this.data.user.id, payload)
      : this.userService.createUser(payload);

    request$.subscribe({
      next: (response: any) => {
        this.creating = false;
        this.notification.success(response?.message || 'User saved successfully');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.creating = false;
        this.errorHandlerService.handle(err, 'Failed to save user.');
      }
    });
  }
}