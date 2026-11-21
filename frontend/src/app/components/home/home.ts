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

  formularioResena = new FormGroup({
    nombreRestaurante: new FormControl(''),
    calificacion: new FormControl(''),
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
    this.formularioResena.reset();
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  guardarResena(): void {
    let nombreRestaurante = this.formularioResena.value.nombreRestaurante || '';
    let calificacion = Number(this.formularioResena.value.calificacion) || 0;
    let fechaVisita = this.formularioResena.value.fechaVisita || '';
    let observaciones = this.formularioResena.value.observaciones || '';

    if (!nombreRestaurante.trim() || !calificacion || !fechaVisita || !observaciones.trim()) {
      this.mensajeError.set('Todos los campos son obligatorios: Nombre Restaurante, Calificación, Fecha Visita y Observaciones');
      return;
    }

    if (calificacion < 1 || calificacion > 5) {
      this.mensajeError.set('La calificación debe estar entre 1 y 5');
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
          this.formularioResena.reset();
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
