import { TestBed } from '@angular/core/testing';
import {
  fetchAuthSession,
  getCurrentUser,
  signOut,
} from 'aws-amplify/auth';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AuthService } from './auth';

vi.mock('aws-amplify/auth', () => ({
  confirmSignUp: vi.fn(),
  fetchAuthSession: vi.fn(),
  fetchUserAttributes: vi.fn(),
  getCurrentUser: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({});

    service = TestBed.inject(AuthService);
  });

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debe devolver el usuario autenticado', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      username: 'usuario-prueba',
      userId: 'sub-prueba',
    } as any);

    const usuario =
      await service.obtenerUsuarioActual();

    expect(usuario).not.toBeNull();
    expect(usuario?.userId).toBe('sub-prueba');
  });

  it('debe devolver null cuando no existe sesion', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(
      new Error('No autenticado'),
    );

    const usuario =
      await service.obtenerUsuarioActual();

    expect(usuario).toBeNull();
  });

  it('debe obtener el Access Token de la sesion', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: {
        accessToken: {
          toString: () => 'access-token-prueba',
          payload: {},
        },
      },
    } as any);

    const token =
      await service.obtenerAccessToken();

    expect(token).toBe(
      'access-token-prueba',
    );
  });

  it('debe devolver null si no puede obtener el Access Token', async () => {
    vi.mocked(fetchAuthSession).mockRejectedValue(
      new Error('Sesion invalida'),
    );

    const token =
      await service.obtenerAccessToken();

    expect(token).toBeNull();
  });

  it('debe aceptar solamente grupos Cognito conocidos', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: {
        accessToken: {
          payload: {
            'cognito:groups': [
              'administradores',
              'grupo-inventado',
              'editores',
              123,
            ],
          },
        },
      },
    } as any);

    const grupos =
      await service.cargarGrupos();

    expect(grupos).toEqual([
      'administradores',
      'editores',
    ]);

    expect(service.grupos()).toEqual([
      'administradores',
      'editores',
    ]);

    expect(
      service.tieneGrupo(
        'administradores',
      ),
    ).toBe(true);

    expect(
      service.tieneGrupo('jugadores'),
    ).toBe(false);
  });

  it('debe limpiar grupos si falla la carga de sesion', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValueOnce({
      tokens: {
        accessToken: {
          payload: {
            'cognito:groups': [
              'administradores',
            ],
          },
        },
      },
    } as any);

    await service.cargarGrupos();

    expect(service.grupos()).toEqual([
      'administradores',
    ]);

    vi.mocked(fetchAuthSession).mockRejectedValueOnce(
      new Error('Sesion vencida'),
    );

    const grupos =
      await service.cargarGrupos();

    expect(grupos).toEqual([]);
    expect(service.grupos()).toEqual([]);
  });

  it('debe limpiar grupos al cerrar sesion incluso si signOut falla', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: {
        accessToken: {
          payload: {
            'cognito:groups': [
              'administradores',
            ],
          },
        },
      },
    } as any);

    await service.cargarGrupos();

    expect(service.grupos()).toEqual([
      'administradores',
    ]);

    vi.mocked(signOut).mockRejectedValue(
      new Error('Error de logout'),
    );

    await expect(
      service.cerrarSesion(),
    ).rejects.toThrow('Error de logout');

    expect(service.grupos()).toEqual([]);
  });
});
