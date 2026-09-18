import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AMPLIFY_AUTH,
  AmplifyAuthPort,
} from './amplify-auth';
import { AuthService, UsuarioSesion } from './auth';

describe('AuthService', () => {
  const usuario: UsuarioSesion = {
    username: 'usuario-prueba',
    userId: 'sub-prueba',
  };

  let authMock: {
    [Metodo in keyof AmplifyAuthPort]:
      ReturnType<typeof vi.fn>;
  };
  let service: AuthService;

  function crearSesion(
    grupos: unknown[] = [],
    nombre: unknown = 'Usuario VidalStore',
    email: unknown = 'usuario@vidalstore.cl',
  ) {
    return {
      tokens: {
        accessToken: {
          toString: () => 'access-token-prueba',
          payload: {
            'cognito:groups': grupos,
          },
        },
        idToken: {
          payload: {
            name: nombre,
            email,
          },
        },
      },
    };
  }

  beforeEach(() => {
    authMock = {
      confirmSignUp: vi.fn(),
      fetchAuthSession: vi.fn(
        async () => crearSesion(),
      ),
      fetchUserAttributes: vi.fn(),
      getCurrentUser: vi.fn(async () => usuario),
      signInWithRedirect: vi.fn(),
      signOut: vi.fn(async () => undefined),
      signUp: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AMPLIFY_AUTH,
          useValue: authMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('debe cargar usuario, perfil y grupos en una sola sesion', async () => {
    authMock.fetchAuthSession.mockResolvedValue(
      crearSesion([
        'administradores',
        'grupo-inventado',
        'editores',
        123,
      ]),
    );

    const cargada = await service.cargarSesion();

    expect(cargada).toBe(true);
    expect(service.usuario()).toEqual(usuario);
    expect(service.perfil()).toEqual({
      nombre: 'Usuario VidalStore',
      email: 'usuario@vidalstore.cl',
    });
    expect(service.grupos()).toEqual([
      'administradores',
      'editores',
    ]);
    expect(service.autenticado()).toBe(true);
    expect(service.nombreVisible()).toBe(
      'Usuario VidalStore',
    );
  });

  it('debe devolver el usuario autenticado', async () => {
    const resultado =
      await service.obtenerUsuarioActual();

    expect(resultado).toEqual(usuario);
  });

  it('debe invalidar el estado cuando no existe sesion', async () => {
    await service.cargarSesion();
    authMock.getCurrentUser.mockRejectedValue(
      new Error('No autenticado'),
    );

    const resultado =
      await service.obtenerUsuarioActual();

    expect(resultado).toBeNull();
    expect(service.usuario()).toBeNull();
    expect(service.perfil()).toBeNull();
    expect(service.grupos()).toEqual([]);
    expect(service.autenticado()).toBe(false);
  });

  it('debe obtener el Access Token de la sesion', async () => {
    const token =
      await service.obtenerAccessToken();

    expect(token).toBe('access-token-prueba');
  });

  it('debe invalidar la sesion si falta el Access Token', async () => {
    await service.cargarSesion();
    authMock.fetchAuthSession.mockResolvedValue({
      tokens: {},
    });

    const token =
      await service.obtenerAccessToken();

    expect(token).toBeNull();
    expect(service.usuario()).toBeNull();
    expect(service.perfil()).toBeNull();
    expect(service.grupos()).toEqual([]);
  });

  it('debe usar email cuando name no esta disponible', async () => {
    authMock.fetchAuthSession.mockResolvedValue(
      crearSesion([], null),
    );

    await service.cargarSesion();

    expect(service.nombreVisible()).toBe(
      'usuario@vidalstore.cl',
    );
  });

  it('debe usar Usuario cuando no hay nombre ni email', async () => {
    authMock.fetchAuthSession.mockResolvedValue(
      crearSesion([], null, null),
    );

    await service.cargarSesion();

    expect(service.nombreVisible()).toBe('Usuario');
  });

  it('debe limpiar la sesion aunque signOut falle', async () => {
    await service.cargarSesion();
    authMock.signOut.mockRejectedValue(
      new Error('Error de logout'),
    );

    await expect(
      service.cerrarSesion(),
    ).rejects.toThrow('Error de logout');

    expect(service.usuario()).toBeNull();
    expect(service.perfil()).toBeNull();
    expect(service.grupos()).toEqual([]);
    expect(service.autenticado()).toBe(false);
  });

  it('no debe restaurar una sesion invalidada mientras se cargaba', async () => {
    let resolverUsuario:
      | ((valor: UsuarioSesion) => void)
      | undefined;

    authMock.getCurrentUser.mockReturnValue(
      new Promise<UsuarioSesion>((resolve) => {
        resolverUsuario = resolve;
      }),
    );

    const carga = service.cargarSesion();
    service.invalidarSesion();
    resolverUsuario?.(usuario);

    expect(await carga).toBe(false);
    expect(service.usuario()).toBeNull();
    expect(service.perfil()).toBeNull();
    expect(service.grupos()).toEqual([]);
  });
});
