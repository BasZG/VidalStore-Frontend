import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AMPLIFY_AUTH,
  AmplifyAuthPort,
} from './amplify-auth';

export type GrupoUsuario =
  | 'jugadores'
  | 'editores'
  | 'administradores';

export type UsuarioSesion = Awaited<
  ReturnType<AmplifyAuthPort['getCurrentUser']>
>;

export interface PerfilVisible {
  nombre: string | null;
  email: string | null;
}

const GRUPOS_VALIDOS: GrupoUsuario[] = [
  'jugadores',
  'editores',
  'administradores',
];

function obtenerGruposEfectivos(
  gruposClaim: unknown,
): GrupoUsuario[] {
  // Claim ausente:
  // un usuario autenticado recibe el rol mínimo jugadores.
  if (gruposClaim === undefined) {
    return ['jugadores'];
  }

  // Claim presente, pero con un tipo inválido.
  if (!Array.isArray(gruposClaim)) {
    return [];
  }

  // Array válido pero vacío:
  // aplica también el rol mínimo jugadores.
  if (gruposClaim.length === 0) {
    return ['jugadores'];
  }

  // Si el array contiene valores que no son string,
  // consideramos el claim malformado.
  if (
    gruposClaim.some(
      (grupo) => typeof grupo !== 'string',
    )
  ) {
    return [];
  }

  // Los grupos desconocidos se ignoran.
  // Solo conservamos los grupos reconocidos por VidalStore.
  return gruposClaim.filter(
    (grupo): grupo is GrupoUsuario =>
      GRUPOS_VALIDOS.includes(
        grupo as GrupoUsuario,
      ),
  );
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly amplifyAuth = inject(AMPLIFY_AUTH);

  private readonly usuarioSignal =
    signal<UsuarioSesion | null>(null);

  private readonly perfilSignal =
    signal<PerfilVisible | null>(null);

  private readonly gruposSignal =
    signal<GrupoUsuario[]>([]);

  private readonly revisionSesionSignal =
    signal(0);

  readonly usuario =
    this.usuarioSignal.asReadonly();

  readonly perfil =
    this.perfilSignal.asReadonly();

  readonly grupos =
    this.gruposSignal.asReadonly();

  readonly revisionSesion =
    this.revisionSesionSignal.asReadonly();

  readonly autenticado = computed(
    () => this.usuarioSignal() !== null,
  );

  readonly nombreVisible = computed(() => {
    const perfil = this.perfilSignal();

    return (
      perfil?.nombre?.trim() ||
      perfil?.email?.trim() ||
      'Usuario'
    );
  });

  iniciarSesion() {
    return this.amplifyAuth.signInWithRedirect();
  }

  async cerrarSesion() {
    this.invalidarSesion();

    await this.amplifyAuth.signOut();
  }

  invalidarSesion(): void {
    this.revisionSesionSignal.update(
      (revision) => revision + 1,
    );

    this.usuarioSignal.set(null);
    this.perfilSignal.set(null);
    this.gruposSignal.set([]);
  }

  registrarUsuario(
    email: string,
    password: string,
  ) {
    return this.amplifyAuth.signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
  }

  confirmarRegistro(
    email: string,
    codigo: string,
  ) {
    return this.amplifyAuth.confirmSignUp({
      username: email,
      confirmationCode: codigo,
    });
  }

  async cargarSesion(): Promise<boolean> {
    const revisionInicial =
      this.revisionSesionSignal();

    try {
      const [usuario, session] =
        await Promise.all([
          this.amplifyAuth.getCurrentUser(),
          this.amplifyAuth.fetchAuthSession(),
        ]);

      // Evita que una respuesta antigua restaure
      // una sesión que ya fue invalidada.
      if (
        revisionInicial !==
        this.revisionSesionSignal()
      ) {
        return false;
      }

      const accessToken =
        session.tokens?.accessToken;

      if (!accessToken) {
        this.invalidarSesion();
        return false;
      }

      const gruposClaim =
        accessToken.payload?.[
          'cognito:groups'
        ];

      const grupos =
        obtenerGruposEfectivos(
          gruposClaim,
        );

      const idPayload =
        session.tokens?.idToken?.payload;

      const nombre =
        typeof idPayload?.['name'] ===
        'string'
          ? idPayload['name']
          : null;

      const email =
        typeof idPayload?.['email'] ===
        'string'
          ? idPayload['email']
          : null;

      this.usuarioSignal.set(usuario);

      this.perfilSignal.set({
        nombre,
        email,
      });

      this.gruposSignal.set(grupos);

      return true;
    } catch {
      if (
        revisionInicial ===
        this.revisionSesionSignal()
      ) {
        this.invalidarSesion();
      }

      return false;
    }
  }

  async obtenerUsuarioActual(): Promise<
    UsuarioSesion | null
  > {
    const sesionCargada =
      await this.cargarSesion();

    return sesionCargada
      ? this.usuarioSignal()
      : null;
  }

  async obtenerAtributosUsuario() {
    try {
      return await this.amplifyAuth
        .fetchUserAttributes();
    } catch {
      return null;
    }
  }

  async obtenerAccessToken(): Promise<
    string | null
  > {
    const revisionInicial =
      this.revisionSesionSignal();

    try {
      const session =
        await this.amplifyAuth
          .fetchAuthSession();

      // Evita utilizar un token obtenido
      // por una sesión anterior.
      if (
        revisionInicial !==
        this.revisionSesionSignal()
      ) {
        return null;
      }

      const token =
        session.tokens?.accessToken
          ?.toString() ?? null;

      if (!token) {
        this.invalidarSesion();
      }

      return token;
    } catch {
      if (
        revisionInicial ===
        this.revisionSesionSignal()
      ) {
        this.invalidarSesion();
      }

      return null;
    }
  }

  async cargarGrupos(): Promise<
    GrupoUsuario[]
  > {
    const sesionCargada =
      await this.cargarSesion();

    return sesionCargada
      ? this.gruposSignal()
      : [];
  }

  tieneGrupo(
    grupo: GrupoUsuario,
  ): boolean {
    return this.gruposSignal().includes(
      grupo,
    );
  }
}
