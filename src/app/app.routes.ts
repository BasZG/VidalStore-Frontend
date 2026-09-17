import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Catalogo } from './pages/catalogo/catalogo';
import { Biblioteca } from './pages/biblioteca/biblioteca';
import { Editor } from './pages/editor/editor';
import { Administracion } from './pages/administracion/administracion';
import { Registro } from './pages/registro/registro';
import { Callback } from './pages/callback/callback';
import { authGuard } from './core/auth/auth.guard';
import { groupGuard } from './core/auth/group.guard';
import { GrupoUsuario } from './core/auth/auth';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'catalogo',
    component: Catalogo,
    canActivate: [authGuard],
  },
  {
    path: 'biblioteca',
    component: Biblioteca,
    canActivate: [authGuard],
  },
    {
    path: 'editor',
    component: Editor,
    canActivate: [authGuard, groupGuard],
    data: {
      grupos: [
        'editores',
        'administradores',
      ] satisfies GrupoUsuario[],
    },
  },
  {
    path: 'administracion',
    component: Administracion,
    canActivate: [authGuard, groupGuard],
    data: {
      grupos: [
        'administradores',
      ] satisfies GrupoUsuario[],
    },
  },
  {
    path: 'registro',
    component: Registro,
  },
  {
    path: 'callback',
    component: Callback,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
