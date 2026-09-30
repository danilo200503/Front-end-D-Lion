import { Routes } from '@angular/router';

export const PLANO_TRIBUTARIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./plano-tributario.component').then((m) => m.PlanoTributarioComponent),
    title: 'D-LION | Plano Tributário',
  },
];
