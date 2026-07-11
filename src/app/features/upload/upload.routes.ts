import { Routes } from '@angular/router';

export const UPLOAD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./upload.component').then((m) => m.UploadComponent),
    title: 'D-LION | Upload de Documentos',
  },
];
