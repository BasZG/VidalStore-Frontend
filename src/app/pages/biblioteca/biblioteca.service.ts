import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Licencia {
  id: string;
  juegoId: string;
  usuarioSub: string;
  fechaCreacion: string;
}

const GATEWAY_URL = 'http://localhost:8080';

@Injectable({
  providedIn: 'root',
})
export class BibliotecaService {
  constructor(private readonly http: HttpClient) {}

  comprarJuego(juegoId: string): Observable<Licencia> {
    return this.http.post<Licencia>(
      `${GATEWAY_URL}/v1/compras`,
      {
        juegoId,
      },
    );
  }

  obtenerBiblioteca(): Observable<Licencia[]> {
    return this.http.get<Licencia[]>(
      `${GATEWAY_URL}/v1/biblioteca`,
    );
  }
}