import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly usuario = signal<string | null>(null);
  protected readonly email = signal<string | null>(null);
  protected readonly nombre = signal<string | null>(null);
  protected readonly menuAbierto = signal(false);
  protected readonly grupos = this.authService.grupos;

  async ngOnInit() {
    await this.cargarUsuario();
  }

  async iniciarSesion() {
    await this.authService.iniciarSesion();
  }

  async cerrarSesion() {
    this.menuAbierto.set(false);
    await this.authService.cerrarSesion();
  }

  alternarMenu() {
    this.menuAbierto.update((valor) => !valor);
  }

private async cargarUsuario() {
  const usuarioActual =
    await this.authService.obtenerUsuarioActual();

  if (!usuarioActual) {
    return;
  }

  this.usuario.set(usuarioActual.username);

  await this.authService.cargarGrupos();

  const atributos =
    await this.authService.obtenerAtributosUsuario();

  if (atributos) {
    this.email.set(atributos.email ?? null);
    this.nombre.set(atributos.name ?? null);
  }
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