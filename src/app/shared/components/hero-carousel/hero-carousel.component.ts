import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SlideCarrossel {
  imagemUrl: string;
  textoAlternativo: string;
}

@Component({
  selector: 'dl-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.scss',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  readonly slides: SlideCarrossel[] = [
    {
      imagemUrl: 'assets/imagens/banner-dados-que-falam.jpg',
      textoAlternativo: 'D-LION - Dados que falam, decisões que transformam',
    },
    {
      imagemUrl: 'assets/imagens/banner-inteligencia-organiza.jpg',
      textoAlternativo: 'D-LION - Inteligência que organiza, gestão que transforma',
    },
    {
      imagemUrl: 'assets/imagens/banner-gestao-simples.jpg',
      textoAlternativo: 'D-LION - Gestão contábil inteligente, simples e completa',
    },
  ];

  readonly atual = signal(0);
  private temporizador?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    this.pararAutoplay();
  }

  irPara(indice: number): void {
    this.atual.set(indice);
    this.reiniciarAutoplay();
  }

  proximo(): void {
    this.atual.set((this.atual() + 1) % this.slides.length);
  }

  anterior(): void {
    this.atual.set((this.atual() - 1 + this.slides.length) % this.slides.length);
  }

  private iniciarAutoplay(): void {
    this.temporizador = setInterval(() => this.proximo(), 5000);
  }

  private pararAutoplay(): void {
    if (this.temporizador) {
      clearInterval(this.temporizador);
    }
  }

  private reiniciarAutoplay(): void {
    this.pararAutoplay();
    this.iniciarAutoplay();
  }
}
