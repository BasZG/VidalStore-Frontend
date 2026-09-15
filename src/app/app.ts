import { Component, inject, signal } from '@angular/core';
import { RouterLink , RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly authService = inject(AuthService);

  protected readonly usuario = signal<string | null>(null);

  constructor() {
    this.comprobarSesion();
  }

  async iniciarSesion() {
    await this.authService.iniciarSesion();
  }

  async cerrarSesion() {
    await this.authService.cerrarSesion();
  }

  async comprobarSesion() {
    const usuarioActual = await this.authService.obtenerUsuarioActual();

    this.usuario.set(usuarioActual?.username ?? null);
  }
}
