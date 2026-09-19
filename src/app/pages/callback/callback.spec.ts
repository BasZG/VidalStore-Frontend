import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
} from '@angular/router';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AuthService } from '../../core/auth/auth';
import { Callback } from './callback';

describe('Callback', () => {
  let authServiceMock: {
    cargarSesion: ReturnType<typeof vi.fn>;
    iniciarSesion: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  let routeMock: {
    snapshot: {
      queryParamMap: ReturnType<
        typeof convertToParamMap
      >;
    };
  };

  beforeEach(async () => {
    vi.useRealTimers();

    authServiceMock = {
      cargarSesion: vi.fn(),
      iniciarSesion: vi.fn(
        async () => undefined,
      ),
    };

    routerMock = {
      navigateByUrl: vi.fn(
        async () => true,
      ),
    };

    routeMock = {
      snapshot: {
        queryParamMap: convertToParamMap({}),
      },
    };

    await TestBed.configureTestingModule({
      imports: [Callback],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: ActivatedRoute,
          useValue: routeMock,
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function configurarParametros(
    parametros: Record<string, string>,
  ): void {
    routeMock.snapshot.queryParamMap =
      convertToParamMap(parametros);
  }

  async function esperarMicrotareas(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  it('debe navegar al inicio cuando la sesion es valida', async () => {
    configurarParametros({
      code: 'codigo-prueba',
      state: 'estado-prueba',
    });

    authServiceMock.cargarSesion.mockResolvedValue(
      true,
    );

    const fixture =
      TestBed.createComponent(Callback);

    fixture.detectChanges();

    await esperarMicrotareas();

    expect(
      authServiceMock.cargarSesion,
    ).toHaveBeenCalled();

    expect(
      routerMock.navigateByUrl,
    ).toHaveBeenCalledWith('/');
  });

it('debe mostrar error recuperable si no puede establecer una sesion', async () => {
  vi.useFakeTimers();

  authServiceMock.cargarSesion.mockResolvedValue(
    false,
  );

  const fixture =
    TestBed.createComponent(Callback);

  fixture.detectChanges();

  await esperarMicrotareas();

  await vi.advanceTimersByTimeAsync(15_000);

  fixture.detectChanges();

  const contenido =
    fixture.nativeElement.textContent ?? '';

  expect(contenido).toContain(
    'No se pudo iniciar sesión',
  );

  expect(contenido).toContain(
    'El inicio de sesión tardó demasiado.',
  );

  expect(contenido).toContain(
    'Iniciar sesión',
  );

  expect(contenido).toContain(
    'Volver al inicio',
  );
  });

  it('debe mostrar error recuperable cuando Cognito devuelve error OAuth', async () => {
    configurarParametros({
      error: 'access_denied',
    });

    const fixture =
      TestBed.createComponent(Callback);

    fixture.detectChanges();

    await esperarMicrotareas();
    fixture.detectChanges();

    const contenido =
      fixture.nativeElement.textContent ?? '';

    expect(contenido).toContain(
      'No se pudo iniciar sesión',
    );

    expect(contenido).toContain(
      'No fue posible completar el inicio de sesión.',
    );

    expect(
      authServiceMock.cargarSesion,
    ).not.toHaveBeenCalled();
  });

  it('debe reintentar hasta encontrar una sesion valida', async () => {
    vi.useFakeTimers();

    configurarParametros({
      code: 'codigo-prueba',
      state: 'estado-prueba',
    });

    authServiceMock.cargarSesion
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const fixture =
      TestBed.createComponent(Callback);

    fixture.detectChanges();

    await esperarMicrotareas();

    expect(
      authServiceMock.cargarSesion,
    ).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(500);

    expect(
      authServiceMock.cargarSesion,
    ).toHaveBeenCalledTimes(2);

    expect(
      routerMock.navigateByUrl,
    ).toHaveBeenCalledWith('/');
  });

  it('debe mostrar timeout si la sesion no aparece dentro del limite', async () => {
    vi.useFakeTimers();

    configurarParametros({
      code: 'codigo-prueba',
      state: 'estado-prueba',
    });

    authServiceMock.cargarSesion.mockResolvedValue(
      false,
    );

    const fixture =
      TestBed.createComponent(Callback);

    fixture.detectChanges();

    await esperarMicrotareas();

    await vi.advanceTimersByTimeAsync(15_000);

    fixture.detectChanges();

    const contenido =
      fixture.nativeElement.textContent ?? '';

    expect(contenido).toContain(
      'No se pudo iniciar sesión',
    );

    expect(contenido).toContain(
      'El inicio de sesión tardó demasiado.',
    );

    expect(
      routerMock.navigateByUrl,
    ).not.toHaveBeenCalled();
  });

  it('no debe continuar procesando despues de destruir el componente', async () => {
    vi.useFakeTimers();

    configurarParametros({
      code: 'codigo-prueba',
      state: 'estado-prueba',
    });

    authServiceMock.cargarSesion
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const fixture =
      TestBed.createComponent(Callback);

    fixture.detectChanges();

    await esperarMicrotareas();

    expect(
      authServiceMock.cargarSesion,
    ).toHaveBeenCalledTimes(1);

    fixture.destroy();

    await vi.advanceTimersByTimeAsync(500);

    expect(
      authServiceMock.cargarSesion,
    ).toHaveBeenCalledTimes(1);

    expect(
      routerMock.navigateByUrl,
    ).not.toHaveBeenCalled();
  });

  it('debe permitir recuperarse iniciando sesion o volviendo al inicio', async () => {
    configurarParametros({
      error: 'access_denied',
    });

    const fixture =
      TestBed.createComponent(Callback);

    fixture.detectChanges();

    await esperarMicrotareas();
    fixture.detectChanges();

    const botones = Array.from(
      fixture.nativeElement.querySelectorAll(
        'button',
      ),
    ) as HTMLButtonElement[];

    expect(botones).toHaveLength(2);

    botones[0].click();

    await esperarMicrotareas();

    expect(
      authServiceMock.iniciarSesion,
    ).toHaveBeenCalledTimes(1);

    botones[1].click();

    await esperarMicrotareas();

    expect(
      routerMock.navigateByUrl,
    ).toHaveBeenCalledWith('/');
  });
});
