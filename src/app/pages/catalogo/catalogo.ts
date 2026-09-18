import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { CatalogoService, Juego } from './catalogo.service';
import {
  BibliotecaService,
  Licencia,
} from '../biblioteca/biblioteca.service';

@Component({
  imports: [CommonModule],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  juegos = signal<Juego[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  compraEnCurso = signal<string | null>(null);
  mensajeCompra = signal<string | null>(null);
  errorCompra = signal<string | null>(null);

  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly bibliotecaService: BibliotecaService,
  ) {}

  ngOnInit(): void {
    this.catalogoService.obtenerCatalogo().subscribe({
      next: (juegos) => {
        this.juegos.set(juegos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 401
            ? 'Sesión inválida, inicia sesión de nuevo.'
            : err.status === 403
              ? 'No tienes permiso para ver esto.'
              : 'Ocurrió un error al cargar el catálogo.',
        );

        this.cargando.set(false);
      },
    });
  }

  comprar(juego: Juego): void {
    this.compraEnCurso.set(juego.id);
    this.mensajeCompra.set(null);
    this.errorCompra.set(null);

    this.bibliotecaService
      .comprarJuego(juego.id)
      .subscribe({
        next: (_licencia: Licencia) => {
          this.mensajeCompra.set(
            `Compraste ${juego.titulo} correctamente.`,
          );
          this.compraEnCurso.set(null);
        },
        error: (error) => {
          this.errorCompra.set(
            error.status === 401
              ? 'Tu sesión expiró. Inicia sesión nuevamente.'
              : error.status === 403
                ? 'No tienes permiso para comprar este juego.'
                : error.status === 400
                  ? 'No fue posible completar la compra.'
                  : 'Ocurrió un error al realizar la compra.',
          );

          this.compraEnCurso.set(null);
        },
      });
  }
}
