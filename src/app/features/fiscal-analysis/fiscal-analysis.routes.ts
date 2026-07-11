import { Routes } from '@angular/router';

export const FISCAL_ANALYSIS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./fiscal-analysis.component').then((m) => m.FiscalAnalysisComponent),
    title: 'D-LION | Análise Fiscal',
  },
];
