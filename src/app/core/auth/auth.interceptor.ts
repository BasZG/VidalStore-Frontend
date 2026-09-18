import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth';

const GATEWAY_ORIGIN = 'http://localhost:8080';

function esDestinoPermitido(url: string): boolean {
  try {
    const destino = new URL(url, window.location.origin);

    return (
      destino.origin === GATEWAY_ORIGIN &&
      destino.pathname.startsWith('/v1/')
    );
  } catch {
    return false;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!esDestinoPermitido(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);

  return from(authService.obtenerAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const reqConToken = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(reqConToken);
    }),
  );
};
