import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    title: 'D-LION | Gestão contábil inteligente',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
        title: 'D-LION | Entrar',
      },
      {
        path: 'cadastro',
        loadComponent: () =>
          import('./features/auth/cadastro/cadastro.component').then((m) => m.CadastroComponent),
        title: 'D-LION | Criar conta',
      },
      {
        path: 'esqueci-senha',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
        title: 'D-LION | Recuperar senha',
      },
      {
        path: 'verificar-email',
        loadComponent: () =>
          import('./features/auth/verificar-email/verificar-email.component').then(
            (m) => m.VerificarEmailComponent
          ),
        title: 'D-LION | Verificar e-mail',
      },
      {
        path: 'redefinir-senha',
        loadComponent: () =>
          import('./features/auth/redefinir-senha/redefinir-senha.component').then(
            (m) => m.RedefinirSenhaComponent
          ),
        title: 'D-LION | Redefinir senha',
      },
      {
        path: 'oauth/callback',
        loadComponent: () =>
          import('./features/auth/oauth-callback/oauth-callback.component').then(
            (m) => m.OauthCallbackComponent
          ),
        title: 'D-LION | Entrando...',
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'documentos',
        loadChildren: () => import('./features/upload/upload.routes').then((m) => m.UPLOAD_ROUTES),
      },
      {
        path: 'analises',
        loadChildren: () =>
          import('./features/fiscal-analysis/fiscal-analysis.routes').then(
            (m) => m.FISCAL_ANALYSIS_ROUTES
          ),
      },
      {
        path: 'historico',
        loadChildren: () =>
          import('./features/historico/historico.routes').then((m) => m.HISTORICO_ROUTES),
      },
      {
        path: 'planilhas',
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'ia-fiscal',
        loadChildren: () =>
          import('./features/ai-assistant/ai-assistant.routes').then(
            (m) => m.AI_ASSISTANT_ROUTES
          ),
      },
      {
        path: 'configuracoes',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
      },
      {
        path: 'cobrancas',
        loadChildren: () =>
          import('./features/cobrancas/cobrancas.routes').then((m) => m.COBRANCAS_ROUTES),
      },
      {
        path: 'lancamentos',
        loadChildren: () =>
          import('./features/lancamentos/lancamentos.routes').then((m) => m.LANCAMENTOS_ROUTES),
      },
      {
        path: 'apuracao',
        loadChildren: () =>
          import('./features/apuracao/apuracao.routes').then((m) => m.APURACAO_ROUTES),
      },
      {
        path: 'perfil',
        loadChildren: () => import('./features/perfil/perfil.routes').then((m) => m.PERFIL_ROUTES),
      },
    ],
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/errors/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent
      ),
    title: 'D-LION | Acesso negado',
  },
  {
    path: '500',
    loadComponent: () =>
      import('./features/errors/server-error/server-error.component').then(
        (m) => m.ServerErrorComponent
      ),
    title: 'D-LION | Erro interno',
  },
  {
    path: 'sessao-expirada',
    loadComponent: () =>
      import('./features/errors/session-expired/session-expired.component').then(
        (m) => m.SessionExpiredComponent
      ),
    title: 'D-LION | Sessão expirada',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'D-LION | Página não encontrada',
  },
];
