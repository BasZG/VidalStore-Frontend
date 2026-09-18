import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  BibliotecaService,
  Licencia,
} from './biblioteca.service';

describe('BibliotecaService', () => {
  let service: BibliotecaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BibliotecaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(BibliotecaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe comprar enviando solamente juegoId', () => {
    const licencia: Licencia = {
      id: 'licencia-1',
      juegoId: 'juego-123',
      usuarioSub: 'usuario-1',
      fechaCreacion: '2026-09-17T20:00:00.000Z',
    };

    service.comprarJuego('juego-123').subscribe(
      (resultado) => {
        expect(resultado).toEqual(licencia);
      },
    );

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/compras',
    );

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      juegoId: 'juego-123',
    });

    expect(
      Object.keys(req.request.body),
    ).toEqual(['juegoId']);

    req.flush(licencia);
  });

  it('debe obtener la biblioteca sin seleccionar usuario', () => {
    const licencias: Licencia[] = [
      {
        id: 'licencia-1',
        juegoId: 'juego-123',
        usuarioSub: 'usuario-1',
        fechaCreacion: '2026-09-17T20:00:00.000Z',
      },
    ];

    service.obtenerBiblioteca().subscribe(
      (resultado) => {
        expect(resultado).toEqual(licencias);
      },
    );

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/biblioteca',
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toBeNull();

    req.flush(licencias);
  });
});
