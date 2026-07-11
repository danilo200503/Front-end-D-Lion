import { Routes } from '@angular/router';

export const COBRANCAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cobrancas.component').then((m) => m.CobrancasComponent),
    title: 'D-LION | Cobranças',
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./historico/envios-historico.component').then((m) => m.EnviosHistoricoComponent),
    title: 'D-LION | Histórico de Envios',
  },
];
