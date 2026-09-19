import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, from, switchMap, throwError } from "rxjs";
import { AuthService } from "./auth";

const GATEWAY_ORIGIN = "http://localhost:8080";

function esDestinoPermitido(url: string): boolean {
  try {
    const destino = new URL(url, window.location.origin);

    return (
      destino.origin === GATEWAY_ORIGIN && destino.pathname.startsWith("/v1/")
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
  const revisionSolicitud = authService.revisionSesion();

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
    catchError((error: unknown) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 401 &&
        authService.revisionSesion() === revisionSolicitud
      ) {
        authService.invalidarSesion();
      }

      return throwError(() => error);
    }),
  );
};
