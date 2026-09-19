import { Component, OnInit, inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly menuAbierto = signal(false);
  protected readonly autenticado =
    this.authService.autenticado;
  protected readonly perfil = this.authService.perfil;
  protected readonly nombreVisible =
    this.authService.nombreVisible;
  protected readonly grupos = this.authService.grupos;

  async ngOnInit() {
    await this.authService.cargarSesion();
  }

  async iniciarSesion() {
    await this.authService.iniciarSesion();
  }

  async cerrarSesion() {
    this.menuAbierto.set(false);

    try {
      await this.authService.cerrarSesion();
    } catch {
      // El estado local ya fue limpiado por AuthService.
    }

    await this.router.navigateByUrl('/');
  }

  alternarMenu() {
    this.menuAbierto.update((valor) => !valor);
  }

  protected esEditor(): boolean {
    return (
      this.grupos().includes('editores') ||
      this.grupos().includes('administradores')
    );
  }

  protected esAdministrador(): boolean {
    return this.grupos().includes('administradores');
  }

}
