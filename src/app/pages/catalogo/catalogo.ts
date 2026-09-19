import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { CatalogoService, Juego } from './catalogo.service';
import { BibliotecaService } from '../biblioteca/biblioteca.service';
import { GameCard } from '../../shared/components/game-card/game-card';

@Component({
  imports: [CommonModule, GameCard],
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
  juegosComprados = signal<ReadonlySet<string>>(
    new Set(),
  );
  cargandoBiblioteca = signal(true);
  advertenciaBiblioteca = signal<string | null>(
    null,
  );

  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly bibliotecaService: BibliotecaService,
  ) {}

  ngOnInit(): void {
    this.cargarBiblioteca();

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
    if (
      this.estaComprado(juego.id) ||
      this.compraEnCurso() !== null
    ) {
      return;
    }

    const confirmado = window.confirm(
      `¿Quieres comprar ${juego.titulo}?`,
    );

    if (!confirmado) {
      return;
    }

    this.compraEnCurso.set(juego.id);
    this.mensajeCompra.set(null);
    this.errorCompra.set(null);

    this.bibliotecaService
      .comprarJuego(juego.id)
      .subscribe({
        next: () => {
          this.marcarComoComprado(juego.id);
          this.mensajeCompra.set(
            `Compraste ${juego.titulo} correctamente.`,
          );
          this.compraEnCurso.set(null);
        },
        error: (error) => {
          if (
            error.status === 409 &&
            error.error?.message ===
              'LICENCIA_YA_EXISTE'
          ) {
            this.marcarComoComprado(juego.id);
            this.mensajeCompra.set(
              `${juego.titulo} ya está en tu biblioteca.`,
            );
            this.compraEnCurso.set(null);
            return;
          }

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

  private marcarComoComprado(juegoId: string): void {
    this.juegosComprados.update(
      (actuales) =>
        new Set([...actuales, juegoId]),
    );
  }

  estaComprado(juegoId: string): boolean {
    return this.juegosComprados().has(juegoId);
  }

  private cargarBiblioteca(): void {
    this.bibliotecaService.obtenerBiblioteca().subscribe({
      next: (licencias) => {
        this.juegosComprados.set(
          new Set(
            licencias.map(
              (licencia) => licencia.juegoId,
            ),
          ),
        );
        this.cargandoBiblioteca.set(false);
      },
      error: () => {
        this.advertenciaBiblioteca.set(
          'No pudimos verificar tus juegos comprados.',
        );
        this.cargandoBiblioteca.set(false);
      },
    });
  }

  textoAccion(juegoId: string): string {
    if (this.estaComprado(juegoId)) {
      return 'Comprado';
    }

    if (this.compraEnCurso() === juegoId) {
      return 'Comprando...';
    }

    if (this.cargandoBiblioteca()) {
      return 'Verificando...';
    }

    return 'Comprar';
  }

  accionDeshabilitada(juegoId: string): boolean {
    return (
      this.estaComprado(juegoId) ||
      this.cargandoBiblioteca() ||
      this.compraEnCurso() !== null
    );
  }
}
