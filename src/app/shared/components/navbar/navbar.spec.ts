import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Router,
  provideRouter,
} from '@angular/router';
import { vi } from 'vitest';
import {
  AuthService,
  GrupoUsuario,
  PerfilVisible,
} from '../../../core/auth/auth';
import { Navbar } from './navbar';

describe('Navbar', () => {
  const autenticadoSignal = signal(false);
  const perfilSignal = signal<PerfilVisible | null>(null);
  const nombreVisibleSignal = signal('Usuario');
  const gruposSignal = signal<GrupoUsuario[]>([]);

  const authServiceMock = {
    cargarSesion: vi.fn(),
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    autenticado: autenticadoSignal.asReadonly(),
    perfil: perfilSignal.asReadonly(),
    nombreVisible: nombreVisibleSignal.asReadonly(),
    grupos: gruposSignal.asReadonly(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    autenticadoSignal.set(false);
    perfilSignal.set(null);
    nombreVisibleSignal.set('Usuario');
    gruposSignal.set([]);
    authServiceMock.cargarSesion.mockResolvedValue(false);
    authServiceMock.iniciarSesion.mockResolvedValue(undefined);
    authServiceMock.cerrarSesion.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();
  });

  async function renderizar(): Promise<{
    fixture: ReturnType<typeof TestBed.createComponent<Navbar>>;
    html: HTMLElement;
  }> {
    const fixture = TestBed.createComponent(Navbar);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      html: fixture.nativeElement as HTMLElement,
    };
  }

  function iniciarComo(
    grupos: GrupoUsuario[],
    nombreVisible = 'Usuario VidalStore',
    email = 'usuario@vidalstore.cl',
  ): void {
    autenticadoSignal.set(true);
    gruposSignal.set(grupos);
    nombreVisibleSignal.set(nombreVisible);
    perfilSignal.set({
      nombre:
        nombreVisible === email ? null : nombreVisible,
      email,
    });
    authServiceMock.cargarSesion.mockResolvedValue(true);
  }

  it('anonimo debe ver registro e inicio de sesion', async () => {
    const { html } = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Crear cuenta');
    expect(contenido).toContain('Iniciar sesión');
    expect(contenido).not.toContain('Biblioteca');
    expect(contenido).not.toContain('Editor');
    expect(contenido).not.toContain('Administración');
  });

  it('jugador debe ver catalogo y biblioteca', async () => {
    iniciarComo(['jugadores']);

    const { html } = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Catálogo');
    expect(contenido).toContain('Biblioteca');
    expect(contenido).not.toContain('Editor');
    expect(contenido).not.toContain('Administración');
  });

  it('editor debe ver la opcion Editor', async () => {
    iniciarComo(['editores']);

    const { html } = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Catálogo');
    expect(contenido).toContain('Biblioteca');
    expect(contenido).toContain('Editor');
    expect(contenido).not.toContain('Administración');
  });

  it('administrador debe ver Editor y Administracion', async () => {
    iniciarComo(['administradores']);

    const { html } = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Catálogo');
    expect(contenido).toContain('Biblioteca');
    expect(contenido).toContain('Editor');
    expect(contenido).toContain('Administración');
  });

  it('debe mostrar el nombre visible centralizado', async () => {
    iniciarComo(
      ['jugadores'],
      'Ana Vidal',
      'ana@vidalstore.cl',
    );

    const { html } = await renderizar();

    expect(html.textContent).toContain('Ana Vidal');
  });

  it('debe mostrar el email cuando no existe nombre', async () => {
    iniciarComo(
      ['jugadores'],
      'ana@vidalstore.cl',
      'ana@vidalstore.cl',
    );

    const { html } = await renderizar();

    expect(html.textContent).toContain(
      'ana@vidalstore.cl',
    );
  });

  it('debe navegar al inicio aunque falle el cierre remoto', async () => {
    iniciarComo(['jugadores']);
    authServiceMock.cerrarSesion.mockRejectedValue(
      new Error('Cognito no disponible'),
    );

    const { fixture } = await renderizar();
    const router = TestBed.inject(Router);
    const navegar = vi
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true);

    await fixture.componentInstance.cerrarSesion();

    expect(authServiceMock.cerrarSesion).toHaveBeenCalledOnce();
    expect(navegar).toHaveBeenCalledWith('/');
  });
});
