import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = await authService.obtenerUsuarioActual();

  if (!usuario) {
    router.navigate(['/']);
    return false;
  }

  return true;
};