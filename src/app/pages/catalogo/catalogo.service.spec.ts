import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActualizarJuego,
  CatalogoService,
  CrearJuego,
  Juego,
} from './catalogo.service';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CatalogoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CatalogoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe obtener el catalogo desde el Gateway', () => {
    const juegos: Juego[] = [
      {
        id: 'juego-1',
        titulo: 'Vidal Quest',
        descripcion: 'Juego de aventura',
        imagen: 'vidal.jpg',
        precio: 12990,
      },
    ];

    service.obtenerCatalogo().subscribe((resultado) => {
      expect(resultado).toEqual(juegos);
    });

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/catalogo',
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeNull();

    req.flush(juegos);
  });

  it('debe crear un juego enviando el body exacto', () => {
    const nuevoJuego: CrearJuego = {
      titulo: 'Juego gratuito',
      descripcion: 'Juego de prueba',
      imagen: 'gratuito.jpg',
      precio: 0,
    };

    const juegoCreado: Juego = {
      id: 'juego-2',
      ...nuevoJuego,
    };

    service.crearJuego(nuevoJuego).subscribe((resultado) => {
      expect(resultado).toEqual(juegoCreado);
    });

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/catalogo',
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoJuego);
    expect(Object.keys(req.request.body)).toEqual([
      'titulo',
      'descripcion',
      'imagen',
      'precio',
    ]);

    req.flush(juegoCreado);
  });

  it('debe crear un juego con campos opcionales', () => {
    const nuevoJuego: CrearJuego = {
      titulo: 'Vidal Racing',
      descripcion: 'Juego de carreras',
      imagen: 'racing.jpg',
      precio: 15990,
      genero: 'Carreras',
      fechaPublicacion: '2026-09-18',
    };

    service.crearJuego(nuevoJuego).subscribe();

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/catalogo',
    );

    expect(req.request.body).toEqual(nuevoJuego);

    req.flush({ id: 'juego-3', ...nuevoJuego });
  });

  it('debe actualizar solo los campos enviados sin incluir id', () => {
    const cambios: ActualizarJuego = {
      titulo: 'Título actualizado',
      precio: 0,
    };

    service
      .actualizarJuego('juego/123', cambios)
      .subscribe();

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/catalogo/juego%2F123',
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cambios);
    expect(req.request.body).not.toHaveProperty('id');

    req.flush({
      id: 'juego/123',
      titulo: 'Título actualizado',
      descripcion: 'Juego de prueba',
      imagen: 'juego.jpg',
      precio: 0,
    });
  });
});
