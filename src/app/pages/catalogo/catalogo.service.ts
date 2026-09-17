import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Juego {
  juegoId: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  precio: number;
}

const GATEWAY_URL = 'http://localhost:8080';

@Injectable({
  providedIn: 'root',
})
export class CatalogoService {
  constructor(private http: HttpClient) {}

  obtenerCatalogo(): Observable<Juego[]> {
    return this.http.get<Juego[]>(`${GATEWAY_URL}/v1/catalogo`);
  }
}