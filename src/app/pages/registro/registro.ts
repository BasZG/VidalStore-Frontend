import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);

  protected email = '';
  protected password = '';
  protected codigo = '';

  protected esperandoCodigo = signal(false);
  protected registroCompleto = signal(false);
  protected mensaje = signal('');
  protected error = signal('');

  async registrar() {
    this.error.set('');
    this.mensaje.set('');

    try {
      const resultado = await this.authService.registrarUsuario(
        this.email,
        this.password
      );

      if (resultado.isSignUpComplete) {
        this.registroCompleto.set(true);
        this.mensaje.set('Cuenta creada correctamente.');
        return;
      }

      this.esperandoCodigo.set(true);
      this.mensaje.set(
        'Cuenta creada. Revisa tu correo e ingresa el código de confirmación.'
      );
    } catch (error) {
      this.error.set(this.obtenerMensajeError(error));
    }
  }

  async confirmar() {
    this.error.set('');

    try {
      const resultado = await this.authService.confirmarRegistro(
        this.email,
        this.codigo
      );

      if (resultado.isSignUpComplete) {
        this.registroCompleto.set(true);
        this.esperandoCodigo.set(false);
        this.mensaje.set('Cuenta confirmada correctamente.');
      }
    } catch (error) {
      this.error.set(this.obtenerMensajeError(error));
    }
  }

  private obtenerMensajeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Ocurrió un error durante el registro.';
  }
}
