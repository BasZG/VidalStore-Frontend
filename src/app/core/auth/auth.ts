import { Injectable, signal } from '@angular/core';
import {
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';

export type GrupoUsuario =
  | 'jugadores'
  | 'editores'
  | 'administradores';

const GRUPOS_VALIDOS: GrupoUsuario[] = [
  'jugadores',
  'editores',
  'administradores',
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly gruposSignal =
    signal<GrupoUsuario[]>([]);

  readonly grupos = this.gruposSignal.asReadonly();

  iniciarSesion() {
    return signInWithRedirect();
  }

  async cerrarSesion() {
    try {
      await signOut();
    } finally {
      this.gruposSignal.set([]);
    }
  }

  registrarUsuario(email: string, password: string) {
    return signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
  }

  confirmarRegistro(email: string, codigo: string) {
    return confirmSignUp({
      username: email,
      confirmationCode: codigo,
    });
  }

  async obtenerUsuarioActual() {
    try {
      return await getCurrentUser();
    } catch {
      return null;
    }
  }

  async obtenerAtributosUsuario() {
    try {
      return await fetchUserAttributes();
    } catch {
      return null;
    }
  }

  async obtenerAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();

      return (
        session.tokens?.accessToken?.toString() ??
        null
      );
    } catch {
      return null;
    }
  }

  async cargarGrupos(): Promise<GrupoUsuario[]> {
    try {
      const session = await fetchAuthSession();

      const gruposClaim =
        session.tokens?.accessToken?.payload?.[
          'cognito:groups'
        ];

      const grupos = Array.isArray(gruposClaim)
        ? gruposClaim.filter(
            (grupo): grupo is GrupoUsuario =>
              typeof grupo === 'string' &&
              GRUPOS_VALIDOS.includes(
                grupo as GrupoUsuario,
              ),
          )
        : [];

      this.gruposSignal.set(grupos);

      return grupos;
    } catch {
      this.gruposSignal.set([]);
      return [];
    }
  }

  tieneGrupo(grupo: GrupoUsuario): boolean {
    return this.gruposSignal().includes(grupo);
  }
}
