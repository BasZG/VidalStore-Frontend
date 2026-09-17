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
});