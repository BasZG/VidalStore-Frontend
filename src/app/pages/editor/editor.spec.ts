import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CatalogoService, Juego } from '../catalogo/catalogo.service';
import { Editor } from './editor';

describe('Editor', () => {
  const juego: Juego = {
    id: 'juego-1',
    titulo: 'Vidal Quest',
    descripcion: 'Juego de aventura',
    imagen: 'vidal.jpg',
    precio: 12990,
    genero: 'Aventura',
    fechaPublicacion: '2026-09-18',
  };

  let serviceMock: {
    obtenerCatalogo: ReturnType<typeof vi.fn>;
    crearJuego: ReturnType<typeof vi.fn>;
    actualizarJuego: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    serviceMock = {
      obtenerCatalogo: vi.fn(() => of([])),
      crearJuego: vi.fn(() => of(juego)),
      actualizarJuego: vi.fn(() => of(juego)),
    };

    await TestBed.configureTestingModule({
      imports: [Editor],
      providers: [
        {
          provide: CatalogoService,
          useValue: serviceMock,
        },
      ],
    }).compileComponents();
  });

  it('debe mostrar el catalogo obtenido', () => {
    serviceMock.obtenerCatalogo.mockReturnValue(of([juego]));
    const fixture = TestBed.createComponent(Editor);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Vidal Quest');
    expect(fixture.nativeElement.textContent).toContain('12990');
  });

  it('debe mostrar el estado vacio', () => {
    const fixture = TestBed.createComponent(Editor);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay juegos en el catálogo todavía.');
  });

  it('debe crear con precio cero y omitir opcionales vacios', () => {
    const juegoGratuito: Juego = {
      id: 'juego-2',
      titulo: 'Juego gratuito',
      descripcion: 'Juego de prueba',
      imagen: 'gratuito.jpg',
      precio: 0,
    };
    serviceMock.crearJuego.mockReturnValue(of(juegoGratuito));
    const fixture = TestBed.createComponent(Editor);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.formulario.setValue({
      titulo: ' Juego gratuito ',
      descripcion: ' Juego de prueba ',
      imagen: ' gratuito.jpg ',
      precio: 0,
      genero: ' ',
      fechaPublicacion: '',
    });
    component.guardar();

    expect(serviceMock.crearJuego).toHaveBeenCalledWith({
      titulo: 'Juego gratuito',
      descripcion: 'Juego de prueba',
      imagen: 'gratuito.jpg',
      precio: 0,
    });
    expect(component.juegos()).toEqual([juegoGratuito]);
    expect(component.mensaje()).toBe('Juego creado correctamente.');
  });

  it('debe editar usando el id fuera del body', () => {
    const actualizado: Juego = {
      ...juego,
      titulo: 'Vidal Quest actualizado',
    };
    serviceMock.obtenerCatalogo.mockReturnValue(of([juego]));
    serviceMock.actualizarJuego.mockReturnValue(of(actualizado));
    const fixture = TestBed.createComponent(Editor);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.editar(juego);
    component.formulario.controls.titulo.setValue('Vidal Quest actualizado');
    component.guardar();

    expect(serviceMock.actualizarJuego).toHaveBeenCalledWith(
      'juego-1',
      expect.not.objectContaining({ id: expect.anything() }),
    );
    expect(component.juegos()).toEqual([actualizado]);
    expect(component.juegoEditando()).toBeNull();
    expect(component.mensaje()).toBe('Juego actualizado correctamente.');
  });

  it('no debe enviar un formulario invalido', () => {
    const fixture = TestBed.createComponent(Editor);
    fixture.detectChanges();

    fixture.componentInstance.guardar();

    expect(serviceMock.crearJuego).not.toHaveBeenCalled();
    expect(fixture.componentInstance.formulario.touched).toBe(true);
  });

  it.each([
    [400, 'Revisa los datos ingresados.'],
    [401, 'Tu sesión expiró. Inicia sesión nuevamente.'],
    [403, 'No tienes permiso para gestionar el catálogo.'],
    [404, 'El juego ya no existe.'],
  ])('debe mostrar el error HTTP %s al guardar', (status, mensaje) => {
    serviceMock.crearJuego.mockReturnValue(throwError(() => ({ status })));
    const fixture = TestBed.createComponent(Editor);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.formulario.setValue({
      titulo: 'Juego',
      descripcion: 'Descripción',
      imagen: 'juego.jpg',
      precio: 1000,
      genero: '',
      fechaPublicacion: '',
    });
    component.guardar();

    expect(component.error()).toBe(mensaje);
    expect(component.guardando()).toBe(false);
  });
});
