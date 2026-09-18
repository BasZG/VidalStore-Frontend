import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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

  constructor(
    private readonly bibliotecaService: BibliotecaService,
  ) {}

  ngOnInit(): void {
    this.cargarBiblioteca();
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
}