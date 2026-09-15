import { Injectable } from '@angular/core';
import {
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  iniciarSesion() {
    return signInWithRedirect();
  }

  cerrarSesion() {
    return signOut();
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

  async obtenerAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() ?? null;
    } catch {
      return null;
    }
  }
}