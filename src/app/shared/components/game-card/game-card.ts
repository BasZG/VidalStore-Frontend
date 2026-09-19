import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-game-card',
  imports: [],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css',
})
export class GameCard {
  @Input({ required: true })
  titulo = '';

  @Input()
  descripcion: string | null = null;

  @Input()
  imagen: string | null = null;

  @Input()
  precio: number | null = null;

  @Input()
  genero: string | null = null;

  @Input()
  fechaPublicacion: string | null = null;

  @Input()
  etiqueta: string | null = null;

  @Input()
  accionTexto: string | null = null;

  @Input()
  accionDeshabilitada = false;

  @Output()
  readonly accion = new EventEmitter<void>();

  protected ejecutarAccion(): void {
    if (this.accionDeshabilitada) {
      return;
    }

    this.accion.emit();
  }

  protected formatearPrecio(
    precio: number,
  ): string {
    return new Intl.NumberFormat(
      'es-CL',
      {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      },
    ).format(precio);
  }
}
