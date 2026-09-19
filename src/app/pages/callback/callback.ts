import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { AuthService } from '../../core/auth/auth';

type EstadoCallback =
  | 'procesando'
  | 'error';

const TIEMPO_MAXIMO_MS = 15_000;
const INTERVALO_REINTENTO_MS = 500;

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './callback.html',
  styleUrl: './callback.css',
})
export class Callback implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private destruido = false;

  protected readonly estado =
    signal<EstadoCallback>('procesando');

  protected readonly mensajeError =
    signal<string | null>(null);

  ngOnInit(): void {
    void this.procesarCallback();
  }

  ngOnDestroy(): void {
    this.destruido = true;
  }

  protected async iniciarSesion(): Promise<void> {
    await this.authService.iniciarSesion();
  }

  protected async volverInicio(): Promise<void> {
    await this.router.navigateByUrl('/');
  }

  private async procesarCallback(): Promise<void> {
    const parametros =
      this.route.snapshot.queryParamMap;

    if (parametros.has('error')) {
      this.mostrarError(
        'No fue posible completar el inicio de sesión.',
      );
      return;
    }

    const inicio = Date.now();

    while (
      !this.destruido &&
      Date.now() - inicio < TIEMPO_MAXIMO_MS
    ) {
      const sesionValida =
        await this.authService.cargarSesion();

      if (this.destruido) {
        return;
      }

      if (sesionValida) {
        await this.router.navigateByUrl('/');
        return;
      }

      await this.esperar(
        INTERVALO_REINTENTO_MS,
      );
    }

    if (!this.destruido) {
      this.mostrarError(
        'El inicio de sesión tardó demasiado. Puedes intentarlo nuevamente.',
      );
    }
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError.set(mensaje);
    this.estado.set('error');
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
