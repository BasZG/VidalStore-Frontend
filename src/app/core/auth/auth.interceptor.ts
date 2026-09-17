import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth';

const GATEWAY_URL = 'http://localhost:8080';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(GATEWAY_URL)) {
    return next(req);
  }

  const authService = inject(AuthService);

  return from(authService.obtenerAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }
      const reqConToken = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(reqConToken);
    }),
  );
};