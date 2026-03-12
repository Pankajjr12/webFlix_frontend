import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    return next(cloned);
  } else {
    console.log('No token found');

  }
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        authService.logOut()
      }
      return throwError(() => error)
    })
  )
};
