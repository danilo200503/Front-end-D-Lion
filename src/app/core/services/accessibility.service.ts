import { Injectable, effect, signal } from '@angular/core';

export type ModoCor = 'padrao' | 'escala-cinza';

interface PreferenciasAcessibilidade {
  escalaFonte: number;
  altoContraste: boolean;
  modoEscuro: boolean;
  modoCor: ModoCor;
}

const CHAVE_STORAGE = 'dlion-acessibilidade';
const ESCALA_MINIMA = 87.5;
const ESCALA_MAXIMA = 150;
const PASSO_ESCALA = 12.5;

const PADRAO: PreferenciasAcessibilidade = {
  escalaFonte: 100,
  altoContraste: false,
  modoEscuro: false,
  modoCor: 'padrao',
};

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  readonly escalaFonte = signal(PADRAO.escalaFonte);
  readonly altoContraste = signal(PADRAO.altoContraste);
  readonly modoEscuro = signal(PADRAO.modoEscuro);
  readonly modoCor = signal<ModoCor>(PADRAO.modoCor);

  constructor() {
    this.carregarPreferencias();

    effect(() => {
      this.aplicarNoDocumento();
      this.salvarPreferencias();
    });
  }

  aumentarFonte(): void {
    this.escalaFonte.update((valor) => Math.min(ESCALA_MAXIMA, Math.round((valor + PASSO_ESCALA) * 10) / 10));
  }

  diminuirFonte(): void {
    this.escalaFonte.update((valor) => Math.max(ESCALA_MINIMA, Math.round((valor - PASSO_ESCALA) * 10) / 10));
  }

  restaurarFonte(): void {
    this.escalaFonte.set(PADRAO.escalaFonte);
  }

  alternarAltoContraste(): void {
    this.altoContraste.update((valor) => !valor);
  }

  alternarModoEscuro(): void {
    this.modoEscuro.update((valor) => !valor);
  }

  definirModoCor(modo: ModoCor): void {
    this.modoCor.set(modo);
  }

  restaurarTudo(): void {
    this.escalaFonte.set(PADRAO.escalaFonte);
    this.altoContraste.set(PADRAO.altoContraste);
    this.modoEscuro.set(PADRAO.modoEscuro);
    this.modoCor.set(PADRAO.modoCor);
  }

  private aplicarNoDocumento(): void {
    const corpo = document.body;
    (corpo.style as unknown as { zoom: string }).zoom = `${this.escalaFonte()}%`;
    corpo.classList.toggle('dl-a11y-alto-contraste', this.altoContraste());
    corpo.classList.toggle('dl-a11y-escuro', this.modoEscuro());
    corpo.classList.toggle('dl-a11y-escala-cinza', this.modoCor() === 'escala-cinza');
  }

  private salvarPreferencias(): void {
    const preferencias: PreferenciasAcessibilidade = {
      escalaFonte: this.escalaFonte(),
      altoContraste: this.altoContraste(),
      modoEscuro: this.modoEscuro(),
      modoCor: this.modoCor(),
    };

    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(preferencias));
    } catch {
      /* armazenamento indisponível; segue sem persistir */
    }
  }

  private carregarPreferencias(): void {
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE);
      if (!bruto) return;

      const preferencias = JSON.parse(bruto) as Partial<PreferenciasAcessibilidade>;
      if (typeof preferencias.escalaFonte === 'number') this.escalaFonte.set(preferencias.escalaFonte);
      if (typeof preferencias.altoContraste === 'boolean') this.altoContraste.set(preferencias.altoContraste);
      if (typeof preferencias.modoEscuro === 'boolean') this.modoEscuro.set(preferencias.modoEscuro);
      if (preferencias.modoCor === 'padrao' || preferencias.modoCor === 'escala-cinza') {
        this.modoCor.set(preferencias.modoCor);
      }
    } catch {
      /* preferências corrompidas; segue com o padrão */
    }
  }
}
