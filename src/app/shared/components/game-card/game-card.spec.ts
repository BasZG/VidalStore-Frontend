import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { GameCard } from './game-card';

describe('GameCard', () => {
  let fixture: ComponentFixture<GameCard>;
  let component: GameCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCard],
    }).compileComponents();

    fixture =
      TestBed.createComponent(GameCard);

    component = fixture.componentInstance;

    component.titulo = 'Juego de prueba';
  });

  it('debe mostrar el titulo', () => {
    fixture.detectChanges();

    const contenido =
      fixture.nativeElement.textContent ?? '';

    expect(contenido).toContain(
      'Juego de prueba',
    );
  });

  it('debe mostrar los datos opcionales cuando existen', () => {
    component.descripcion =
      'Descripción del juego';

    component.genero = 'Acción';
    component.fechaPublicacion =
      '2026-09-19';

    component.precio = 19990;
    component.etiqueta = 'Destacado';

    fixture.detectChanges();

    const contenido =
      fixture.nativeElement.textContent ?? '';

    expect(contenido).toContain(
      'Descripción del juego',
    );

    expect(contenido).toContain(
      'Acción',
    );

    expect(contenido).toContain(
      '2026-09-19',
    );

    expect(contenido).toContain(
      'Destacado',
    );

    expect(contenido).toContain(
      '19.990',
    );
  });

  it('debe mostrar la imagen cuando existe', () => {
    component.imagen =
      'https://example.com/juego.jpg';

    fixture.detectChanges();

    const imagen =
      fixture.nativeElement.querySelector(
        'img',
      ) as HTMLImageElement;

    expect(imagen).toBeTruthy();

    expect(imagen.src).toContain(
      'juego.jpg',
    );

    expect(imagen.alt).toBe(
      'Juego de prueba',
    );
  });

  it('debe mostrar un placeholder cuando no existe imagen', () => {
    fixture.detectChanges();

    const contenido =
      fixture.nativeElement.textContent ?? '';

    expect(contenido).toContain(
      'Sin imagen',
    );

    expect(
      fixture.nativeElement.querySelector(
        'img',
      ),
    ).toBeNull();
  });

  it('debe emitir accion cuando se presiona el boton', () => {
    component.accionTexto = 'Comprar';

    const emitir =
      vi.spyOn(
        component.accion,
        'emit',
      );

    fixture.detectChanges();

    const boton =
      fixture.nativeElement.querySelector(
        'button',
      ) as HTMLButtonElement;

    boton.click();

    expect(emitir).toHaveBeenCalledTimes(
      1,
    );
  });

  it('no debe emitir accion cuando esta deshabilitada', () => {
    component.accionTexto = 'Comprado';
    component.accionDeshabilitada = true;

    const emitir =
      vi.spyOn(
        component.accion,
        'emit',
      );

    fixture.detectChanges();

    const boton =
      fixture.nativeElement.querySelector(
        'button',
      ) as HTMLButtonElement;

    expect(boton.disabled).toBe(true);

    boton.click();

    expect(emitir).not.toHaveBeenCalled();
  });

  it('no debe mostrar boton cuando no existe texto de accion', () => {
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(
        'button',
      ),
    ).toBeNull();
  });
});
