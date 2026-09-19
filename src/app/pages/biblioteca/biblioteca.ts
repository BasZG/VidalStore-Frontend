import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import {
  CatalogoService,
  Juego,
} from '../catalogo/catalogo.service';
import {
  BibliotecaService,
  Licencia,
} from './biblioteca.service';

@Component({
  imports: [CommonModule],
  selector: 'app-biblioteca',
  styleUrl: './biblioteca.css',
  templateUrl: './biblioteca.html',
})
export class Biblioteca implements OnInit {
  licencias = signal<Licencia[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  cargandoCatalogo = signal(true);
  advertenciaCatalogo = signal<string | null>(null);

  private readonly catalogoPorId =
    signal<ReadonlyMap<string, Juego>>(new Map());

  bibliotecaEnriquecida = computed(() => {
    const catalogo = this.catalogoPorId();

    return this.licencias().map((licencia) => ({
      licencia,
      juego: catalogo.get(licencia.juegoId) ?? null,
    }));
  });

  constructor(
    private readonly bibliotecaService: BibliotecaService,
    private readonly catalogoService: CatalogoService,
  ) {}

  ngOnInit(): void {
    this.cargarBiblioteca();
    this.cargarCatalogo();
  }

  cargarBiblioteca(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.bibliotecaService
      .obtenerBiblioteca()
      .subscribe({
        next: (licencias) => {
          this.licencias.set(licencias);
          this.cargando.set(false);
        },
        error: (error) => {
          this.error.set(
            error.status === 401
              ? 'Tu sesión expiró. Inicia sesión nuevamente.'
              : error.status === 403
                ? 'No tienes permiso para consultar la biblioteca.'
                : 'Ocurrió un error al cargar tu biblioteca.',
          );

          this.cargando.set(false);
        },
      });
  }

  cargarCatalogo(): void {
    this.cargandoCatalogo.set(true);
    this.advertenciaCatalogo.set(null);

    this.catalogoService.obtenerCatalogo().subscribe({
      next: (juegos) => {
        this.catalogoPorId.set(
          new Map(
            juegos.map((juego) => [juego.id, juego]),
          ),
        );
        this.cargandoCatalogo.set(false);
      },
      error: () => {
        this.advertenciaCatalogo.set(
          'No pudimos cargar los detalles del catálogo.',
        );
        this.cargandoCatalogo.set(false);
      },
    });
  }
}
