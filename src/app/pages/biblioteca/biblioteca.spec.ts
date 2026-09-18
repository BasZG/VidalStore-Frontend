import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Biblioteca } from './biblioteca';
import {
  BibliotecaService,
  Licencia,
} from './biblioteca.service';

describe('Biblioteca', () => {
  let bibliotecaSubject: Subject<Licencia[]>;

  let bibliotecaServiceMock: {
    obtenerBiblioteca: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    bibliotecaSubject = new Subject<Licencia[]>();

    bibliotecaServiceMock = {
      obtenerBiblioteca: vi.fn(() =>
        bibliotecaSubject.asObservable(),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Biblioteca],
      providers: [
        {
          provide: BibliotecaService,
          useValue: bibliotecaServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    const fixture = TestBed.createComponent(Biblioteca);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Cargando biblioteca...',
    );
  });

  it('debe mostrar las licencias del usuario', async () => {
    const fixture = TestBed.createComponent(Biblioteca);

    fixture.detectChanges();

    bibliotecaSubject.next([
      {
        id: 'licencia-1',
        juegoId: 'juego-123',
        usuarioSub: 'usuario-1',
        fechaCreacion: '2026-09-17T20:00:00.000Z',
      },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const contenido =
      fixture.nativeElement.textContent;

    expect(contenido).toContain('juego-123');
    expect(contenido).toContain('licencia-1');
    expect(contenido).not.toContain('usuario-1');
  });

  it('debe mostrar estado vacio', async () => {
    const fixture = TestBed.createComponent(Biblioteca);

    fixture.detectChanges();
    bibliotecaSubject.next([]);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Todavía no tienes juegos en tu biblioteca.',
    );
  });

  it.each([
    [
      401,
      'Tu sesión expiró. Inicia sesión nuevamente.',
    ],
    [
      403,
      'No tienes permiso para consultar la biblioteca.',
    ],
    [
      500,
      'Ocurrió un error al cargar tu biblioteca.',
    ],
  ])(
    'debe manejar el error %i',
    async (status, mensaje) => {
      const fixture =
        TestBed.createComponent(Biblioteca);

      fixture.detectChanges();
      bibliotecaSubject.error({ status });

      await fixture.whenStable();
      fixture.detectChanges();

      expect(
        fixture.nativeElement.textContent,
      ).toContain(mensaje);

      expect(
        fixture.nativeElement.textContent,
      ).toContain('Reintentar');
    },
  );

  it('debe permitir reintentar la carga', async () => {
    const fixture = TestBed.createComponent(Biblioteca);

    fixture.detectChanges();
    bibliotecaSubject.error({ status: 500 });

    await fixture.whenStable();
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    boton.click();

    expect(
      bibliotecaServiceMock.obtenerBiblioteca,
    ).toHaveBeenCalledTimes(2);
  });
});