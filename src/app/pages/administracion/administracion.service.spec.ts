import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  AdministracionService,
  LicenciaAdministrativa,
} from './administracion.service';

describe('AdministracionService', () => {
  let service: AdministracionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdministracionService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AdministracionService);
    httpTesting = TestBed.inject(
      HttpTestingController,
    );
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe obtener todas las licencias', () => {
    const licencias: LicenciaAdministrativa[] = [
      {
        id: 'licencia-1',
        juegoId: 'juego-1',
        usuarioSub: 'usuario-1',
        fechaCreacion: '2026-09-18T12:00:00.000Z',
      },
    ];

    service.obtenerLicencias().subscribe(
      (resultado) => {
        expect(resultado).toEqual(licencias);
      },
    );

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/licencias',
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeNull();
    expect(req.request.params.keys()).toEqual([]);

    req.flush(licencias);
  });

  it('debe revocar por licenciaId sin enviar body', () => {
    const licencia: LicenciaAdministrativa = {
      id: 'licencia/1',
      juegoId: 'juego-1',
      usuarioSub: 'usuario-1',
      fechaCreacion: '2026-09-18T12:00:00.000Z',
    };

    service.revocarLicencia('licencia/1').subscribe(
      (resultado) => {
        expect(resultado).toEqual(licencia);
      },
    );

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/licencias/licencia%2F1',
    );

    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeNull();

    req.flush(licencia);
  });
});
