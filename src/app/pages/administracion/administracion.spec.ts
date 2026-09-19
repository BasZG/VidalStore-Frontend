import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Administracion } from './administracion';
import {
  AdministracionService,
  LicenciaAdministrativa,
} from './administracion.service';

describe('Administracion', () => {
  const licencia: LicenciaAdministrativa = {
    id: 'licencia-1',
    juegoId: 'juego-1',
    usuarioSub: 'usuario-1',
    fechaCreacion: '2026-09-18T12:00:00.000Z',
  };

  let serviceMock: {
    obtenerLicencias: ReturnType<typeof vi.fn>;
    revocarLicencia: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
   vi.restoreAllMocks();
   vi.spyOn(window, 'confirm').mockReturnValue(true);

    serviceMock = {
      obtenerLicencias: vi.fn(() => of([])),
      revocarLicencia: vi.fn(() => of(licencia)),
    };

    await TestBed.configureTestingModule({
      imports: [Administracion],
      providers: [
        {
          provide: AdministracionService,
          useValue: serviceMock,
        },
      ],
    }).compileComponents();
  });

  it('debe mostrar las licencias obtenidas', () => {
    serviceMock.obtenerLicencias.mockReturnValue(
      of([licencia]),
    );
    const fixture =
      TestBed.createComponent(Administracion);

    fixture.detectChanges();

    const contenido =
      fixture.nativeElement.textContent as string;

    expect(contenido).toContain('licencia-1');
    expect(contenido).toContain('juego-1');
    expect(contenido).toContain('usuario-1');
  });

  it('debe mostrar el estado vacio', () => {
    const fixture =
      TestBed.createComponent(Administracion);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No hay usuarios con licencias activas.',
    );
  });

  it('debe mostrar el estado de carga', () => {
    const licenciasSubject =
      new Subject<LicenciaAdministrativa[]>();
    serviceMock.obtenerLicencias.mockReturnValue(
      licenciasSubject.asObservable(),
    );
    const fixture =
      TestBed.createComponent(Administracion);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Cargando licencias...',
    );
  });

  it('debe revocar y quitar la licencia de la vista', () => {
    serviceMock.obtenerLicencias.mockReturnValue(
      of([licencia]),
    );
    const fixture =
      TestBed.createComponent(Administracion);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.revocar(licencia);
    fixture.detectChanges();

    expect(
      serviceMock.revocarLicencia,
    ).toHaveBeenCalledWith('licencia-1');
    expect(component.licencias()).toEqual([]);
    expect(component.mensaje()).toBe(
      'Licencia revocada correctamente.',
    );
    expect(fixture.nativeElement.textContent).not.toContain(
      'usuario-1',
    );
  });

  it('debe bloquear revocaciones mientras hay una en curso', () => {
    const revocacionSubject =
      new Subject<LicenciaAdministrativa>();
    serviceMock.obtenerLicencias.mockReturnValue(
      of([licencia]),
    );
    serviceMock.revocarLicencia.mockReturnValue(
      revocacionSubject.asObservable(),
    );
    const fixture =
      TestBed.createComponent(Administracion);
    fixture.detectChanges();

    fixture.componentInstance.revocar(licencia);
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector(
      'article button',
    ) as HTMLButtonElement;

    expect(boton.disabled).toBe(true);
    expect(boton.textContent).toContain('Revocando...');
  });

  it.each([
    [
      401,
      'Tu sesión expiró. Inicia sesión nuevamente.',
    ],
    [
      403,
      'No tienes permiso para administrar licencias.',
    ],
  ])(
    'debe mostrar el error HTTP %s al cargar',
    (status, mensaje) => {
      serviceMock.obtenerLicencias.mockReturnValue(
        throwError(() => ({ status })),
      );
      const fixture =
        TestBed.createComponent(Administracion);

      fixture.detectChanges();

      expect(fixture.componentInstance.error()).toBe(
        mensaje,
      );
      expect(
        fixture.componentInstance.cargando(),
      ).toBe(false);
    },
  );

  it('debe mostrar 404 al revocar una licencia inexistente', () => {
    serviceMock.obtenerLicencias.mockReturnValue(
      of([licencia]),
    );
    serviceMock.revocarLicencia.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );
    const fixture =
      TestBed.createComponent(Administracion);
    fixture.detectChanges();

    fixture.componentInstance.revocar(licencia);

    expect(fixture.componentInstance.error()).toBe(
      'La licencia ya no existe.',
    );
    expect(
      fixture.componentInstance.licencias(),
    ).toEqual([licencia]);
    expect(
      fixture.componentInstance.licenciaRevocando(),
    ).toBeNull();
  });
});
