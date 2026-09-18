import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  AdministracionService,
  LicenciaAdministrativa,
} from './administracion.service';

@Component({
  imports: [CommonModule],
  selector: 'app-administracion',
  styleUrl: './administracion.css',
  templateUrl: './administracion.html',
})
export class Administracion implements OnInit {
  private readonly administracionService = inject(
    AdministracionService,
  );

  readonly licencias = signal<LicenciaAdministrativa[]>(
    [],
  );
  readonly cargando = signal(true);
  readonly licenciaRevocando = signal<string | null>(
    null,
  );
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarLicencias();
  }

  cargarLicencias(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    this.administracionService
      .obtenerLicencias()
      .subscribe({
        next: (licencias) => {
          this.licencias.set(licencias);
          this.cargando.set(false);
        },
        error: (error) => {
          this.error.set(
            this.obtenerMensajeError(
              error.status,
              'cargar',
            ),
          );
          this.cargando.set(false);
        },
      });
  }

  revocar(licencia: LicenciaAdministrativa): void {
    this.licenciaRevocando.set(licencia.id);
    this.error.set(null);
    this.mensaje.set(null);

    this.administracionService
      .revocarLicencia(licencia.id)
      .subscribe({
        next: () => {
          this.licencias.update((licencias) =>
            licencias.filter(
              (actual) => actual.id !== licencia.id,
            ),
          );
          this.licenciaRevocando.set(null);
          this.mensaje.set(
            'Licencia revocada correctamente.',
          );
        },
        error: (error) => {
          this.error.set(
            this.obtenerMensajeError(
              error.status,
              'revocar',
            ),
          );
          this.licenciaRevocando.set(null);
        },
      });
  }

  private obtenerMensajeError(
    status: number,
    accion: 'cargar' | 'revocar',
  ): string {
    if (status === 401) {
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    }

    if (status === 403) {
      return 'No tienes permiso para administrar licencias.';
    }

    if (status === 404 && accion === 'revocar') {
      return 'La licencia ya no existe.';
    }

    return accion === 'cargar'
      ? 'Ocurrió un error al cargar las licencias.'
      : 'Ocurrió un error al revocar la licencia.';
  }
}
