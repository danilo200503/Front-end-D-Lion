import { Routes } from '@angular/router';

export const LANCAMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lancamentos.component').then((m) => m.LancamentosComponent),
    title: 'D-LION | Lançamentos Fiscais',
  },
];
