import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogoService, CrearJuego, Juego } from '../catalogo/catalogo.service';
import { GameCard } from '../../shared/components/game-card/game-card';

@Component({
  imports: [CommonModule, ReactiveFormsModule, GameCard],
  selector: 'app-editor',
  styleUrl: './editor.css',
  templateUrl: './editor.html',
})
export class Editor implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly catalogoService = inject(CatalogoService);

  readonly juegos = signal<Juego[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly juegoEditando = signal<Juego | null>(null);
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly formulario = this.formBuilder.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required],
    imagen: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    genero: [''],
    fechaPublicacion: [''],
  });

  ngOnInit(): void {
    this.cargarJuegos();
  }

  cargarJuegos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.catalogoService.obtenerCatalogo().subscribe({
      next: (juegos) => {
        this.juegos.set(juegos);
        this.cargando.set(false);
      },
      error: (error) => {
        this.mostrarError(error.status);
        this.cargando.set(false);
      },
    });
  }

  editar(juego: Juego): void {
    this.juegoEditando.set(juego);
    this.mensaje.set(null);
    this.error.set(null);

    this.formulario.setValue({
      titulo: juego.titulo,
      descripcion: juego.descripcion,
      imagen: juego.imagen,
      precio: juego.precio,
      genero: juego.genero ?? '',
      fechaPublicacion: juego.fechaPublicacion ?? '',
    });
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
    this.mensaje.set(null);
    this.error.set(null);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensaje.set(null);
    this.error.set(null);

    const datos = this.construirJuego();
    const juegoEditando = this.juegoEditando();
    const operacion = juegoEditando
      ? this.catalogoService.actualizarJuego(juegoEditando.id, datos)
      : this.catalogoService.crearJuego(datos);

    operacion.subscribe({
      next: (juegoGuardado) => {
        this.juegos.update((juegos) =>
          juegoEditando
            ? juegos.map((juego) => (juego.id === juegoGuardado.id ? juegoGuardado : juego))
            : [...juegos, juegoGuardado],
        );

        this.limpiarFormulario();
        this.guardando.set(false);
        this.mensaje.set(
          juegoEditando ? 'Juego actualizado correctamente.' : 'Juego creado correctamente.',
        );
      },
      error: (error) => {
        this.mostrarError(error.status);
        this.guardando.set(false);
      },
    });
  }

  private construirJuego(): CrearJuego {
    const valores = this.formulario.getRawValue();
    const genero = valores.genero.trim();
    const fechaPublicacion = valores.fechaPublicacion.trim();

    return {
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim(),
      imagen: valores.imagen.trim(),
      precio: Number(valores.precio),
      ...(genero ? { genero } : {}),
      ...(fechaPublicacion ? { fechaPublicacion } : {}),
    };
  }

  private limpiarFormulario(): void {
    this.juegoEditando.set(null);
    this.formulario.reset({
      titulo: '',
      descripcion: '',
      imagen: '',
      precio: 0,
      genero: '',
      fechaPublicacion: '',
    });
  }

  private mostrarError(status: number): void {
    this.error.set(
      status === 400
        ? 'Revisa los datos ingresados.'
        : status === 401
          ? 'Tu sesión expiró. Inicia sesión nuevamente.'
          : status === 403
            ? 'No tienes permiso para gestionar el catálogo.'
            : status === 404
              ? 'El juego ya no existe.'
              : 'Ocurrió un error al gestionar el catálogo.',
    );
  }
}
