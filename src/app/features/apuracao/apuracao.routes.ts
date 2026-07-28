import { Routes } from '@angular/router';

export const APURACAO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./apuracao.component').then((m) => m.ApuracaoComponent),
    title: 'D-LION | Apuração',
  },
];
