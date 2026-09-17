import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogoService, Juego } from './catalogo.service';

@Component({
  imports: [CommonModule],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  juegos: Juego[] = [];
  cargando = true;
  error: string | null = null;

  constructor(private catalogoService: CatalogoService) {}

  ngOnInit(): void {
    this.catalogoService.obtenerCatalogo().subscribe({
      next: (juegos) => {
        this.juegos = juegos;
        this.cargando = false;
      },
      error: (err) => {
        this.error =
          err.status === 401
            ? 'Sesión inválida, inicia sesión de nuevo.'
            : err.status === 403
              ? 'No tienes permiso para ver esto.'
              : 'Ocurrió un error al cargar el catálogo.';
        this.cargando = false;
      },
    });
  }
}