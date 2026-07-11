import { Routes } from '@angular/router';

export const HISTORICO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./historico.component').then((m) => m.HistoricoComponent),
    title: 'D-LION | Histórico',
  },
];
