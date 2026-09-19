import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCard } from '../../shared/components/game-card/game-card';

interface Promocion {
  titulo: string;
  descripcion: string;
  imagen: string;
  precio: number;
  genero: string;
  etiqueta: string;
}

@Component({
  imports: [CommonModule, GameCard, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  readonly promociones: Promocion[] = [
    {
      titulo: 'Vidal Quest',
      descripcion:
        'Explora un mundo lleno de desafíos y secretos.',
      imagen: '/images/promociones/aventura.svg',
      precio: 12990,
      genero: 'Aventura',
      etiqueta: 'Destacado',
    },
    {
      titulo: 'Turbo Legends',
      descripcion:
        'Compite en circuitos extremos y alcanza el primer lugar.',
      imagen: '/images/promociones/carreras.svg',
      precio: 9990,
      genero: 'Carreras',
      etiqueta: 'Oferta',
    },
    {
      titulo: 'Kingdom Tactics',
      descripcion:
        'Construye, administra y protege tu propio reino.',
      imagen: '/images/promociones/estrategia.svg',
      precio: 14990,
      genero: 'Estrategia',
      etiqueta: 'Recomendado',
    },
  ];
}
