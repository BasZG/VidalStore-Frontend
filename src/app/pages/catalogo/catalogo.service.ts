import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Juego {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  precio: number;
  genero?: string;
  fechaPublicacion?: string;
}

export interface CrearJuego {
  titulo: string;
  descripcion: string;
  imagen: string;
  precio: number;
  genero?: string;
  fechaPublicacion?: string;
}

export type ActualizarJuego = Partial<CrearJuego>;

const GATEWAY_URL = 'http://localhost:8080';

@Injectable({
  providedIn: 'root',
})
export class CatalogoService {
  constructor(private http: HttpClient) {}

  obtenerCatalogo(): Observable<Juego[]> {
    return this.http.get<Juego[]>(`${GATEWAY_URL}/v1/catalogo`);
  }

  crearJuego(juego: CrearJuego): Observable<Juego> {
    return this.http.post<Juego>(
      `${GATEWAY_URL}/v1/catalogo`,
      juego,
    );
  }

  actualizarJuego(
    juegoId: string,
    cambios: ActualizarJuego,
  ): Observable<Juego> {
    return this.http.put<Juego>(
      `${GATEWAY_URL}/v1/catalogo/${encodeURIComponent(juegoId)}`,
      cambios,
    );
  }
}
