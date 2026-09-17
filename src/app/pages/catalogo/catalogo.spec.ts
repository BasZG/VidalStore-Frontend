import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Catalogo } from './catalogo';
import {
  CatalogoService,
  Juego,
} from './catalogo.service';

describe('Catalogo', () => {
  let catalogoSubject: Subject<Juego[]>;
  let serviceMock: {
    obtenerCatalogo: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    catalogoSubject = new Subject<Juego[]>();

    serviceMock = {
      obtenerCatalogo: vi.fn(() =>
        catalogoSubject.asObservable(),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Catalogo],
      providers: [
        {
          provide: CatalogoService,
          useValue: serviceMock,
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
      {
        id: 'juego-123',
        titulo: 'Vidal Quest',
        descripcion: 'Juego de prueba',
        imagen: 'vidal.jpg',
        precio: 12990,
      },
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
});
