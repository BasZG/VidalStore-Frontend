import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AuthService } from './auth';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: {
    obtenerUsuarioActual: ReturnType<
      typeof vi.fn
    >;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      obtenerUsuarioActual: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });
  });

  async function ejecutarGuard() {
    const ruta =
      {} as ActivatedRouteSnapshot;

    const estado =
      {} as RouterStateSnapshot;

    return await TestBed.runInInjectionContext(
      () => authGuard(ruta, estado),
    );
  }

  it('permite acceso cuando existe usuario autenticado', async () => {
    authServiceMock.obtenerUsuarioActual.mockResolvedValue(
      {
        username: 'usuario-prueba',
        userId: 'sub-prueba',
      },
    );

    const resultado =
      await ejecutarGuard();

    expect(resultado).toBe(true);

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();
  });

  it('rechaza acceso y redirige cuando no existe sesion', async () => {
    authServiceMock.obtenerUsuarioActual.mockResolvedValue(
      null,
    );

    const resultado =
      await ejecutarGuard();

    expect(resultado).toBe(false);

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith(['/']);
  });
});
