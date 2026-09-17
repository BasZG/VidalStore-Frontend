import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import {
  AuthService,
  GrupoUsuario,
} from '../../../core/auth/auth';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let usuarioActual: { username: string } | null;
  let gruposActuales: GrupoUsuario[];
  let gruposSignal: ReturnType<
    typeof signal<GrupoUsuario[]>
  >;

  let authServiceMock: {
    obtenerUsuarioActual: ReturnType<typeof vi.fn>;
    obtenerAtributosUsuario: ReturnType<typeof vi.fn>;
    cargarGrupos: ReturnType<typeof vi.fn>;
    iniciarSesion: ReturnType<typeof vi.fn>;
    cerrarSesion: ReturnType<typeof vi.fn>;
    grupos: ReturnType<typeof signal<GrupoUsuario[]>>['asReadonly'] extends () => infer T
      ? T
      : never;
  };

  beforeEach(async () => {
    usuarioActual = null;
    gruposActuales = [];
    gruposSignal = signal<GrupoUsuario[]>([]);

    authServiceMock = {
      obtenerUsuarioActual: vi.fn(
        async () => usuarioActual,
      ),
      obtenerAtributosUsuario: vi.fn(
        async () => ({
          email: 'usuario@vidalstore.cl',
          name: 'Usuario VidalStore',
        }),
      ),
      cargarGrupos: vi.fn(async () => {
        gruposSignal.set(gruposActuales);
        return gruposActuales;
      }),
      iniciarSesion: vi.fn(async () => undefined),
      cerrarSesion: vi.fn(async () => undefined),
      grupos: gruposSignal.asReadonly(),
    };

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

  async function renderizar(): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(Navbar);

  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return fixture.nativeElement as HTMLElement;
  }

  it('anonimo debe ver registro e inicio de sesion', async () => {
    const html = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Crear cuenta');
    expect(contenido).toContain('Iniciar sesión');

    expect(contenido).not.toContain('Biblioteca');
    expect(contenido).not.toContain('Editor');
    expect(contenido).not.toContain('Administración');
  });

  it('jugador debe ver catalogo y biblioteca', async () => {
    usuarioActual = {
      username: 'jugador',
    };
    gruposActuales = ['jugadores'];

    const html = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Catálogo');
    expect(contenido).toContain('Biblioteca');

    expect(contenido).not.toContain('Editor');
    expect(contenido).not.toContain('Administración');
  });

  it('editor debe ver la opcion Editor', async () => {
    usuarioActual = {
      username: 'editor',
    };
    gruposActuales = ['editores'];

    const html = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Catálogo');
    expect(contenido).toContain('Biblioteca');
    expect(contenido).toContain('Editor');

    expect(contenido).not.toContain('Administración');
  });

  it('administrador debe ver Editor y Administracion', async () => {
    usuarioActual = {
      username: 'admin',
    };
    gruposActuales = ['administradores'];

    const html = await renderizar();
    const contenido = html.textContent ?? '';

    expect(contenido).toContain('Catálogo');
    expect(contenido).toContain('Biblioteca');
    expect(contenido).toContain('Editor');
    expect(contenido).toContain('Administración');
  });
});
