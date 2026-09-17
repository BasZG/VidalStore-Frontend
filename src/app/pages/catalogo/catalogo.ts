import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { CatalogoService, Juego } from './catalogo.service';

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

  constructor(private catalogoService: CatalogoService) {}

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
}
