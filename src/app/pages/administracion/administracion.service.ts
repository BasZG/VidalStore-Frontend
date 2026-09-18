import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LicenciaAdministrativa {
  id: string;
  juegoId: string;
  usuarioSub: string;
  fechaCreacion: string;
}

const GATEWAY_URL = 'http://localhost:8080';

@Injectable({
  providedIn: 'root',
})
export class AdministracionService {
  constructor(private readonly http: HttpClient) {}

  obtenerLicencias(): Observable<
    LicenciaAdministrativa[]
  > {
    return this.http.get<LicenciaAdministrativa[]>(
      `${GATEWAY_URL}/v1/licencias`,
    );
  }

  revocarLicencia(
    licenciaId: string,
  ): Observable<LicenciaAdministrativa> {
    return this.http.delete<LicenciaAdministrativa>(
      `${GATEWAY_URL}/v1/licencias/${encodeURIComponent(licenciaId)}`,
    );
  }
}