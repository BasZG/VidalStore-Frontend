import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from './auth';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  const authServiceMock = {
    obtenerAccessToken: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor]),
        ),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(
      HttpTestingController,
    );
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe adjuntar Bearer al Gateway autorizado', async () => {
    authServiceMock.obtenerAccessToken.mockResolvedValue(
      'token-prueba',
    );

    const respuesta = firstValueFrom(
      http.get(
        'http://localhost:8080/v1/catalogo',
      ),
    );

    await Promise.resolve();

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/catalogo',
    );

    expect(
      req.request.headers.get('Authorization'),
    ).toBe('Bearer token-prueba');

    req.flush([]);

    await respuesta;
  });

  it('no debe agregar Authorization si no existe token', async () => {
    authServiceMock.obtenerAccessToken.mockResolvedValue(
      null,
    );

    const respuesta = firstValueFrom(
      http.get(
        'http://localhost:8080/v1/catalogo',
      ),
    );

    await Promise.resolve();

    const req = httpTesting.expectOne(
      'http://localhost:8080/v1/catalogo',
    );

    expect(
      req.request.headers.has('Authorization'),
    ).toBe(false);

    req.flush([]);

    await respuesta;
  });

  it('no debe enviar token directamente al BFF', async () => {
    authServiceMock.obtenerAccessToken.mockResolvedValue(
      'token-prueba',
    );

    const respuesta = firstValueFrom(
      http.get(
        'http://localhost:3001/v1/catalogo',
      ),
    );

    const req = httpTesting.expectOne(
      'http://localhost:3001/v1/catalogo',
    );

    expect(
      req.request.headers.has('Authorization'),
    ).toBe(false);

    expect(
      authServiceMock.obtenerAccessToken,
    ).not.toHaveBeenCalled();

    req.flush([]);

    await respuesta;
  });

  it('no debe enviar token directamente a MSCatalogo', async () => {
    const respuesta = firstValueFrom(
      http.get(
        'http://localhost:3000/v1/catalogo',
      ),
    );

    const req = httpTesting.expectOne(
      'http://localhost:3000/v1/catalogo',
    );

    expect(
      req.request.headers.has('Authorization'),
    ).toBe(false);

    req.flush([]);

    await respuesta;
  });

  it('no debe enviar token directamente a MSBibloteca', async () => {
    const respuesta = firstValueFrom(
      http.get(
        'http://localhost:3003/v1/biblioteca',
      ),
    );

    const req = httpTesting.expectOne(
      'http://localhost:3003/v1/biblioteca',
    );

    expect(
      req.request.headers.has('Authorization'),
    ).toBe(false);

    req.flush([]);

    await respuesta;
  });

  it('debe rechazar un host malicioso parecido al Gateway', async () => {
    authServiceMock.obtenerAccessToken.mockResolvedValue(
      'token-prueba',
    );

    const url =
      'http://localhost:8080@otro.example/v1/catalogo';

    const respuesta = firstValueFrom(
      http.get(url),
    );

    const req = httpTesting.expectOne(url);

    expect(
      req.request.headers.has('Authorization'),
    ).toBe(false);

    expect(
      authServiceMock.obtenerAccessToken,
    ).not.toHaveBeenCalled();

    req.flush([]);

    await respuesta;
  });

  it('no debe adjuntar token fuera de /v1', async () => {
    const url =
      'http://localhost:8080/otra-ruta';

    const respuesta = firstValueFrom(
      http.get(url),
    );

    const req = httpTesting.expectOne(url);

    expect(
      req.request.headers.has('Authorization'),
    ).toBe(false);

    req.flush([]);

    await respuesta;
  });
});
