import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Resena, Resenas } from '../../services/resenas';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {

  authService = inject(Auth);
  resenasService = inject(Resenas);
  router = inject(Router);

  resenas = signal<Array<Resena>>([]);
  mensajeError = signal('');
  mensajeExito = signal('');
  editandoId = signal<string | null>(null);
  estrellas = [1, 2, 3, 4, 5];

  get hoy(): string {
    return this.obtenerHoy();
  }

  private obtenerHoy(): string {
    let fecha = new Date();
    let mes = String(fecha.getMonth() + 1).padStart(2, '0');
    let dia = String(fecha.getDate()).padStart(2, '0');
    return fecha.getFullYear() + '-' + mes + '-' + dia;
  }

  promedioCalificacion(): string {
    let lista = this.resenas();
    if (!lista.length) {
      return '0.0';
    }
    let total = lista.reduce((suma, resena) => suma + Number(resena.calificacion), 0);
    return (total / lista.length).toFixed(1);
  }

  porcentajeTotal(calificacion: number | string | null | undefined): string {
    return (Math.max(0, Math.min(5, Number(calificacion) || 0)) / 5) * 100 + '%';
  }

  porcentajeEstrella(calificacion: number | string | null | undefined, posicion: number): string {
    let valor = Number(calificacion) || 0;
    let fraccion = Math.max(0, Math.min(1, valor - (posicion - 1)));
    return fraccion * 100 + '%';
  }

  formatearCalificacion(calificacion: number | string | null | undefined): string {
    return (Number(calificacion) || 0).toFixed(1);
  }

  cambiarCalificacion(valor: string): void {
    let numero = Number(valor);
    if (valor === '' || isNaN(numero)) {
      this.formularioResena.controls.calificacion.setValue('');
      return;
    }
    this.formularioResena.controls.calificacion.setValue(String(this.limitarCalificacion(numero)));
  }

  ajustarCalificacion(delta: number): void {
    let actual = Number(this.formularioResena.value.calificacion) || 1;
    this.formularioResena.controls.calificacion.setValue(String(this.limitarCalificacion(actual + delta)));
  }

  private limitarCalificacion(valor: number): number {
    return Math.round(Math.max(1, Math.min(5, valor)) * 10) / 10;
  }

  formularioResena = new FormGroup({
    nombreRestaurante: new FormControl(''),
    calificacion: new FormControl('1'),
    fechaVisita: new FormControl(''),
    observaciones: new FormControl('')
  });

  ngOnInit(): void {
    this.consultarResenas();
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  consultarResenas(): void {
    this.resenasService.consultarResenas().subscribe({
      next: respuesta => {
        let lista = respuesta.resenas || respuesta.reviews || [];
        this.resenas.set(lista);
      },
      error: error => {
        this.mensajeError.set('No se pudieron consultar las reseñas');
        console.error(error);
      }
    });
  }

  editarResena(resena: Resena): void {
    this.editandoId.set(resena._id);
    let fecha = '';
    if (resena.fechaVisita) {
      fecha = new Date(resena.fechaVisita).toISOString().substring(0, 10);
    }
    this.formularioResena.setValue({
      nombreRestaurante: resena.nombreRestaurante || resena.restaurante || '',
      calificacion: String(resena.calificacion),
      fechaVisita: fecha,
      observaciones: resena.observaciones || resena.comentario || ''
    });
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.formularioResena.reset({ calificacion: '1' });
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  guardarResena(): void {
    let nombreRestaurante = this.formularioResena.value.nombreRestaurante || '';
    let calificacion = Number(this.formularioResena.value.calificacion) || 0;
    let fechaVisita = this.formularioResena.value.fechaVisita || '';
    let observaciones = this.formularioResena.value.observaciones || '';

    if (!nombreRestaurante.trim() || !fechaVisita || !observaciones.trim()) {
      this.mensajeError.set('Todos los campos son obligatorios: Nombre Restaurante, Calificación, Fecha Visita y Observaciones');
      return;
    }

    if (calificacion < 1 || calificacion > 5) {
      this.mensajeError.set('La calificación debe estar entre 1 y 5');
      return;
    }

    if (fechaVisita > this.hoy) {
      this.mensajeError.set('La fecha de visita no puede ser futura');
      return;
    }

    let id = this.editandoId();

    if (id) {
      // Actualizar reseña
      this.resenasService.actualizarResena(id, nombreRestaurante, calificacion, fechaVisita, observaciones).subscribe({
        next: respuesta => {
          let actualizada = respuesta.resena!;
          let lista = this.resenas().map(item => item._id === id ? actualizada : item);
          this.resenas.set(lista);
          this.mensajeExito.set('Reseña actualizada exitosamente');
          this.cancelarEdicion();
        },
        error: error => {
          this.mensajeError.set('No se pudo actualizar la reseña');
          console.error(error);
        }
      });
    } else {
      // Crear reseña
      this.resenasService.crearResena(nombreRestaurante, calificacion, fechaVisita, observaciones).subscribe({
        next: respuesta => {
          this.resenas.update(lista => [...lista, respuesta.resena!]);
          this.mensajeExito.set('Reseña creada exitosamente');
          this.formularioResena.reset({ calificacion: '1' });
          this.mensajeError.set('');
        },
        error: error => {
          this.mensajeError.set('No se pudo crear la reseña');
          console.error(error);
        }
      });
    }
  }

  eliminarResena(id: string): void {
    const respuesta = confirm('¿Estás seguro de que deseas eliminar este registro?');
    if (respuesta) {
      this.resenasService.eliminarResena(id).subscribe({
        next: () => {
          let lista = this.resenas().filter(r => r._id !== id);
          this.resenas.set(lista);
          this.mensajeExito.set('Reseña eliminada');
          if (this.editandoId() === id) {
            this.cancelarEdicion();
          }
        },
        error: error => {
          this.mensajeError.set('No se pudo eliminar la reseña');
          console.error(error);
        }
      });
    }
  }

}
