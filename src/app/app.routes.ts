import { Routes } from '@angular/router';
import { Callback } from './pages/callback/callback';
import { Registro } from './pages/registro/registro';

export const routes: Routes = [
  {
    path: 'callback',
    component: Callback,
  },
  {
    path: 'registro',
    component: Registro,
  },
];
