import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { vi } from 'vitest';
import { AuthService, GrupoUsuario } from './auth';
import { groupGuard } from './group.guard';

describe('groupGuard', () => {
  let authServiceMock: {
    cargarGrupos: ReturnType<typeof vi.fn>;
  };

  let router: Router;

  beforeEach(() => {
    authServiceMock = {
      cargarGrupos: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  function crearRuta(
    grupos: GrupoUsuario[],
  ): ActivatedRouteSnapshot {
    return {
      data: {
        grupos,
      },
    } as unknown as ActivatedRouteSnapshot;
  }

  async function ejecutarGuard(
    gruposPermitidos: GrupoUsuario[],
    gruposUsuario: GrupoUsuario[],
  ) {
    authServiceMock.cargarGrupos.mockResolvedValue(
      gruposUsuario,
    );

    const ruta = crearRuta(gruposPermitidos);
    const estado = {} as RouterStateSnapshot;

    return await TestBed.runInInjectionContext(() =>
      groupGuard(ruta, estado),
    );
  }

  function esperarRedireccion(
    resultado: boolean | UrlTree,
  ) {
    expect(resultado).toBeInstanceOf(UrlTree);

    expect(
      router.serializeUrl(resultado as UrlTree),
    ).toBe('/catalogo');
  }

  it('permite a editor entrar a editor', async () => {
    const resultado = await ejecutarGuard(
      ['editores', 'administradores'],
      ['editores'],
    );

    expect(resultado).toBe(true);
  });

  it('permite a administrador entrar a editor', async () => {
    const resultado = await ejecutarGuard(
      ['editores', 'administradores'],
      ['administradores'],
    );

    expect(resultado).toBe(true);
  });

  it('rechaza a jugador en editor', async () => {
    const resultado = await ejecutarGuard(
      ['editores', 'administradores'],
      ['jugadores'],
    );

    esperarRedireccion(resultado as boolean | UrlTree);
  });

  it('permite a administrador entrar a administracion', async () => {
    const resultado = await ejecutarGuard(
      ['administradores'],
      ['administradores'],
    );

    expect(resultado).toBe(true);
  });

  it('rechaza a editor en administracion', async () => {
    const resultado = await ejecutarGuard(
      ['administradores'],
      ['editores'],
    );

    esperarRedireccion(resultado as boolean | UrlTree);
  });

  it('rechaza usuario autenticado sin grupo', async () => {
    const resultado = await ejecutarGuard(
      ['editores', 'administradores'],
      [],
    );

    esperarRedireccion(resultado as boolean | UrlTree);
  });

  it('rechaza una ruta protegida sin grupos configurados', async () => {
  authServiceMock.cargarGrupos.mockResolvedValue([
    'administradores',
  ]);

  const ruta = {
    data: {},
  } as unknown as ActivatedRouteSnapshot;

  const estado =
    {} as RouterStateSnapshot;

  const resultado =
    await TestBed.runInInjectionContext(() =>
      groupGuard(ruta, estado),
    );

  esperarRedireccion(
    resultado as boolean | UrlTree,
  );

  expect(
    authServiceMock.cargarGrupos,
  ).not.toHaveBeenCalled();
  });
});
