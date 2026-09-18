import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Catalogo } from './catalogo';
import {
  CatalogoService,
  Juego,
} from './catalogo.service';
import {
  BibliotecaService,
  Licencia,
} from '../biblioteca/biblioteca.service';

describe('Catalogo', () => {
  let catalogoSubject: Subject<Juego[]>;
  let compraSubject: Subject<Licencia>;
  let serviceMock: {
    obtenerCatalogo: ReturnType<typeof vi.fn>;
  };
  let bibliotecaServiceMock: {
    comprarJuego: ReturnType<typeof vi.fn>;
  };

  const juegoPrueba: Juego = {
    id: 'juego-123',
    titulo: 'Vidal Quest',
    descripcion: 'Juego de prueba',
    imagen: 'vidal.jpg',
    precio: 12990,
  };

  beforeEach(async () => {
    catalogoSubject = new Subject<Juego[]>();
    compraSubject = new Subject<Licencia>();

    serviceMock = {
      obtenerCatalogo: vi.fn(() =>
        catalogoSubject.asObservable(),
      ),
    };

    bibliotecaServiceMock = {
      comprarJuego: vi.fn(() =>
        compraSubject.asObservable(),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Catalogo],
      providers: [
        {
          provide: CatalogoService,
          useValue: serviceMock,
        },
        {
          provide: BibliotecaService,
          useValue: bibliotecaServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.detectChanges();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Cargando catálogo...',
    );
  });

  it('debe actualizar el DOM cuando llega el catalogo', async () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.detectChanges();

    catalogoSubject.next([
      juegoPrueba,
    ]);

    await fixture.whenStable();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain(
      'Cargando catálogo...',
    );

    expect(compiled.textContent).toContain(
      'Vidal Quest',
    );

    expect(compiled.textContent).toContain(
      'Juego de prueba',
    );

    expect(compiled.textContent).toContain(
      '12990',
    );
  });

  it('debe mostrar estado vacio', async () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.detectChanges();

    catalogoSubject.next([]);

    await fixture.whenStable();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'No hay juegos en el catálogo todavía.',
    );
  });

  it('debe mostrar mensaje de sesion invalida para 401', async () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.detectChanges();

    catalogoSubject.error({
      status: 401,
    });

    await fixture.whenStable();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Sesión inválida, inicia sesión de nuevo.',
    );
  });

  it('debe mostrar mensaje de permisos para 403', async () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.detectChanges();

    catalogoSubject.error({
      status: 403,
    });

    await fixture.whenStable();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'No tienes permiso para ver esto.',
    );
  });

  it('debe mostrar error general para otros fallos', async () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.detectChanges();

    catalogoSubject.error({
      status: 500,
    });

    await fixture.whenStable();

    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Ocurrió un error al cargar el catálogo.',
    );
  });

  it('debe comprar usando el id del juego', async () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.detectChanges();
    catalogoSubject.next([juegoPrueba]);
    await fixture.whenStable();
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    boton.click();
    fixture.detectChanges();

    expect(
      bibliotecaServiceMock.comprarJuego,
    ).toHaveBeenCalledWith('juego-123');

    expect(fixture.componentInstance.compraEnCurso())
      .toBe('juego-123');

    expect(boton.textContent).toContain('Comprando...');
  });

  it('debe mostrar compra exitosa', async () => {
    const fixture = TestBed.createComponent(Catalogo);

    fixture.componentInstance.comprar(juegoPrueba);

    compraSubject.next({
      id: 'licencia-1',
      juegoId: 'juego-123',
      usuarioSub: 'usuario-1',
      fechaCreacion: '2026-09-17T20:00:00.000Z',
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Compraste Vidal Quest correctamente.',
    );

    expect(fixture.componentInstance.compraEnCurso())
      .toBeNull();
  });

  it.each([
    [
      400,
      'No fue posible completar la compra.',
    ],
    [
      401,
      'Tu sesión expiró. Inicia sesión nuevamente.',
    ],
    [
      403,
      'No tienes permiso para comprar este juego.',
    ],
    [
      500,
      'Ocurrió un error al realizar la compra.',
    ],
  ])(
    'debe mostrar el mensaje de compra correspondiente para %i',
    async (status, mensaje) => {
      const fixture = TestBed.createComponent(Catalogo);

      fixture.componentInstance.comprar(juegoPrueba);
      compraSubject.error({ status });

      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(
        mensaje,
      );

      expect(fixture.componentInstance.compraEnCurso())
        .toBeNull();
    },
  );
});
