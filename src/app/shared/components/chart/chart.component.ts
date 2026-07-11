import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import Chart, { ChartConfiguration, ChartType } from 'chart.js/auto';

const PALETA_DOURADA = ['#C9A227', '#B8912C', '#E5C55C', '#4B5160', '#2E9E5B', '#E0A82E', '#D64545', '#8A8F98'];

@Component({
  selector: 'dl-chart',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [':host { display: block; position: relative; height: 240px; }'],
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) type: ChartType = 'bar';
  @Input({ required: true }) labels: string[] = [];
  @Input({ required: true }) data: number[] = [];
  @Input() label = '';

  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngAfterViewInit(): void {
    this.renderizar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['data'] && !changes['labels']) return;
    if (this.chart) this.renderizar();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderizar(): void {
    this.chart?.destroy();

    const config: ChartConfiguration = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.label,
            data: this.data,
            backgroundColor: this.type === 'line' ? 'rgba(201,162,39,0.15)' : PALETA_DOURADA,
            borderColor: this.type === 'line' ? '#C9A227' : PALETA_DOURADA,
            borderWidth: this.type === 'pie' ? 0 : 2,
            fill: this.type === 'line',
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: this.type === 'pie', position: 'bottom' },
        },
        scales:
          this.type === 'pie'
            ? undefined
            : {
                y: { beginAtZero: true, ticks: { precision: 0 } },
              },
      },
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
