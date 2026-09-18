import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import {
  AuthService,
  GrupoUsuario,
} from './auth';

export const groupGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const gruposPermitidos =
    route.data['grupos'] as GrupoUsuario[] | undefined;

  if (
    !gruposPermitidos ||
    gruposPermitidos.length === 0
  ) {
    return router.createUrlTree(['/catalogo']);
  }

  const gruposUsuario =
    await authService.cargarGrupos();

  const autorizado = gruposPermitidos.some(
    (grupo) => gruposUsuario.includes(grupo),
  );

  if (!autorizado) {
    return router.createUrlTree(['/catalogo']);
  }

  return true;
};
