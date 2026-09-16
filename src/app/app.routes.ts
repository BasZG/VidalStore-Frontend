import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Catalogo } from './pages/catalogo/catalogo';
import { Biblioteca } from './pages/biblioteca/biblioteca';
import { Editor } from './pages/editor/editor';
import { Administracion } from './pages/administracion/administracion';
import { Registro } from './pages/registro/registro';
import { Callback } from './pages/callback/callback';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'catalogo',
    component: Catalogo,
  },
  {
    path: 'biblioteca',
    component: Biblioteca,
  },
  {
    path: 'editor',
    component: Editor,
  },
  {
    path: 'administracion',
    component: Administracion,
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